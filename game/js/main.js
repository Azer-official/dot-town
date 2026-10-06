/*
 * main.js — Phaser 3 마을 씬: 맵 렌더링, 주인공 이동/충돌, 문 상호작용.
 * 그래픽 정의는 assets.js, 맵/건물 배치는 map.js, 소식 데이터는 data.js, 대화창은 dialogue.js.
 */
(function () {
  var A = DotGame.ASSETS, T = A.TILE_SIZE;
  var FONT = '"Noto Sans KR","Noto Sans CJK KR","Apple SD Gothic Neo","Malgun Gothic","맑은 고딕","NanumGothic","Nanum Gothic",sans-serif';
  var HERO_SPEED = 72;            // 월드 px/초 (= 4.5 타일/초)
  var FEET_W = 10, FEET_H = 6;    // 발밑 충돌 박스
  var DIRS = { down: [0, 1], left: [-1, 0], right: [1, 0], up: [0, -1] };

  // ---------- placeholder 텍스처 생성 ----------
  function canvasTex(scene, key, w, h, draw) {
    if (scene.textures.exists(key)) return false;   // 이미지가 로드되어 있으면 그대로 사용
    var tex = scene.textures.createCanvas(key, w, h);
    draw(tex.getContext(), w, h);
    tex.refresh();
    return true;
  }

  function makeTilePlaceholder(scene, key, def) {
    canvasTex(scene, 'tile_' + key, T, T, function (c) {
      c.fillStyle = def.color; c.fillRect(0, 0, T, T);
      c.fillStyle = def.detail;
      if (key === 'grass') { c.fillRect(3, 4, 1, 2); c.fillRect(11, 9, 1, 2); c.fillRect(7, 13, 1, 1); }
      else if (key === 'path') { c.fillRect(2, 3, 2, 1); c.fillRect(10, 11, 2, 1); c.fillRect(12, 4, 1, 1); }
      else if (key === 'wall') { c.fillRect(0, 7, T, 2); c.fillRect(2, 0, 2, T); c.fillRect(12, 0, 2, T); }
      else if (key === 'water') { c.fillRect(2, 5, 5, 1); c.fillRect(9, 11, 5, 1); }
      else if (key === 'tree') {
        c.clearRect(0, 0, T, T);                                // 투명 배경 (base=grass 위에 겹침)
        c.fillStyle = '#6b4a2f'; c.fillRect(7, 11, 2, 5);
        c.fillStyle = def.color; c.fillRect(2, 1, 12, 11);
        c.fillStyle = def.detail; c.fillRect(4, 3, 3, 3); c.fillRect(9, 6, 3, 3);
      } else if (key === 'flower') {
        c.clearRect(0, 0, T, T);
        c.fillStyle = def.detail; c.fillRect(4, 5, 2, 2); c.fillRect(10, 9, 2, 2); c.fillRect(6, 11, 2, 2);
        c.fillStyle = '#fff6a0'; c.fillRect(11, 4, 2, 2);
      } else if (def.base) {                                   // 기타 장식(투명 배경, base 위에 겹침)
        c.clearRect(0, 0, T, T);
        c.fillStyle = def.color; c.fillRect(2, 2, T - 4, T - 4);
        c.fillStyle = def.detail; c.fillRect(5, 5, T - 10, T - 10);
      } else {                                                 // 기타 바닥 타일
        c.fillRect(3, 7, 4, 2); c.fillRect(10, 7, 4, 2);
      }
    });
  }

  // 주인공/NPC 공용: 16x32 프레임 x (frames 열, rows 행) placeholder 시트
  function makeCharPlaceholder(scene, key, h, skirt) {
    var fw = h.frameWidth, fh = h.frameHeight;
    var created = canvasTex(scene, key, fw * h.frames, fh * h.rows.length, function (c) {
      h.rows.forEach(function (dir, r) {
        for (var f = 0; f < h.frames; f++) {
          var ox = f * fw, oy = r * fh, bob = (f % 2 === 1) ? 1 : 0;
          c.fillStyle = 'rgba(0,0,0,0.25)'; c.fillRect(ox + 3, oy + 29, 10, 3);          // 그림자
          // 다리 (걷기 프레임마다 교차)
          c.fillStyle = h.pants;
          var l = (f === 1) ? 2 : (f === 3 ? -1 : 0), rr = (f === 1) ? -1 : (f === 3 ? 2 : 0);
          c.fillRect(ox + 5, oy + 24 - Math.max(0, l - 1), 3, 6 - Math.max(0, l - 1));
          c.fillRect(ox + 9, oy + 24 - Math.max(0, rr - 1), 3, 6 - Math.max(0, rr - 1));
          // 몸통 (skirt=true 면 치마 모양으로 넓게)
          c.fillStyle = h.color; c.fillRect(ox + 3, oy + 15 - bob, 10, 10);
          if (skirt) c.fillRect(ox + 2, oy + 21 - bob, 12, 5);
          // 머리
          c.fillStyle = h.skin; c.fillRect(ox + 3, oy + 4 - bob, 10, 11);
          c.fillStyle = h.hair; c.fillRect(ox + 3, oy + 3 - bob, 10, 4);
          c.fillStyle = '#222';
          if (dir === 'down') { c.fillRect(ox + 5, oy + 9 - bob, 2, 2); c.fillRect(ox + 9, oy + 9 - bob, 2, 2); }
          else if (dir === 'left') { c.fillStyle = h.hair; c.fillRect(ox + 9, oy + 3 - bob, 4, 9); c.fillStyle = '#222'; c.fillRect(ox + 4, oy + 9 - bob, 2, 2); }
          else if (dir === 'right') { c.fillStyle = h.hair; c.fillRect(ox + 3, oy + 3 - bob, 4, 9); c.fillStyle = '#222'; c.fillRect(ox + 10, oy + 9 - bob, 2, 2); }
          else { c.fillStyle = h.hair; c.fillRect(ox + 3, oy + 3 - bob, 10, 11); }
          if (skirt && dir !== 'up') { c.fillStyle = h.hair; c.fillRect(ox + 2, oy + 5 - bob, 2, 10); c.fillRect(ox + 12, oy + 5 - bob, 2, 10); }
        }
      });
    });
    if (created) {   // 스프라이트시트와 같은 번호(0..N-1)로 프레임 등록
      var tex = scene.textures.get(key);
      for (var r = 0; r < h.rows.length; r++)
        for (var f = 0; f < h.frames; f++) tex.add(r * h.frames + f, 0, f * fw, r * fh, fw, fh);
    }
  }

  function makeBuildingPlaceholder(scene, b) {
    var def = A.buildings[b.id] || { color: '#999', roof: '#555' };
    var w = b.w * T, hgt = b.h * T;
    var dlx = (b.door.x - b.x) * T, dly = (b.door.y - b.y) * T;
    canvasTex(scene, 'bld_' + b.id, w, hgt, function (c) {
      c.fillStyle = def.color; c.fillRect(0, 0, w, hgt);
      c.fillStyle = def.roof; c.fillRect(0, 0, w, T * 2);                       // 지붕 2줄
      c.fillStyle = 'rgba(0,0,0,0.18)';
      for (var x = 0; x < w; x += 4) c.fillRect(x, 0, 1, T * 2);
      c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(0, T * 2 - 2, w, 2);
      c.fillStyle = '#bfe6ff';                                                   // 창문
      [T * 1 - 4, w - T * 2 + 4].forEach(function (wx) { c.fillRect(wx + 2, T * 3 + 2, 10, 8); });
      c.fillStyle = 'rgba(255,255,255,0.85)'; c.fillRect(4, T * 2 + 3, w - 8, 9);   // 간판 판
      c.fillStyle = A.door.color; c.fillRect(dlx + 2, dly + 1, T - 4, T - 1);   // 문
      c.fillStyle = A.door.knob; c.fillRect(dlx + T - 6, dly + 8, 2, 2);
      c.strokeStyle = 'rgba(0,0,0,0.5)'; c.lineWidth = 1; c.strokeRect(0.5, 0.5, w - 1, hgt - 1);
    });
  }

  // ---------- 씬 ----------
  var TownScene = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize: function () { Phaser.Scene.call(this, { key: 'town' }); },

    preload: function () {
      DotGame.assetInfo = {};
      if (!A.USE_IMAGE_ASSETS) return;
      var base = A.BASE_PATH, self = this, chains = {};
      // key → 후보 파일 목록. 실패하면 다음 후보를 큐에 추가, 다 실패하면 create() 에서 placeholder 생성.
      function queue(key, kind, def, frameCfg) {
        var list = DotGame.AssetFiles.candidates(def);
        DotGame.assetInfo[key] = { file: null, tried: [], candidates: list.slice() };
        if (!list.length) return;
        chains[key] = { kind: kind, list: list, frameCfg: frameCfg };
        next(key);
      }
      function next(key) {
        var c = chains[key], rel = c.list.shift();
        DotGame.assetInfo[key].tried.push(rel);
        DotGame.assetInfo[key].pending = rel;
        if (c.kind === 'sheet') self.load.spritesheet(key, base + rel, c.frameCfg);
        else self.load.image(key, base + rel);
      }
      this.load.on('loaderror', function (file) {
        console.warn('[DotGame] 이미지 로드 실패:', file.src);
        var c = chains[file.key];
        if (c && c.list.length) next(file.key);
        else if (DotGame.assetInfo[file.key]) DotGame.assetInfo[file.key].pending = null;
      });
      this.load.on('filecomplete', function (key) {
        var info = DotGame.assetInfo[key];
        if (info && info.pending) { info.file = info.pending; info.pending = null; }
      });
      Object.keys(A.tiles).forEach(function (k) { queue('tile_' + k, 'image', A.tiles[k]); });
      queue('hero', 'sheet', A.hero, { frameWidth: A.hero.frameWidth, frameHeight: A.hero.frameHeight });
      DotGame.BUILDINGS.forEach(function (b) { queue('bld_' + b.id, 'image', A.buildings[b.id]); });
      Object.keys(A.npcs || {}).forEach(function (id) {
        var n = A.npcs[id];
        queue('npc_' + id, 'sheet', n, { frameWidth: n.frameWidth, frameHeight: n.frameHeight });
      });
    },

    create: function () {
      var self = this, rows = DotGame.MAP.rows;
      this.mapW = rows[0].length; this.mapH = rows.length;

      // 텍스처 (로드 안 된 것만 placeholder 생성)
      Object.keys(A.tiles).forEach(function (k) { makeTilePlaceholder(self, k, A.tiles[k]); });
      makeCharPlaceholder(this, 'hero', A.hero, false);
      Object.keys(A.npcs || {}).forEach(function (id) { makeCharPlaceholder(self, 'npc_' + id, A.npcs[id], true); });
      DotGame.BUILDINGS.forEach(function (b) { makeBuildingPlaceholder(self, b); });

      // 맵 문자 → 타일 정의
      var byChar = {};
      Object.keys(A.tiles).forEach(function (k) { byChar[A.tiles[k].char] = k; });

      // 충돌 그리드
      this.solid = [];
      for (var y = 0; y < this.mapH; y++) {
        this.solid.push([]);
        for (var x = 0; x < this.mapW; x++) {
          var key = byChar[rows[y][x]] || 'grass', def = A.tiles[key];
          if (def.base) this.add.image(x * T, y * T, 'tile_' + def.base).setOrigin(0);
          this.add.image(x * T, y * T, 'tile_' + key).setOrigin(0);
          this.solid[y].push(!!def.solid);
        }
      }

      // 건물 + 문 라벨
      this.doors = [];
      DotGame.BUILDINGS.forEach(function (b) {
        self.add.image(b.x * T, b.y * T, 'bld_' + b.id).setOrigin(0).setDepth(1);
        for (var yy = b.y; yy < b.y + b.h; yy++) for (var xx = b.x; xx < b.x + b.w; xx++) self.solid[yy][xx] = true;
        var label = self.add.text((b.x + b.w / 2) * T, (b.y + 2) * T + 7.5, b.name, {
          fontFamily: FONT, fontSize: '27px', fontStyle: 'bold', color: '#2a1a0e'
        }).setOrigin(0.5).setScale(1 / A.SCALE).setDepth(2);
        self.doors.push({ building: b, x: b.door.x, y: b.door.y });
      });

      // NPC (타일 1칸 점유). 스토리 장면이 다른 건물에서 대기 중이면 그 건물 앞(STORY_SPOTS)으로 옮겨 감 → refreshNpcs()
      this.baseSolid = this.solid.map(function (r) { return r.slice(); });
      this.npcs = [];
      (DotGame.NPCS || []).forEach(function (n) {
        var def = A.npcs[n.id] || A.hero, key = A.npcs[n.id] ? 'npc_' + n.id : 'hero';
        var frame = Math.max(0, def.rows.indexOf(n.facing || 'down')) * def.frames;
        var spr = self.add.sprite(n.x * T + T / 2, n.y * T + T - 1, key, frame).setOrigin(0.5, 1).setDepth(9);
        self.solid[n.y][n.x] = true;
        self.npcs.push({ def: n, sprite: spr, x: n.x, y: n.y, where: null, artDef: def });
      });
      this.refreshNpcs();
      DotGame.Dialogue.onAnyClose(function () { self.refreshNpcs(); });

      this.doorMark = this.add.graphics().setDepth(3);

      // 주인공 (위치 = 발밑 가운데)
      var hs = DotGame.MAP.heroStart;
      this.hero = this.add.sprite(hs.x * T + T / 2, hs.y * T + T - 1, 'hero', 0).setOrigin(0.5, 1).setDepth(10);
      this.facing = 'down';
      A.hero.rows.forEach(function (dir, r) {
        var frames = [];
        for (var f = 0; f < A.hero.frames; f++) frames.push({ key: 'hero', frame: r * A.hero.frames + f });
        self.anims.create({ key: 'walk-' + dir, frames: frames, frameRate: A.hero.fps, repeat: -1 });
      });

      // 카메라
      var cam = this.cameras.main;
      cam.setZoom(A.SCALE).setBounds(0, 0, this.mapW * T, this.mapH * T).setRoundPixels(true);
      cam.startFollow(this.hero, true, 1, 1);

      // 입력
      var KC = Phaser.Input.Keyboard.KeyCodes;
      this.keys = this.input.keyboard.addKeys({
        up: KC.UP, down: KC.DOWN, left: KC.LEFT, right: KC.RIGHT,
        w: KC.W, a: KC.A, s: KC.S, d: KC.D, space: KC.SPACE, enter: KC.ENTER, esc: KC.ESC
      });
      var onAction = function (ev) {
        if (ev && ev.preventDefault) ev.preventDefault();   // 상호작용 Space 가 방금 포커스된 학원 입력칸에 공백으로 들어가지 않게
        if (ev && ev.repeat) return;
        if (DotGame.Academy.isOpen() || DotGame.NewsCenter.menuVisible()) return;
        if (DotGame.Dialogue.isOpen()) { DotGame.Dialogue.advance(); return; }
        var tgt = self.activeTarget();
        if (tgt) self.interact(tgt);
      };
      this.input.keyboard.on('keydown-SPACE', onAction);
      this.input.keyboard.on('keydown-ENTER', onAction);
      this.input.keyboard.on('keydown-ESC', function () { DotGame.Dialogue.close(); });

      DotGame.scene = this;
      DotGame.ready = true;
    },

    // 발밑 박스가 막힌 타일과 겹치는지
    blockedAt: function (px, py) {
      var l = px - FEET_W / 2, r = px + FEET_W / 2 - 0.01, t = py - FEET_H, b = py - 0.01;
      for (var ty = Math.floor(t / T); ty <= Math.floor(b / T); ty++)
        for (var tx = Math.floor(l / T); tx <= Math.floor(r / T); tx++) {
          if (tx < 0 || ty < 0 || tx >= this.mapW || ty >= this.mapH) return true;
          if (this.solid[ty][tx]) return true;
        }
      return false;
    },

    // NPC 위치 갱신: 기본 자리 ↔ 스토리 장면 대기 중인 건물 앞 (주인공이 그 칸에 서 있으면 다음 기회에)
    refreshNpcs: function () {
      var self = this, ht = this.hero ? this.heroTile() : null;
      this.npcs.forEach(function (n) {
        var p = DotGame.Story.placement(n.def);
        var tx = p ? p.x : n.def.x, ty = p ? p.y : n.def.y, facing = p ? p.facing : (n.def.facing || 'down');
        n.where = p ? p.location : null;
        if (tx === n.x && ty === n.y) return;
        if (ht && ht.x === tx && ht.y === ty) return;
        if (self.npcs.some(function (o) { return o !== n && o.x === tx && o.y === ty; })) return;
        self.solid[n.y][n.x] = self.baseSolid[n.y][n.x];
        n.x = tx; n.y = ty;
        self.solid[ty][tx] = true;
        n.sprite.setPosition(tx * T + T / 2, ty * T + T - 1);
        n.sprite.setFrame(Math.max(0, n.artDef.rows.indexOf(facing)) * n.artDef.frames);
      });
    },

    heroTile: function () {
      return { x: Math.floor(this.hero.x / T), y: Math.floor((this.hero.y - FEET_H / 2) / T) };
    },

    // 상호작용 대상: 바라보는 타일의 NPC > 바라보는 타일의 문 > 문 바로 아래 타일에 서 있으면 그 문
    activeTarget: function () {
      var d = DIRS[this.facing], cx = this.hero.x, cy = this.hero.y - FEET_H / 2;
      var fx = Math.floor((cx + d[0] * (FEET_W / 2 + 4)) / T), fy = Math.floor((cy + d[1] * (FEET_H / 2 + 4)) / T);
      var ht = this.heroTile(), i;
      for (i = 0; i < this.npcs.length; i++) {
        if (this.npcs[i].x === fx && this.npcs[i].y === fy) return { kind: 'npc', npc: this.npcs[i] };
      }
      for (i = 0; i < this.doors.length; i++) {
        var dr = this.doors[i];
        if ((dr.x === fx && dr.y === fy) || (dr.x === ht.x && dr.y + 1 === ht.y)) return { kind: 'door', door: dr };
      }
      return null;
    },
    activeDoor: function () { var t = this.activeTarget(); return t && t.kind === 'door' ? t.door : null; },

    idleHero: function () {
      this.hero.anims.stop();
      this.hero.setFrame(A.hero.rows.indexOf(this.facing) * A.hero.frames);
    },

    // HTML 입력 오버레이(학원 UI)가 열린 동안 Phaser 키보드를 끈다 (WASD/스페이스 입력이 input 에 들어가도록)
    setUiLock: function (locked) {
      var kb = this.input.keyboard;
      kb.resetKeys();
      kb.enabled = !locked;
      if (locked) kb.disableGlobalCapture(); else kb.enableGlobalCapture();
    },

    interact: function (tgt) {
      var self = this;
      this.idleHero();
      DotGame.UI.prompt(null);
      if (tgt.kind === 'npc') { DotGame.NPC.talk(tgt.npc.def, tgt.npc.where); return; }
      var b = tgt.door.building;
      // 이 건물에서 재생할 스토리 장면 (scene.location = 건물 id). door_mode 'before' 면 장면 후 기본 콘텐츠, 아니면 장면만
      var ds = DotGame.Story.doorScene(b.id);
      if (ds) {
        var before = ds.scene.door_mode === 'before';
        DotGame.Story.play(ds.cid, ds.scene, before ? function () { setTimeout(function () { self.openBuilding(b); }, 0); } : null);
        return;
      }
      this.openBuilding(b);
    },

    // 건물 기본 콘텐츠: 뉴스 센터/분야 메뉴, 학원, 소식 대화 (+ 다 본 뒤 일일 반응 after_news)
    openBuilding: function (b) {
      var self = this;
      if (b.type === 'newscenter' || DotGame.Data.hasCategories(b)) {
        DotGame.NewsCenter.open(b, { lock: function (on) { self.setUiLock(on); },
          onClose: function () { setTimeout(function () { DotGame.Daily.afterNews(b.id); }, 0); } });
        return;
      }
      if (b.type === 'academy') {
        this.setUiLock(true);
        DotGame.Academy.open(function () { self.setUiLock(false); });
        return;
      }
      DotGame.Dialogue.open(DotGame.Data.buildDialogue(b), function () {
        setTimeout(function () { DotGame.Daily.afterNews(b.id); }, 0);
      });
    },

    update: function (time, deltaMs) {
      var dt = Math.min(deltaMs, 50) / 1000, k = this.keys, hero = this.hero;
      this.doorMark.clear();

      if (DotGame.Dialogue.isOpen() || DotGame.Academy.isOpen() || DotGame.NewsCenter.isOpen()) {   // 대화/학원/뉴스 UI 중 이동 잠금
        if (hero.anims.isPlaying) { hero.anims.stop(); hero.setFrame(A.hero.rows.indexOf(this.facing) * A.hero.frames); }
        return;
      }

      var dx = (k.right.isDown || k.d.isDown ? 1 : 0) - (k.left.isDown || k.a.isDown ? 1 : 0);
      var dy = (k.down.isDown || k.s.isDown ? 1 : 0) - (k.up.isDown || k.w.isDown ? 1 : 0);

      if (dx || dy) {
        if (dx && dy) {
          var keep = (this.facing === 'left' && dx < 0) || (this.facing === 'right' && dx > 0) ||
                     (this.facing === 'up' && dy < 0) || (this.facing === 'down' && dy > 0);
          if (!keep) this.facing = dy < 0 ? 'up' : 'down';
        } else this.facing = dx ? (dx < 0 ? 'left' : 'right') : (dy < 0 ? 'up' : 'down');

        var len = Math.sqrt(dx * dx + dy * dy), step = HERO_SPEED * dt / len;
        var nx = hero.x + dx * step, ny = hero.y + dy * step;
        if (!this.blockedAt(nx, hero.y)) hero.x = nx;
        if (!this.blockedAt(hero.x, ny)) hero.y = ny;
        hero.anims.play('walk-' + this.facing, true);
      } else if (hero.anims.isPlaying) {
        hero.anims.stop();
        hero.setFrame(A.hero.rows.indexOf(this.facing) * A.hero.frames);
      }

      var tgt = this.activeTarget(), label = null;
      if (tgt) {
        var pulse = 0.5 + 0.5 * Math.sin(time / 150), mx = tgt.kind === 'npc' ? tgt.npc.x : tgt.door.x, my = tgt.kind === 'npc' ? tgt.npc.y : tgt.door.y;
        this.doorMark.lineStyle(1, 0xfff36b, 0.5 + 0.5 * pulse).strokeRect(mx * T + 0.5, my * T + 0.5, T - 1, T - 1);
        if (tgt.kind === 'npc') label = (tgt.npc.def.name || '???') + (tgt.npc.def.role === '강사' ? ' 강사님' : tgt.npc.def.role === '반장' ? ' 반장님' : '') + '에게 말 걸기';
        else label = tgt.door.building.name + (tgt.door.building.type === 'academy' ? ' 들어가서 공부하기'
          : tgt.door.building.type === 'newscenter' ? ' 들어가서 뉴스 보기'
          : DotGame.Data.hasCategories(tgt.door.building) ? ' 들어가서 종목별 소식 보기' : ' 들어가기');
      }
      DotGame.UI.prompt(label);
    }
  });

  // ---------- DOM UI (HUD, 안내) ----------
  DotGame.UI = {
    _last: undefined,
    _toastTimer: null,
    toast: function (msg, ms) {
      var el = document.getElementById('toast');
      el.textContent = msg;
      el.classList.remove('hidden');
      clearTimeout(this._toastTimer);
      this._toastTimer = setTimeout(function () { el.classList.add('hidden'); }, ms || 3500);
    },
    prompt: function (name) {
      if (name === this._last) return;
      this._last = name;
      var el = document.getElementById('prompt');
      if (!name) { el.classList.add('hidden'); return; }
      el.textContent = 'Space / Enter : ' + name;
      el.classList.remove('hidden');
    },
    dateHud: function () {
      var S = DotGame.Save, d = S.data, el = document.getElementById('hud-date');
      if (!d) return;
      var t = S.todayKST();
      el.textContent = '날짜 ' + t + ' (' + S.weekday(t) + ') KST · ' + d.day + '일차' +
        (S.isFakeDate() ? ' · 가짜 날짜(?date)' : '') + (S.storageOk() ? '' : ' · 저장 불가(메모리)');
      el.classList.toggle('warn', S.isFakeDate() || !S.storageOk());
    },
    hud: function (st) {
      var n = st.news, el = document.getElementById('hud');
      var parts = [];
      if (st.source === 'news.json') parts.push('데이터: news.json');
      else if (st.source === 'news.js') parts.push('데이터: news.js (대체본)');
      else parts.push('데이터 없음');
      if (n && n.updated_at) parts.push('업데이트 ' + String(n.updated_at).replace('T', ' ').slice(0, 16));
      if (n && n.is_sample) parts.push('예시 데이터');
      el.textContent = parts.join(' · ');
      el.classList.toggle('warn', st.source !== 'news.json');
      if (st.source === 'news.js' && location.protocol === 'file:') {
        el.title = 'file:// 로 열려 news.js 를 사용 중. 최신 데이터는 README 의 로컬 서버 실행 방법 참고.';
      }
      if (st.source === 'none' || st.warnings.length) {
        var w = document.getElementById('warn');
        w.textContent = (st.error || '') + (st.warnings.length ? ' ' + st.warnings.join(' ') : '');
        w.classList.remove('hidden');
      }
    }
  };

  // 디버그/테스트용 읽기 전용 상태
  DotGame.debug = {
    hero: function () {
      var s = DotGame.scene; if (!s) return null;
      var t = s.heroTile(), tg = s.activeTarget();
      return { x: s.hero.x, y: s.hero.y, tileX: t.x, tileY: t.y, facing: s.facing,
        door: tg && tg.kind === 'door' ? tg.door.building.id : null, npc: tg && tg.kind === 'npc' ? tg.npc.def.id : null };
    },
    academy: function () { return DotGame.Academy.info(); },
    newscenter: function () { return DotGame.NewsCenter.info(); },
    art: function () {
      return { season: DotGame.season, assets: JSON.parse(JSON.stringify(DotGame.assetInfo || {})), portraits: DotGame.Portraits.state() };
    },
    study: function () { var st = DotGame.Data.study; return { source: st.source, error: st.error, materials: Object.keys(st.materials) }; },
    story: function () { var st = DotGame.Data.story; return Object.assign({ source: st.source, error: st.error }, DotGame.Data.story.data ? DotGame.Story.state() : {}); },
    daily: function () { return DotGame.Daily.state(); },
    npcs: function () { var s = DotGame.scene; return s ? s.npcs.map(function (n) { return { id: n.def.id, x: n.x, y: n.y, where: n.where }; }) : []; },
    save: function () {
      var S = DotGame.Save;
      return { data: JSON.parse(JSON.stringify(S.data)), today: S.todayKST(), fake: S.isFakeDate(), storageOk: S.storageOk(),
        didReset: S.didReset(), error: S.lastError(), url: location.href };
    },
    dialogue: function () { return DotGame.Dialogue.info(); },
    data: function () { var st = DotGame.Data.state; return { source: st.source, error: st.error, warnings: st.warnings.slice() }; }
  };

  // ---------- 부팅: 데이터 로드 → 게임 시작 ----------
  function boot() {
    DotGame.Save.init();
    DotGame.season = DotGame.Season.current();
    DotGame.Portraits.init();
    DotGame.UI.dateHud();
    DotGame.Save.onDayChange(function () { DotGame.UI.dateHud(); });
    DotGame.Data.load().then(function (st) {
      DotGame.UI.hud(st);
      DotGame.Story.updateStages();      // 호감도 단계 (날짜 조건 포함) 계산 → 세이브
      DotGame.Save.onDayChange(function () { DotGame.Story.updateStages(); if (DotGame.scene) DotGame.scene.refreshNpcs(); });
      // file:// 에서는 XHR 이미지 로드가 CORS 로 막히고, <img> 로 읽은 이미지는 WebGL 업로드가 막힌다.
      // → file:// 일 때만 <img> 로더 + Canvas 렌더러 사용 (http(s) 에서는 기존대로 XHR + WebGL 자동)
      var isFile = location.protocol === 'file:';
      DotGame.game = new Phaser.Game({
        type: isFile ? Phaser.CANVAS : Phaser.AUTO,
        loader: isFile ? { imageLoadType: 'HTMLImageElement' } : {},
        parent: 'game',
        width: 960, height: 576,
        pixelArt: true,
        backgroundColor: '#1d2b16',
        banner: false,
        scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.NO_CENTER },
        scene: [TownScene]
      });
    });
  }

  if (typeof Phaser === 'undefined') {
    document.getElementById('warn').textContent = 'lib/phaser.min.js 를 불러오지 못했습니다. game/lib/ 에 Phaser 3 파일이 있는지 확인하세요.';
    document.getElementById('warn').classList.remove('hidden');
  } else if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else boot();
})();
