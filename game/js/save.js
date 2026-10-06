/*
 * save.js — 진행 상황 저장 (브라우저 localStorage) + KST 날짜/일차 계산
 *
 * 날짜: 항상 한국 표준시(Asia/Seoul, UTC+9, 서머타임 없음) 기준. 브라우저/OS 시간대와 무관하게
 *       (Date.now() + 9시간) 의 UTC 날짜를 사용한다.
 * 일차 규칙 = "서로 다른 플레이 날짜 수":
 *   - 첫 실행일 = 1일차 (start_date_kst = last_play_date_kst = 그날)
 *   - 로드 시(그리고 실행 중 1분마다) KST 오늘 > last_play_date_kst 이면 day += 1, last_play_date_kst = 오늘
 *     (며칠을 건너뛰고 접속해도 +1. 달력상 경과일은 calendarDaysSinceStart() 로 따로 계산 가능)
 *   - 오늘 < last_play_date_kst (시계를 되돌림/가짜 날짜) 이면 아무것도 바꾸지 않음
 * 디버그 URL: ?date=YYYY-MM-DD (오늘 KST 날짜를 가짜로 지정), ?reset=1 (세이브 삭제 후 새로 시작; 파라미터는 주소에서 제거됨)
 * 저장 키: localStorage['dotgame.save'] (http://127.0.0.1:8000 과 file:// 은 출처가 달라 세이브도 따로)
 */
window.DotGame = window.DotGame || {};

