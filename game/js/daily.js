/*
 * daily.js — 일일 반응 대사 (data/daily_reactions.json, 대체본 data/daily_reactions.js → window.DAILY_REACTIONS_DATA)
 *   형식: story/daily_reaction_slots.md (스토리 봇 제안) = docs/DATA_FORMAT.md 4장, 스키마 data/schema/daily-reactions.schema.json
 *   - date 가 오늘(KST)과 다르면 반응 전체를 쓰지 않는다.
 *   - news_ref 가 있는 반응은 news_updated_at 이 news.json 의 updated_at 과 같고, 가리키는 항목의 title 이 같을 때만 쓴다.
 *   - 트리거: on_talk (그 장소에서 그 캐릭터에게 말 걸 때, 스토리 장면이 없을 때) / after_news (그 건물 소식을 다 본 직후)
 *     message (단톡·문자) 는 화면이 보류라 아직 재생하지 않는다.
 *   - 조건 conditions: stages(주연=heroine 의 호감도 단계), periods(아래 PERIODS 날짜표), requires_flags, excludes_flags
 *   - 후보 중 priority 가 큰 것 1개, 같은 반응은 그날 다시 재생하지 않음 (세이브 daily.played)
 *   - variants[현재 단계] 가 있으면 lines 대신 사용
 */
window.DotGame = window.DotGame || {};

