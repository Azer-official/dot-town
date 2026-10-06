/*
 * story.js — 스토리 엔진. data/story/story.json 의 장면(scenes)을 언제·어디서·어떻게 재생할지 정한다.
 *   상세 형식: docs/DATA_FORMAT.md 3장, docs/NPCS.md, 세이브: docs/SAVE_FORMAT.md (save.story / save.daily)
 *
 * 장면 재생 조건 (모두 AND)
 *   - requires_flags / excludes_flags. 'date_reached_YYYY-MM-DD' 플래그는 가상 플래그로, 오늘(KST) ≥ 그 날짜이면 켜진 것으로 본다.
 *     (스토리 봇이 날짜 트리거 지원 전에 쓰던 방식. 그대로 동작)
 *   - available_from (YYYY-MM-DD, KST, Save.todayKST() → ?date= 로 시험 가능) / available_until (이 날짜까지)
 *   - 밀린 이벤트: available_from 이 오늘보다 이전인데 아직 안 풀린 장면은 '밀린 이벤트'.
 *     게임 속 하루(플레이 날짜)에 하나씩, 오래된 순서로 풀린다. 오늘 날짜의 장면은 바로 풀린다.
 *   - stage: 그 캐릭터의 호감도 단계가 이 단계 이상일 때 (단계 정의가 있을 때만)
 *   - 한 번 재생한 장면은 다시 재생하지 않음 (repeatable: true 면 반복)
 * 장소
 *   - 장면 location 이 캐릭터의 기본 장소(characters.<id>.location, 없으면 map.js NPC location)와 같거나 없으면 → NPC 에게 말 걸 때
 *   - 다른 건물 id 이면 → 그 건물 문에서 상호작용할 때. door_mode: 'instead'(기본, 건물 기본 콘텐츠 대신) | 'before'(장면 후 기본 콘텐츠)
 *     그 장면이 대기 중이면 NPC 는 그 건물 앞(map.js STORY_SPOTS)에 나타나고, 거기서 말 걸어도 재생된다.
 * 대사 줄
 *   - "문자열" | {speaker, text, portrait?, narration?} | {choices:[{id?, text, lines?, set_flags?, affection?}], prompt?}
 *   - 나레이션: narration: true 또는 speaker 가 공백뿐('　' 전각 공백 포함) → 이름표·초상화 없이 다른 스타일
 *   - 선택지: 반응만 다르고, 반응 대사 후 장면은 똑같이 이어진다. 고른 id 는 세이브 story.choices 에 기록
 *   - late_lines: 장면이 available_from 보다 늦게 재생되면 lines 대신 사용 ("늦었지만…" 버전)
 * 호감도 단계
 *   - story.json 최상위 affection_stages.<캐릭터id> 또는 characters.<id>.stages = [{id, name?, min_affection?, from?, requires_flags?}]
 *   - 앞에서부터 조건을 모두 만족하는 데까지가 현재 단계. 세이브에 저장되고 내려가지 않음.
 *   - 바뀌면 DotGame.Story.onStageChange(fn) 콜백 + window 이벤트 'dotgame:stagechange' + 화면 알림
 */
window.DotGame = window.DotGame || {};

