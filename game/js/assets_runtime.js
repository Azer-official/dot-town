/*
 * assets_runtime.js — 계절 판정 + 파일 후보(대체 순서) 계산 + 초상화 URL 결정.
 *   DotGame.Season.current()          → 'autumn' | 'winter'  (DotGame.Save.todayKST() 기준이라 ?date= 반영)
 *   DotGame.AssetFiles.candidates(def, season, seasonFallback)
 *     → [오늘 계절 파일, (seasonFallback 이면) 기본 계절 파일, file] 중 존재(인덱스 기준)하는 것만, 중복 제거
 *     스프라이트: 계절 → file(hero.png) → placeholder / 초상화: 계절 → 가을 → file → 없음
 *   DotGame.Portraits.init() / url(id) / idForSpeaker(name)
 */
window.DotGame = window.DotGame || {};

DotGame.Season = (function () {
  function forDate(ymd) {
    var S = DotGame.ASSETS.SEASONS, md = String(ymd).slice(5, 10);
    var inWinter = S.WINTER_FROM <= S.WINTER_TO ? (md >= S.WINTER_FROM && md <= S.WINTER_TO)
                                                : (md >= S.WINTER_FROM || md <= S.WINTER_TO);
    return inWinter ? 'winter' : S.DEFAULT;
  }
  return {
    forDate: forDate,
    current: function () { return forDate(DotGame.Save && DotGame.Save.data ? DotGame.Save.todayKST() : new Date(Date.now() + 9 * 3600e3).toISOString()); }
  };
})();

DotGame.AssetFiles = (function () {
  function index() {
    var ix = window.DOTGAME_ASSET_INDEX;
    return ix && Array.isArray(ix.files) ? ix.files : null;
  }
  function exists(rel) { var ix = index(); return ix ? ix.indexOf(rel) >= 0 : true; }   // 인덱스 없으면 일단 시도
  function candidates(def, season, seasonFallback) {
    if (!def) return [];
    season = season || DotGame.Season.current();
    var list = [], S = DotGame.ASSETS.SEASONS;
    if (def.seasons) { list.push(def.seasons[season]); if (seasonFallback) list.push(def.seasons[S.DEFAULT]); }
    list.push(def.file);
    var seen = {};
    return list.filter(function (f) {
      if (!f || seen[f]) return false;
      seen[f] = true;
      return exists(f);
    });
  }
  return { candidates: candidates, exists: exists, hasIndex: function () { return !!index(); } };
})();

DotGame.Portraits = (function () {
  var urls = {}, ready = {};
  function init() {
    var A = DotGame.ASSETS;
    if (!A.USE_IMAGE_ASSETS) return;
    Object.keys(A.portraits || {}).forEach(function (id) {
      var chain = DotGame.AssetFiles.candidates(A.portraits[id], null, true);
      (function tryNext() {
        if (!chain.length) { urls[id] = null; ready[id] = true; return; }
        var rel = chain.shift(), img = new Image();
        img.onload = function () { urls[id] = A.BASE_PATH + rel; ready[id] = true; };
        img.onerror = function () { console.warn('[DotGame] 초상화 로드 실패 → 다음 후보:', rel); tryNext(); };
        img.src = A.BASE_PATH + rel;
      })();
    });
  }
  function idForSpeaker(name) {
    var A = DotGame.ASSETS, map = A.speakerPortraits || {};
    if (!name) return null;
    if (map[name]) return map[name];
    var st = DotGame.Data && DotGame.Data.story && DotGame.Data.story.data;
    if (st && st.player && st.player.name === name) return 'hero';
    return null;
  }
  return {
    init: init, idForSpeaker: idForSpeaker,
    url: function (id) { return id ? (urls[id] || null) : null; },
    state: function () { return { urls: Object.assign({}, urls), ready: Object.assign({}, ready) }; }
  };
})();