DotGame.Daily = (function () {
  // 캐릭터 id(반응 데이터) → 게임 NPC id
  var CHAR_TO_NPC = { juyeon: 'heroine', hyunsu: null, park_youngmi: 'park_youngmi', jung_hyuna: 'jung_hyuna', jo_sunmi: 'jo_sunmi', lee_jin: 'lee_jin', kang_myeongheon: 'kang_myeongheon' };
  // 기간 표 (daily_reaction_slots.md 2-1). 위에서부터 먼저 맞는 것
  var PERIODS = [
    { id: 'exam_day', from: '2027-02-22', to: '2027-02-23' },
    { id: 'juyeon_away', from: '2027-02-06', to: '2027-02-09' },
    { id: 'post_ending', from: '2027-03-05', to: '9999-12-31' },
    { id: 'waiting', from: '2027-02-24', to: '2027-03-04' },
    { id: 'exam_sprint', from: '2027-02-14', to: '2027-02-21' },
    { id: 'self_study', from: '2027-01-15', to: '2027-02-13' },
    { id: 'class', from: '0000-01-01', to: '2027-01-14' }
  ];

  function isObj(v) { return v && typeof v === 'object' && !Array.isArray(v); }
  function arr(v) { return Array.isArray(v) ? v : []; }
  function S() { return DotGame.Save; }
  function data() { return DotGame.Data.daily.data; }
  function today() { return S().todayKST(); }

  function period(date) {
    var t = date || today();
    for (var i = 0; i < PERIODS.length; i++) if (t >= PERIODS[i].from && t <= PERIODS[i].to) return PERIODS[i].id;
    return null;
  }
  function heroineStage() { var s = DotGame.Story.currentStage('heroine'); return s ? s.id : null; }

  function playedToday() {
    var d = S().data.daily;
    if (d.date !== today()) { d.date = today(); d.played = []; S().persist(); }
    return d.played;
  }

  // news_ref 가 오늘 news.json 과 맞는지
  function newsRefOk(r, dd) {
    if (!r.news_ref) return true;
    var news = DotGame.Data.state.news;
    if (!news || !isObj(news.buildings)) return false;
    if (dd.news_updated_at && dd.news_updated_at !== news.updated_at) return false;
    var ref = r.news_ref, b = news.buildings[ref.building];
    if (!b) return false;
    var items = arr(b.items);
    if (ref.category_id) {
      var c = arr(b.categories).filter(function (x) { return isObj(x) && x.id === ref.category_id; })[0];
      items = c ? arr(c.items) : [];
    }
    var it = items[ref.item_index];
    return !!(it && typeof it.title === 'string' && it.title.trim() === String(ref.title).trim());
  }
  function condOk(r) {
    var c = isObj(r.conditions) ? r.conditions : {};
    if (arr(c.stages).length && arr(c.stages).indexOf(heroineStage()) < 0) return false;
    if (arr(c.periods).length && arr(c.periods).indexOf(period()) < 0) return false;
    return arr(c.requires_flags).every(DotGame.Story.hasFlag) && !arr(c.excludes_flags).some(DotGame.Story.hasFlag);
  }
  function valid() { var dd = data(); return !!(dd && dd.date === today() && Array.isArray(dd.reactions)); }

  // 조건에 맞는 반응 1개 (재생 기록은 하지 않음)
  function pick(opts) {
    var dd = data();
    if (!valid()) return null;
    var played = playedToday();
    var cand = dd.reactions.filter(function (r) {
      if (!isObj(r) || !r.id || played.indexOf(r.id) >= 0) return false;
      if (opts.where && r.where !== opts.where) return false;
      if (opts.trigger && r.trigger !== opts.trigger) return false;
      if (opts.character && r.character !== opts.character) return false;
      return condOk(r) && newsRefOk(r, dd);
    });
    cand.sort(function (a, b) { return (b.priority || 0) - (a.priority || 0); });
    return cand[0] || null;
  }

  function npcFor(charId) { return Object.prototype.hasOwnProperty.call(CHAR_TO_NPC, charId) ? CHAR_TO_NPC[charId] : charId; }
  function charFor(npcId) { for (var k in CHAR_TO_NPC) if (CHAR_TO_NPC[k] === npcId) return k; return npcId; }
  function displayName(charId) {
    if (charId === 'hyunsu') return DotGame.Story.playerName();
    var npc = npcFor(charId), ch = DotGame.Story.character(npc), n = (DotGame.NPCS || []).filter(function (x) { return x.id === npc; })[0];
    if (charId === 'juyeon') return (ch && ch.name && ch.name !== '???') ? ch.name : '주연';
    return (ch && ch.name) || (n && n.name) || charId;
  }
  function pages(r) {
    var st = heroineStage(), lines = (isObj(r.variants) && st && Array.isArray(r.variants[st])) ? r.variants[st] : r.lines;
    return arr(lines).filter(isObj).map(function (l) {
      return { text: l.text, speaker: displayName(l.speaker), portrait: l.speaker === 'hyunsu' ? 'hero' : npcFor(l.speaker) };
    });
  }
  function markPlayed(r) { playedToday().push(r.id); S().persist(); }

  // 반응 재생 (있으면 true)
  function play(r, onClose) {
    if (!r) return false;
    markPlayed(r);
    var dd = data(), pg = pages(r);
    if (!pg.length) return false;
    if (dd.is_sample) pg[0] = Object.assign({}, pg[0], { text: '[예시 데이터] ' + pg[0].text });
    DotGame.Dialogue.open({ speaker: displayName(r.character), portrait: npcFor(r.character), isSample: !!dd.is_sample, pages: pg }, onClose);
    return true;
  }
  // 오늘 반응이 없을 때 파일의 fallback_lines (캐릭터 id 기준). 없으면 null
  function fallbackLine(npcId) {
    var dd = data();
    if (!dd || !isObj(dd.fallback_lines)) return null;
    var l = arr(dd.fallback_lines[charFor(npcId)]).filter(function (x) { return typeof x === 'string' && x.trim(); });
    return l.length ? l[Math.floor(Math.random() * l.length)] : null;
  }

  return {
    pick: pick, play: play, pages: pages, fallbackLine: fallbackLine, period: period, valid: valid,
    npcFor: npcFor, charFor: charFor, PERIODS: PERIODS,
    // after_news: 건물 소식을 다 본 뒤 (아무 캐릭터)
    afterNews: function (buildingId, onClose) { return play(pick({ where: buildingId, trigger: 'after_news' }), onClose); },
    state: function () {
      var dd = data();
      return { source: DotGame.Data.daily.source, valid: valid(), date: dd ? dd.date : null, count: dd && Array.isArray(dd.reactions) ? dd.reactions.length : 0,
        period: period(), played: S().data.daily.played.slice() };
    }
  };
})();