DotGame.Save = (function () {
  var KEY = 'dotgame.save';
  var SAVE_VERSION = 2;
  var HISTORY_MAX = 200, WRONG_MAX = 500;
  var data = null, storageOk = true, fakeDate = null, lastError = null, didReset = false;
  var listeners = [];

  // ---------- KST 날짜 유틸 ----------
  function kstNow() { return new Date(Date.now() + 9 * 3600 * 1000); }  // getUTC* 로 읽으면 KST 값
  function realTodayKST() { return kstNow().toISOString().slice(0, 10); }
  function todayKST() { return fakeDate || realTodayKST(); }
  function nowIsoKST() { return kstNow().toISOString().slice(0, 19) + '+09:00'; }
  function validDate(s) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
    var d = new Date(s + 'T00:00:00Z');
    return !isNaN(d) && d.toISOString().slice(0, 10) === s;
  }
  function daysBetween(a, b) { return Math.round((Date.parse(b + 'T00:00:00Z') - Date.parse(a + 'T00:00:00Z')) / 86400000); }
  var WEEK = ['일', '월', '화', '수', '목', '금', '토'];
  function weekday(s) { return WEEK[new Date(s + 'T00:00:00Z').getUTCDay()]; }

  // ---------- 스키마 ----------
  function fresh(today) {
    return {
      save_version: SAVE_VERSION,
      created_at: nowIsoKST(),
      updated_at: nowIsoKST(),
      start_date_kst: today,
      last_play_date_kst: today,
      day: 1,
      affection: { heroine: 0 },
      flags: {},
      quiz: { history: [], wrong: [] },
      academy: { last_range: null },
      story: freshStory(),
      daily: { date: null, played: [] }
    };
  }
  // 스토리 엔진 상태 (game/js/story.js). 키 "캐릭터id/장면id"
  //   seen: 재생한 장면 → 재생 날짜, released: 밀린 이벤트 큐에서 풀린 장면 → 풀린 날짜,
  //   backlog_day: 마지막으로 밀린 이벤트를 하나 푼 날짜, choices: "장면키#줄번호" → 고른 선택지 id,
  //   stages: 캐릭터 id → {id, since} (호감도 단계, 내려가지 않음)
  function freshStory() { return { seen: {}, released: {}, backlog_day: null, choices: {}, stages: {} }; }

  // 버전별 마이그레이션: MIGRATIONS[n] 은 save_version n → n+1 변환
  var MIGRATIONS = {
    // 0: function (s) { ...; s.save_version = 1; return s; }   ← 버전 0 (스키마 이전) 예시 자리
    // 1 → 2: 스토리 엔진(날짜 트리거·밀린 이벤트·선택지·호감도 단계) + 일일 반응 기록 추가
    1: function (s) { s.story = freshStory(); s.daily = { date: null, played: [] }; s.save_version = 2; return s; }
  };

  function migrate(s, today) {
    if (!s || typeof s !== 'object') return fresh(today);
    var v = typeof s.save_version === 'number' ? s.save_version : 0;
    if (v > SAVE_VERSION) { lastError = '세이브 버전(' + v + ')이 게임보다 새로움 — 읽을 수 있는 만큼 사용'; }
    while (v < SAVE_VERSION) {
      if (!MIGRATIONS[v]) { lastError = 'save_version ' + v + ' 마이그레이션 없음 → 기본값 보정'; break; }
      s = MIGRATIONS[v](s); v = s.save_version;
    }
    // 누락 필드 보정 (필드 추가는 버전업 없이 여기서 흡수)
    var base = fresh(today);
    Object.keys(base).forEach(function (k) { if (s[k] === undefined || s[k] === null) s[k] = base[k]; });
    if (!validDate(s.start_date_kst)) s.start_date_kst = today;
    if (!validDate(s.last_play_date_kst)) s.last_play_date_kst = s.start_date_kst;
    if (typeof s.day !== 'number' || s.day < 1) s.day = 1;
    if (typeof s.affection !== 'object') s.affection = {};
    if (typeof s.affection.heroine !== 'number') s.affection.heroine = 0;
    if (typeof s.flags !== 'object' || Array.isArray(s.flags)) s.flags = {};
    if (typeof s.quiz !== 'object') s.quiz = { history: [], wrong: [] };
    if (!Array.isArray(s.quiz.history)) s.quiz.history = [];
    if (!Array.isArray(s.quiz.wrong)) s.quiz.wrong = [];
    if (typeof s.academy !== 'object' || !s.academy) s.academy = { last_range: null };
    if (s.academy.last_range === undefined) s.academy.last_range = null;
    if (typeof s.story !== 'object' || !s.story || Array.isArray(s.story)) s.story = freshStory();
    var fs = freshStory();
    Object.keys(fs).forEach(function (k) {
      if (k === 'backlog_day') { if (typeof s.story[k] !== 'string') s.story[k] = null; }
      else if (typeof s.story[k] !== 'object' || !s.story[k] || Array.isArray(s.story[k])) s.story[k] = fs[k];
    });
    if (typeof s.daily !== 'object' || !s.daily) s.daily = { date: null, played: [] };
    if (!Array.isArray(s.daily.played)) s.daily.played = [];
    if (s.daily.date !== null && typeof s.daily.date !== 'string') s.daily.date = null;
    return s;
  }

  // ---------- 저장소 ----------
  function readRaw() {
    try { return window.localStorage.getItem(KEY); }
    catch (e) { storageOk = false; lastError = 'localStorage 사용 불가 → 이번 세션만 메모리에 저장'; return null; }
  }
  function persist() {
    if (!data) return;
    data.updated_at = nowIsoKST();
    if (!storageOk) return;
    try { window.localStorage.setItem(KEY, JSON.stringify(data)); }
    catch (e) { storageOk = false; lastError = '저장 실패: ' + e.message; console.warn('[DotGame]', lastError); }
  }

  // 오늘 날짜 반영 → 일차 계산. 바뀌었으면 true
  function applyToday() {
    var t = todayKST();
    if (t > data.last_play_date_kst) {
      data.day += 1;
      data.last_play_date_kst = t;
      persist();
      listeners.forEach(function (fn) { try { fn(data); } catch (e) {} });
      return true;
    }
    return false;
  }

  function parseParams() {
    var q = new URLSearchParams(location.search);
    var d = q.get('date');
    if (d) {
      if (validDate(d)) fakeDate = d;
      else { lastError = '?date= 형식 오류 (YYYY-MM-DD): ' + d; console.warn('[DotGame]', lastError); }
    }
    if (q.get('reset') === '1') {
      didReset = true;
      q.delete('reset');   // 새로고침할 때마다 리셋되지 않도록 주소에서 제거
      try {
        var qs = q.toString();
        history.replaceState(null, '', location.pathname + (qs ? '?' + qs : '') + location.hash);
      } catch (e) { /* file:// 등에서 실패해도 무시 */ }
    }
  }

  function init() {
    parseParams();
    var today = todayKST();
    if (didReset) reset(true);
    var raw = readRaw(), parsed = null;
    if (raw) {
      try { parsed = JSON.parse(raw); }
      catch (e) {
        lastError = '세이브 손상 → 새로 시작 (백업: ' + KEY + '.corrupt)';
        try { localStorage.setItem(KEY + '.corrupt', raw); } catch (e2) {}
      }
    }
    data = parsed ? migrate(parsed, today) : fresh(today);
    if (!applyToday()) persist();
    // 실행 중 KST 자정이 지나면 일차 증가 (가짜 날짜 모드에서는 고정)
    if (!fakeDate) setInterval(applyToday, 60 * 1000);
    return data;
  }

  function reset(skipFresh) {
    try { localStorage.removeItem(KEY); } catch (e) {}
    if (!skipFresh) { data = fresh(todayKST()); persist(); listeners.forEach(function (fn) { fn(data); }); }
  }

  // ---------- 게임에서 쓰는 API ----------
  function setFlag(name, value) { data.flags[name] = value === undefined ? true : value; persist(); }
  function hasFlag(name) { return !!data.flags[name]; }
  function addAffection(id, delta) {
    data.affection[id] = (typeof data.affection[id] === 'number' ? data.affection[id] : 0) + (Number(delta) || 0);
    persist();
    return data.affection[id];
  }
  function setLastRange(materialId, start, end) {
    data.academy.last_range = { material_id: materialId, start: start, end: end };
    persist();
  }
  // 문제 하나 채점 결과 → 오답노트 갱신 (틀리면 추가/횟수 증가, 나중에 맞히면 제거)
  function recordAnswer(materialId, q, chosen) {
    var correct = chosen === q.answer_index;
    var idx = -1;
    data.quiz.wrong.forEach(function (w, i) { if (w.material_id === materialId && w.question_id === q.id) idx = i; });
    if (correct) { if (idx >= 0) data.quiz.wrong.splice(idx, 1); }
    else {
      var entry = idx >= 0 ? data.quiz.wrong[idx] : { material_id: materialId, question_id: q.id, times_wrong: 0 };
      entry.times_wrong += 1;
      entry.last_chosen_index = chosen;
      entry.answer_index = q.answer_index;
      entry.last_wrong_date_kst = todayKST();
      entry.question = String(q.question || '').slice(0, 120);
      if (idx < 0) data.quiz.wrong.push(entry);
      if (data.quiz.wrong.length > WRONG_MAX) data.quiz.wrong.splice(0, data.quiz.wrong.length - WRONG_MAX);
    }
    persist();
    return correct;
  }
  // 퀴즈 1회(세트) 결과
  function recordQuizSession(materialId, start, end, total, answered, correct, completed) {
    data.quiz.history.push({
      date_kst: todayKST(), day: data.day, at: nowIsoKST(),
      material_id: materialId, range: [start, end],
      total: total, answered: answered, correct: correct, completed: !!completed
    });
    if (data.quiz.history.length > HISTORY_MAX) data.quiz.history.splice(0, data.quiz.history.length - HISTORY_MAX);
    persist();
  }

  return {
    init: init, reset: function () { reset(false); }, migrate: migrate, persist: persist,
    get data() { return data; },
    todayKST: todayKST, realTodayKST: realTodayKST, weekday: weekday,
    calendarDaysSinceStart: function () { return daysBetween(data.start_date_kst, todayKST()); },
    isFakeDate: function () { return !!fakeDate; },
    storageOk: function () { return storageOk; },
    lastError: function () { return lastError; },
    didReset: function () { return didReset; },
    onDayChange: function (fn) { listeners.push(fn); },
    setFlag: setFlag, hasFlag: hasFlag, addAffection: addAffection,
    setLastRange: setLastRange, recordAnswer: recordAnswer, recordQuizSession: recordQuizSession,
    KEY: KEY, SAVE_VERSION: SAVE_VERSION
  };
})();
