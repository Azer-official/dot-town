/*
 * data.js — 데이터 로딩 (소식 news / 학습 study / 스토리 story) + 건물별 소식 대화 페이지 생성.
 *   news : data/news.json            (대체본 data/news.js         → window.NEWS_DATA)
 *   study: data/study/index.json + 교재별 파일 (대체본 data/study/study.js → window.STUDY_DATA)
 *   story: data/story/story.json     (대체본 data/story/story.js  → window.STORY_DATA)
 *   daily: data/daily_reactions.json (대체본 data/daily_reactions.js → window.DAILY_REACTIONS_DATA) — 일일 반응 대사 (daily.js)
 *   대체본(.js)은 tools/build_fallbacks.py 가 JSON 에서 자동 생성한다.
 *
 * 로딩 순서 (견고성 우선):
 *   1) http(s):// 로 열렸으면 fetch(NEWS_URL) (캐시 무시)  → source = 'news.json'
 *   2) 실패하거나 file:// 이면 window.NEWS_DATA (data/news.js, <script>로 로드) → source = 'news.js'
 *   3) 둘 다 없으면 내장 안내 문구 → source = 'none'
 * file:// 에서는 브라우저가 fetch 를 막으므로(그리고 콘솔 에러가 나므로) 1)을 아예 건너뛴다.
 */
window.DotGame = window.DotGame || {};

DotGame.DATA_CONFIG = {
  NEWS_URL: '../data/news.json',   // game/index.html 기준
  STUDY_INDEX_URL: '../data/study/index.json',
  STUDY_BASE_URL: '../data/study/',
  STORY_URL: '../data/story/story.json',
  DAILY_URL: '../data/daily_reactions.json',
  MAX_CATEGORY_ITEMS: 10,          // 분야(카테고리) 하나당 최대 소식 수 (뉴스 센터·스포츠센터 종목)
  SUPPORTED_VERSION: 1,
  MAX_PAGE_CHARS: 90               // 이보다 긴 문장은 여러 페이지로 자동 분할
};