DotGame.Story = (function () {
  var DATE_FLAG = /^date_reached_(\d{4}-\d{2}-\d{2})$/;
  var stageListeners = [];

  function S() { return DotGame.Save; }
  function data() { return DotGame.Data.story.data; }
  function today() { return S().todayKST(); }
  function st() { return S().data.story; }
  function isObj(v) { return v && typeof v === 'object' && !Array.isArray(v); }
  function arr(v) { return Array.isArray(v) ? v : []; }
  function chars() { var d = data(); return d && isObj(d.characters) ? d.characters : {}; }
  function key(cid, sc) { return cid + '/' + sc.id; }
  function npcDef(cid) { return (DotGame.NPCS || []).filter(function (n) { return n.id === cid; })[0] || null; }

  // story.json 캐릭터 항목 찾기: id → NPC storyKeys(별칭)
  function charKey(cid) {
    var c = chars(), n = npcDef(cid), keys = [cid].concat(n && n.storyKeys ? n.storyKeys : []);
    for (var i = 0; i < keys.length; i++) if (isObj(c[keys[i]])) return keys[i];
    return null;
  }
  function character(cid) { var k = charKey(cid); return k ? chars()[k] : null; }
  function homeOf(cid) {
    var ch = character(cid), n = npcDef(cid);
    return (ch && ch.location) || (n && n.location) || null;
  }

  // ---------- 플래그 / 날짜 ----------
  function hasFlag(f) {
    var m = DATE_FLAG.exec(f);
    if (m) return today() >= m[1];
    return S().hasFlag(f);
  }
  function flagsOk(o) {
    return arr(o.requires_flags).every(hasFlag) && !arr(o.excludes_flags).some(hasFlag);
  }
  function untilOk(sc) { return !sc.available_until || today() <= sc.available_until; }

  // ---------- 호감도 단계 ----------
  function stageDefs(cid) {
    var d = data(), k = charKey(cid) || cid;
    if (d && isObj(d.affection_stages) && Array.isArray(d.affection_stages[k])) return d.affection_stages[k];
    var ch = character(cid);
    return ch && Array.isArray(ch.stages) ? ch.stages : [];
  }
  function stageIdx(defs, id) { for (var i = 0; i < defs.length; i++) if (defs[i] && defs[i].id === id) return i; return -1; }
  function stageCondOk(cid, def) {
    if (!isObj(def)) return false;
    var aff = S().data.affection[cid] || 0;
    if (typeof def.min_affection === 'number' && aff < def.min_affection) return false;
    if (def.from && today() < def.from) return false;
    return arr(def.requires_flags).every(hasFlag);
  }
  // 현재 단계 (세이브 값과 계산 값 중 높은 쪽)
  function currentStage(cid) {
    var defs = stageDefs(cid);
    if (!defs.length) return null;
    var saved = st().stages[cid], si = saved ? stageIdx(defs, saved.id) : -1, ci = -1;
    for (var i = 0; i < defs.length; i++) { if (stageCondOk(cid, defs[i])) ci = i; else break; }
    var idx = Math.max(si, ci);
    return idx >= 0 ? defs[idx] : null;
  }
  // 단계 재계산 → 바뀌었으면 저장 + 훅
  function updateStages() {
    var changed = [];
    Object.keys(chars()).concat(Object.keys((data() || {}).affection_stages || {})).forEach(function (k) {
      var cid = k;
      (DotGame.NPCS || []).forEach(function (n) { if (n.storyKeys && n.storyKeys.indexOf(k) >= 0) cid = n.id; });
      if (changed.some(function (c) { return c.character === cid; })) return;
      var defs = stageDefs(cid);
      if (!defs.length) return;
      var cur = currentStage(cid), saved = st().stages[cid];
      if (cur && (!saved || saved.id !== cur.id)) {
        st().stages[cid] = { id: cur.id, since: today() };
        changed.push({ character: cid, from: saved ? saved.id : null, to: cur.id, name: cur.name || cur.id, initial: !saved });
      }
    });
    if (changed.length) {
      S().persist();
      changed.forEach(function (c) {
        stageListeners.forEach(function (fn) { try { fn(c); } catch (e) { console.warn('[DotGame] stage hook', e); } });
        try { window.dispatchEvent(new CustomEvent('dotgame:stagechange', { detail: c })); } catch (e) {}
        if (!c.initial && DotGame.UI && DotGame.UI.toast) {
          var ch = character(c.character);
          DotGame.UI.toast(((ch && ch.name) || c.character) + '와(과)의 관계: ' + c.name);
        }
      });
    }
    return changed;
  }
  function stageOk(cid, sc) {
    if (!sc.stage) return true;
    var defs = stageDefs(cid), need = stageIdx(defs, sc.stage);
    if (!defs.length || need < 0) return true;     // 단계 정의가 없으면 stage 는 메타데이터로만 취급
    var cur = currentStage(cid);
    return !!cur && stageIdx(defs, cur.id) >= need;
  }

  // ---------- 날짜 트리거 + 밀린 이벤트 ----------
  function allScenes() {
    var out = [], c = chars();
    Object.keys(c).forEach(function (k) {
      var cid = k;
      (DotGame.NPCS || []).forEach(function (n) { if (n.storyKeys && n.storyKeys.indexOf(k) >= 0) cid = n.id; });
      arr(c[k].scenes).forEach(function (sc, order) { if (isObj(sc) && sc.id) out.push({ cid: cid, sc: sc, order: order }); });
    });
    return out;
  }
  function seen(cid, sc) { return !!st().seen[key(cid, sc)]; }
  function baseOk(cid, sc) {     // 날짜 풀림 여부를 뺀 나머지 조건
    return (sc.repeatable || !seen(cid, sc)) && flagsOk(sc) && untilOk(sc) && stageOk(cid, sc);
  }
  // 하루에 밀린 이벤트 하나 풀기 (오래된 순, 지금 조건이 맞는 것만; 풀렸지만 아직 안 본 밀린 이벤트가 있으면 대기)
  function processBacklog() {
    var s = st(), t = today();
    if (s.backlog_day === t) return null;
    var list = allScenes().filter(function (x) { return x.sc.available_from && x.sc.available_from < t; });
    var pending = list.some(function (x) {
      var r = s.released[key(x.cid, x.sc)];
      return r && r > x.sc.available_from && !seen(x.cid, x.sc) && baseOk(x.cid, x.sc);
    });
    if (pending) return null;
    var cand = list.filter(function (x) { return !s.released[key(x.cid, x.sc)] && baseOk(x.cid, x.sc); });
    cand.sort(function (a, b) { return a.sc.available_from < b.sc.available_from ? -1 : a.sc.available_from > b.sc.available_from ? 1 : a.order - b.order; });
    if (!cand.length) return null;
    var k = key(cand[0].cid, cand[0].sc);
    s.released[k] = t; s.backlog_day = t;
    S().persist();
    return k;
  }
  function released(cid, sc) {
    var from = sc.available_from;
    if (!from) return true;
    var t = today(), k = key(cid, sc);
    if (from > t) return false;
    if (st().released[k]) return true;
    if (from === t) { st().released[k] = t; S().persist(); return true; }
    return false;     // 지난 날짜 → 밀린 이벤트 큐 (processBacklog)
  }
  function available(cid, sc) { return baseOk(cid, sc) && released(cid, sc); }

  // 장면 장소: 기본 장소(NPC 대화)인지, 다른 건물(문 상호작용)인지
  function sceneLoc(cid, sc) { return sc.location || homeOf(cid); }
  function isDoorScene(cid, sc) { var l = sceneLoc(cid, sc); return !!l && l !== homeOf(cid) && !!buildingById(l); }
  function buildingById(id) { return (DotGame.BUILDINGS || []).filter(function (b) { return b.id === id; })[0] || null; }

  function availableScenes(cid) {
    processBacklog();
    var ch = character(cid);
    return ch ? arr(ch.scenes).filter(function (sc) { return isObj(sc) && sc.id && available(cid, sc); }) : [];
  }
  // NPC 에게 말 걸 때 재생할 장면. where = 지금 NPC 가 서 있는 곳(기본 장소 또는 방문 중인 건물)
  function talkScene(cid, where) {
    var list = availableScenes(cid);
    var home = homeOf(cid);
    return list.filter(function (sc) { return (sceneLoc(cid, sc) || home) === (where || home); })[0] || null;
  }
  // 건물 문에서 재생할 장면 (모든 캐릭터)
  function doorScene(buildingId) {
    var found = null;
    Object.keys(chars()).forEach(function (k) {
      if (found) return;
      var cid = k;
      (DotGame.NPCS || []).forEach(function (n) { if (n.storyKeys && n.storyKeys.indexOf(k) >= 0) cid = n.id; });
      availableScenes(cid).forEach(function (sc) {
        if (!found && isDoorScene(cid, sc) && sceneLoc(cid, sc) === buildingId) found = { cid: cid, scene: sc };
      });
    });
    return found;
  }
  // NPC 위치: 기본 장소 장면이 대기 중이면 집, 아니면 다른 건물 장면이 대기 중일 때 그 건물 앞
  function placement(npc) {
    var list = availableScenes(npc.id);
    if (list.some(function (sc) { return !isDoorScene(npc.id, sc); })) return null;
    var away = list.filter(function (sc) { return isDoorScene(npc.id, sc); })[0];
    if (!away) return null;
    var spot = (DotGame.STORY_SPOTS || {})[sceneLoc(npc.id, away)];
    return spot ? { x: spot.x, y: spot.y, facing: spot.facing || 'down', location: sceneLoc(npc.id, away), scene: away.id } : null;
  }

  // ---------- 대사 → 대화창 페이지 ----------
  function playerName() { var d = data(); return (d && d.player && d.player.name) || '현수'; }
  function isNarration(l) { return l.narration === true || (typeof l.speaker === 'string' && l.speaker.trim() === ''); }
  function linePage(l) {
    if (typeof l === 'string') return { text: l };
    if (!isObj(l) || typeof l.text !== 'string') return null;
    if (isNarration(l)) return { text: l.text, narration: true, speaker: '', portrait: null };
    var pg = { text: l.text, speaker: l.speaker };
    if (l.portrait !== undefined) pg.portrait = l.portrait;
    return pg;
  }
  // lines → pages. 선택지 줄은 choice 페이지 (onChoose 가 반응 페이지를 돌려줌)
  function buildPages(lines, ctx) {
    var pages = [];
    arr(lines).forEach(function (l, i) {
      if (isObj(l) && Array.isArray(l.choices) && l.choices.length) {
        var opts = l.choices.filter(isObj);
        pages.push({
          choice: { prompt: l.prompt || '', options: opts.map(function (o, j) { return { id: o.id || String.fromCharCode(97 + j), text: String(o.text || '…') }; }) },
          text: l.prompt || '어떻게 말할까?', speaker: l.speaker || playerName(), portrait: l.portrait !== undefined ? l.portrait : 'hero',
          onChoose: function (j) {
            var o = opts[j] || {};
            if (ctx && ctx.sceneKey) { st().choices[ctx.sceneKey + '#' + i] = o.id || String.fromCharCode(97 + j); }
            arr(o.set_flags).forEach(function (f) { S().setFlag(f, true); });
            if (typeof o.affection === 'number' && o.affection && ctx && ctx.cid) S().addAffection(ctx.cid, o.affection);
            S().persist();
            updateStages();
            return buildPages(o.lines, ctx);
          }
        });
        return;
      }
      var pg = linePage(l);
      if (pg) pages.push(pg);
    });
    return pages;
  }

  // 장면 재생 준비: 기록·플래그·호감도 반영 후 pages 반환
  function startScene(cid, sc) {
    var k = key(cid, sc), t = today();
    var late = sc.available_from && t > sc.available_from && Array.isArray(sc.late_lines) && sc.late_lines.length;
    var pages = buildPages(late ? sc.late_lines : sc.lines, { cid: cid, sceneKey: k });
    st().seen[k] = t;
    if (!st().released[k] && sc.available_from) st().released[k] = t;
    arr(sc.set_flags).forEach(function (f) { S().setFlag(f, true); });
    if (typeof sc.affection === 'number' && sc.affection) S().addAffection(cid, sc.affection);
    S().persist();
    updateStages();
    return { pages: pages, late: !!late, key: k };
  }

  // 장면을 대화창으로 재생
  function play(cid, sc, onClose) {
    var r = startScene(cid, sc), ch = character(cid), d = data(), n = npcDef(cid);
    var pages = r.pages.length ? r.pages : [{ text: '……' }];
    if (d && d.is_sample && !pages[0].choice) pages[0] = Object.assign({}, pages[0], { text: '[예시 데이터] ' + pages[0].text });
    DotGame.Dialogue.open({ speaker: (ch && ch.name) || (n && n.name) || '???', portrait: cid, isSample: !!(d && d.is_sample), pages: pages }, onClose);
    return r;
  }

  function debugState() {
    var out = {};
    allScenes().forEach(function (x) {
      out[key(x.cid, x.sc)] = { available: available(x.cid, x.sc), door: isDoorScene(x.cid, x.sc), location: sceneLoc(x.cid, x.sc),
        seen: st().seen[key(x.cid, x.sc)] || null, released: st().released[key(x.cid, x.sc)] || null };
    });
    var stages = {};
    Object.keys(st().stages).forEach(function (c) { stages[c] = st().stages[c]; });
    return { today: today(), scenes: out, stages: stages, backlog_day: st().backlog_day, choices: JSON.parse(JSON.stringify(st().choices)) };
  }

  return {
    hasFlag: hasFlag, flagsOk: flagsOk, character: character, charKey: charKey, homeOf: homeOf,
    talkScene: talkScene, doorScene: doorScene, placement: placement, play: play, buildPages: buildPages,
    processBacklog: processBacklog, available: available,
    currentStage: currentStage, updateStages: updateStages, stageDefs: stageDefs,
    onStageChange: function (fn) { stageListeners.push(fn); },
    playerName: playerName, state: debugState
  };
})();