DotGame.Data = (function () {
  var state = { news: null, source: 'none', error: null, warnings: [] };
  var study = { index: null, materials: {}, source: 'none', error: null };
  var story = { data: null, source: 'none', error: null };
  var daily = { data: null, source: 'none', error: null };

  function bust(url) { return url + (url.indexOf('?') < 0 ? '?' : '&') + 't=' + Date.now(); }
  async function fetchJSON(url) {
    var res = await fetch(bust(url), { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status + ' ' + url);
    return res.json();
  }
  var canFetch = location.protocol !== 'file:';

  function isObj(v) { return v && typeof v === 'object' && !Array.isArray(v); }
  function str(v) { return typeof v === 'string' ? v.trim() : ''; }

  function check(news) {
    if (!isObj(news)) throw new Error('최상위가 객체가 아님');
    if (typeof news.version !== 'number') throw new Error('version 누락');
    if (!isObj(news.buildings)) throw new Error('buildings 누락');
    if (news.version > DotGame.DATA_CONFIG.SUPPORTED_VERSION) {
      state.warnings.push('데이터 version ' + news.version + ' > 지원 ' + DotGame.DATA_CONFIG.SUPPORTED_VERSION + ' (가능한 만큼 표시)');
    }
    return news;
  }

  async function loadNews() {
    var cfg = DotGame.DATA_CONFIG;
    if (location.protocol !== 'file:') {
      try {
        var url = cfg.NEWS_URL + (cfg.NEWS_URL.indexOf('?') < 0 ? '?' : '&') + 't=' + Date.now();
        var res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        state.news = check(await res.json());
        state.source = 'news.json';
        return state;
      } catch (e) {
        state.error = 'news.json 로드 실패: ' + e.message;
        console.warn('[DotGame]', state.error, '→ news.js 대체 데이터 사용 시도');
      }
    }
    if (window.NEWS_DATA) {
      try {
        state.news = check(window.NEWS_DATA);
        state.source = 'news.js';
        return state;
      } catch (e2) {
        state.error = (state.error ? state.error + ' / ' : '') + 'news.js 형식 오류: ' + e2.message;
      }
    }
    state.news = null;
    state.source = 'none';
    if (!state.error) state.error = '소식 데이터를 찾지 못함 (data/news.json, data/news.js)';
    console.warn('[DotGame]', state.error);
    return state;
  }

  // 긴 문장을 MAX_PAGE_CHARS 이하로 문장/공백 경계에서 자름
  function splitLong(text) {
    var max = DotGame.DATA_CONFIG.MAX_PAGE_CHARS;
    var out = [];
    while (text.length > max) {
      var cut = -1, seps = ['. ', '! ', '? ', '다. ', '요. ', ', ', ' '];
      for (var i = 0; i < seps.length && cut < 0; i++) {
        var p = text.lastIndexOf(seps[i], max);
        if (p > max * 0.4) cut = p + seps[i].length;
      }
      if (cut < 0) cut = max;
      out.push(text.slice(0, cut).trim());
      text = text.slice(cut).trim();
    }
    if (text) out.push(text);
    return out;
  }

  function hostOf(url) {
    try { return new URL(url).hostname.replace(/^www\./, ''); } catch (e) { return ''; }
  }

  // 뉴스 센터 기본 분야 (데이터에 없으면 이 순서/이름으로 메뉴 표시, 선택 시 대체 문구)
  var NEWS_CATEGORIES = [
    { id: 'politics', label: '국내 정치·시사' },
    { id: 'economy',  label: '경제' },
    { id: 'society',  label: '사회·사건사고' },
    { id: 'world',    label: '국제' }
  ];

  function fmtTime(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(String(iso || ''));
    return m ? (m[2] + '-' + m[3] + ' ' + m[4] + ':' + m[5]) : '';
  }

  // items 배열 → 대화 페이지들 (제목 → lines, meta 에 순번/출처/시각/예시 표시)
  function itemPages(items, label, isSample) {
    var pages = [];
    items.forEach(function (it, idx) {
      var host = it.source ? hostOf(String(it.source)) : '';
      var t = it.published_at ? fmtTime(it.published_at) : '';
      var meta = label + ' ' + (idx + 1) + '/' + items.length + (host ? ' · 출처: ' + host : '') + (t ? ' · ' + t : '') +
        (isSample ? ' · 예시 데이터' : '');
      var title = str(it.title);
      if (title) pages.push({ text: '「' + title + '」', meta: meta, title: true });
      (Array.isArray(it.lines) ? it.lines : []).forEach(function (line) {
        var s = str(line);
        if (!s) return;
        splitLong(s).forEach(function (chunk) { pages.push({ text: chunk, meta: meta }); });
      });
    });
    return pages;
  }
  function validItems(arr) {
    return Array.isArray(arr) ? arr.filter(function (it) {
      return isObj(it) && (str(it.title) || (Array.isArray(it.lines) && it.lines.some(function (l) { return str(l); })));
    }) : [];
  }

  // 뉴스 센터: 메뉴 정보 { name, speaker, greeting, isSample, categories:[{id,label,count}] }
  // 스포츠센터 종목별 분야 (buildings.sports.categories 가 있을 때만 메뉴로 열림)
  var SPORTS_CATEGORIES = [
    { id: 'mancity', label: '맨시티' },
    { id: 'doosan', label: '두산 베어스' },
    { id: 'f1', label: 'F1' },
    { id: 'ufc', label: 'UFC' }
  ];
  var CATEGORY_DEFAULTS = { newscenter: NEWS_CATEGORIES, sports: SPORTS_CATEGORIES };
  // 분야 메뉴로 여는 건물인가: 뉴스 센터는 항상, 그 밖의 건물은 news.json 에 categories 배열이 있을 때
  function hasCategories(building) {
    if (building.type === 'newscenter') return true;
    var news = state.news, b = news && isObj(news.buildings) ? news.buildings[building.id] : null;
    return !!(b && Array.isArray(b.categories) && b.categories.length);
  }
  function newsCenterInfo(building) {
    var news = state.news, b = news && isObj(news.buildings) ? news.buildings[building.id] : null;
    var name = (b && str(b.name)) || building.name, isNews = building.type === 'newscenter' || building.id === 'newscenter';
    var max = DotGame.DATA_CONFIG.MAX_CATEGORY_ITEMS;
    var cats = (CATEGORY_DEFAULTS[building.id] || []).map(function (c) { return { id: c.id, label: c.label, items: [] }; });
    (b && Array.isArray(b.categories) ? b.categories : []).forEach(function (c) {
      if (!isObj(c) || !str(c.id)) return;
      var found = cats.filter(function (x) { return x.id === c.id; })[0];
      if (!found) { found = { id: str(c.id), label: str(c.id), items: [] }; cats.push(found); }
      if (str(c.label)) found.label = str(c.label);
      found.items = validItems(c.items).slice(0, max);
    });
    // 예전 형식(평평한 items)이 함께 있으면 '기타 소식' 분야로 보여 줌 (뉴스 센터 제외)
    if (!isNews && b && validItems(b.items).length) cats.push({ id: '_items', label: '기타 소식', items: validItems(b.items).slice(0, max) });
    return {
      name: name, speaker: (b && str(b.speaker)) || name,
      greeting: (b && str(b.greeting)) || (isNews ? '오늘의 주요 뉴스를 분야별로 골라 보세요.' : '오늘의 소식을 종목별로 골라 보세요.'),
      menuTitle: isNews ? '오늘의 주요 뉴스' : '종목별 소식', noun: isNews ? '주요 뉴스' : '소식', isNews: isNews,
      isSample: !!(news && news.is_sample), hasData: !!b,
      categories: cats.map(function (c) { return { id: c.id, label: c.label, count: c.items.length, items: c.items }; })
    };
  }
  // 뉴스 센터: 분야 1개 → 대화
  function newsCategoryDialogue(building, catId) {
    var info = newsCenterInfo(building), cat = info.categories.filter(function (c) { return c.id === catId; })[0];
    var label = cat ? cat.label : catId, pre = info.isSample ? '[예시 데이터] ' : '', pages;
    if (!state.news) {
      pages = [{ text: '앗, 오늘의 뉴스 데이터를 불러오지 못했어요. (data/news.json 확인 필요)' }];
    } else if (!cat || !cat.count) {
      pages = [{ text: pre + (info.isNews ? '오늘은 「' + label + '」 분야 뉴스가 아직 없어요. 다른 분야를 골라 보세요!'
                                          : '오늘은 「' + label + '」 소식이 아직 없어요. 다른 종목을 골라 보세요!') }];
    } else {
      pages = [{ text: pre + '「' + label + '」 ' + info.noun + ' ' + cat.count + '건을 전해 드릴게요.' }]
        .concat(itemPages(cat.items, label, info.isSample));
      pages.push({ text: '「' + label + '」 ' + (info.isNews ? '뉴스는' : '소식은') + ' 여기까지예요. ' + (info.isNews ? '다른 분야도 볼까요?' : '다른 종목도 볼까요?') });
    }
    return { speaker: info.speaker, isSample: info.isSample, pages: pages };
  }

  // 건물 id → { speaker, name, isSample, pages:[{text, meta}] }
  function buildDialogue(building) {
    var news = state.news;
    var b = news && isObj(news.buildings) ? news.buildings[building.id] : null;
    var name = (b && str(b.name)) || building.name;
    var speaker = (b && str(b.speaker)) || name;
    var isSample = !!(news && news.is_sample);
    var pages = [];

    if (!news) {
      pages.push({ text: name + '에 오신 걸 환영해요!' });
      pages.push({ text: '앗, 오늘의 소식 데이터를 불러오지 못했어요. (data/news.json 확인 필요)' });
      return { speaker: speaker, name: name, isSample: false, pages: pages };
    }

    var greeting = (b && str(b.greeting)) || (name + '에 오신 걸 환영해요! 오늘의 소식을 전해 드릴게요.');
    if (isSample) greeting = '[예시 데이터] ' + greeting;
    pages.push({ text: greeting });

    var items = b && Array.isArray(b.items) ? b.items.filter(function (it) {
      return isObj(it) && (str(it.title) || (Array.isArray(it.lines) && it.lines.some(function (l) { return str(l); })));
    }) : [];

    if (!b) {
      pages.push({ text: '지금은 이 건물의 소식이 준비되지 않았어요. 내일 아침에 다시 들러 주세요!' });
    } else if (items.length === 0) {
      pages.push({ text: '오늘은 새로운 소식이 없네요. 내일 아침에 다시 들러 주세요!' });
    } else {
      items.forEach(function (it, idx) {
        var host = it.source ? hostOf(String(it.source)) : '';
        var meta = '소식 ' + (idx + 1) + '/' + items.length + (host ? ' · 출처: ' + host : '') + (isSample ? ' · 예시 데이터' : '');
        var title = str(it.title);
        if (title) pages.push({ text: '「' + title + '」', meta: meta, title: true });
        (Array.isArray(it.lines) ? it.lines : []).forEach(function (line) {
          var s = str(line);
          if (!s) return;
          splitLong(s).forEach(function (chunk) { pages.push({ text: chunk, meta: meta }); });
        });
      });
      pages.push({ text: '오늘 소식은 여기까지예요. 또 들러 주세요!' });
    }
    return { speaker: speaker, name: name, isSample: isSample, pages: pages };
  }

  // ---- 학습 데이터 ----
  function checkMaterial(m, id) {
    if (!isObj(m) || typeof m.version !== 'number' || !Array.isArray(m.chunks)) throw new Error('교재 형식 오류: ' + id);
    return m;
  }
  async function loadStudy() {
    var cfg = DotGame.DATA_CONFIG;
    if (canFetch) {
      try {
        var idx = await fetchJSON(cfg.STUDY_INDEX_URL);
        if (!isObj(idx) || !Array.isArray(idx.materials)) throw new Error('index.json 형식 오류');
        var mats = {};
        for (var i = 0; i < idx.materials.length; i++) {
          var e = idx.materials[i];
          try { mats[e.id] = checkMaterial(await fetchJSON(cfg.STUDY_BASE_URL + e.file), e.id); }
          catch (err) { console.warn('[DotGame] 교재 로드 실패:', e.id, err.message); }
        }
        study.index = idx; study.materials = mats; study.source = 'study/index.json';
        return study;
      } catch (e) {
        study.error = '학습 데이터 로드 실패: ' + e.message;
        console.warn('[DotGame]', study.error, '→ study.js 대체본 사용 시도');
      }
    }
    var fb = window.STUDY_DATA;
    if (isObj(fb) && isObj(fb.index) && Array.isArray(fb.index.materials)) {
      study.index = fb.index; study.materials = {};
      Object.keys(fb.materials || {}).forEach(function (k) {
        try { study.materials[k] = checkMaterial(fb.materials[k], k); } catch (e) { console.warn('[DotGame]', e.message); }
      });
      study.source = 'study.js';
    } else {
      study.source = 'none';
      if (!study.error) study.error = '학습 데이터 없음 (data/study/)';
    }
    return study;
  }

  // 페이지 범위 [start,end] 와 겹치는 chunk / 문제
  function overlaps(p, s, e) {
    return Array.isArray(p) && p.length === 2 && Number(p[0]) <= e && Number(p[1]) >= s;
  }
  function queryStudy(materialId, s, e) {
    var m = study.materials[materialId];
    var res = { material: m || null, chunks: [], questions: [] };
    if (!m) return res;
    m.chunks.forEach(function (c) {
      if (!isObj(c)) return;
      if (overlaps(c.pages, s, e) && Array.isArray(c.summary) && c.summary.length) res.chunks.push(c);
      (Array.isArray(c.questions) ? c.questions : []).forEach(function (q) {
        if (!isObj(q) || !Array.isArray(q.choices) || q.choices.length < 2) return;
        if (typeof q.answer_index !== 'number' || q.answer_index < 0 || q.answer_index >= q.choices.length) return;
        var qp = Array.isArray(q.pages) ? q.pages : c.pages;
        if (overlaps(qp, s, e)) res.questions.push(Object.assign({ _pages: qp }, q));
      });
    });
    return res;
  }

  // ---- 스토리 데이터 ----
  async function loadStory() {
    var cfg = DotGame.DATA_CONFIG;
    if (canFetch) {
      try {
        var d = await fetchJSON(cfg.STORY_URL);
        if (!isObj(d) || !isObj(d.characters)) throw new Error('story.json 형식 오류');
        story.data = d; story.source = 'story/story.json';
        return story;
      } catch (e) {
        story.error = '스토리 데이터 로드 실패: ' + e.message;
        console.warn('[DotGame]', story.error, '→ story.js 대체본 사용 시도');
      }
    }
    if (isObj(window.STORY_DATA) && isObj(window.STORY_DATA.characters)) { story.data = window.STORY_DATA; story.source = 'story.js'; }
    return story;
  }

  // ---- 일일 반응 대사 ----
  async function loadDaily() {
    var cfg = DotGame.DATA_CONFIG;
    function ok(d) { return isObj(d) && typeof d.version === 'number' && Array.isArray(d.reactions); }
    if (canFetch) {
      try {
        var d = await fetchJSON(cfg.DAILY_URL);
        if (!ok(d)) throw new Error('daily_reactions.json 형식 오류');
        daily.data = d; daily.source = 'daily_reactions.json';
        return daily;
      } catch (e) {
        daily.error = '일일 반응 데이터 로드 실패: ' + e.message;
        console.warn('[DotGame]', daily.error, '→ daily_reactions.js 대체본 사용 시도');
      }
    }
    if (ok(window.DAILY_REACTIONS_DATA)) { daily.data = window.DAILY_REACTIONS_DATA; daily.source = 'daily_reactions.js'; }
    return daily;
  }

  async function load() {
    await Promise.all([loadNews(), loadStudy(), loadStory(), loadDaily()]);
    return state;
  }

  return {
    load: load, buildDialogue: buildDialogue, state: state,
    study: study, story: story, daily: daily, queryStudy: queryStudy, splitLong: splitLong,
    newsCenterInfo: newsCenterInfo, newsCategoryDialogue: newsCategoryDialogue, hasCategories: hasCategories,
    NEWS_CATEGORIES: NEWS_CATEGORIES, SPORTS_CATEGORIES: SPORTS_CATEGORIES
  };
})();
