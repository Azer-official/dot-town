/*
 * dialogue.js — 스타듀밸리풍 하단 대화창 (DOM 오버레이: 한글 폰트 렌더링이 가장 깔끔함)
 *   open({speaker, portrait?, pages:[{text, meta?, title?, speaker?, portrait?}], isSample}, onClose?) / advance() / close() / isOpen()
 *   초상화: page.portrait(id, null=없음) → 화자 이름 매핑(assets.js speakerPortraits, story player.name) → 기본 화자면 d.portrait.
 *   URL 이 없으면(파일 없음/로드 실패/?art=0) 초상화 없는 기존 레이아웃.
 *   타자기 효과: 글자 출력 중 Space/Enter → 즉시 전체 표시, 다시 누르면 다음 페이지. 마지막 페이지에서 닫힘.
 *   나레이션: page.narration → 이름표·초상화 없이 가운데 정렬 기울임체 (.dlg-box.narration)
 *   선택지: page.choice = {prompt, options:[{id, text}]}, page.onChoose(i) → 반응 페이지 배열(현재 페이지 뒤에 끼움).
 *           ↑↓/W/S/숫자키로 고르고 Space/Enter 확정. 반응이 끝나면 원래 장면이 그대로 이어진다.
 */
window.DotGame = window.DotGame || {};

DotGame.Dialogue = (function () {
  var CHAR_MS = 28;
  var el, nameEl, badgeEl, textEl, metaEl, nextEl, pageEl;
  var pages = [], index = 0, typing = false, shown = 0, timer = null, open = false;
  var onClose = null, defaultSpeaker = '', defaultPortrait = null, boxEl, portraitEl, portraitImg;
  var choiceEl = null, choiceIdx = 0, closeListeners = [], nameBox = null;

  function init() {
    el = document.getElementById('dialogue');
    nameEl = document.getElementById('dlg-name-text');
    badgeEl = document.getElementById('dlg-badge');
    textEl = document.getElementById('dlg-text');
    metaEl = document.getElementById('dlg-meta');
    nextEl = document.getElementById('dlg-next');
    pageEl = document.getElementById('dlg-page');
    boxEl = el.querySelector('.dlg-box');
    portraitEl = document.getElementById('dlg-portrait');
    portraitImg = document.getElementById('dlg-portrait-img');
    choiceEl = document.getElementById('dlg-choices');
    nameBox = el.querySelector('.dlg-name');
    document.addEventListener('keydown', onChoiceKey, true);
    var A = DotGame.ASSETS;
    el.style.setProperty('--pw', (A.PORTRAIT_SIZE * A.PORTRAIT_SCALE / 960 * 100) + 'cqw');
  }

  function portraitId(p) {
    if (p.portrait !== undefined) return p.portrait;
    var sp = p.speaker || defaultSpeaker;
    var byName = DotGame.Portraits.idForSpeaker(sp);
    if (byName) return byName;
    if (!p.speaker || p.speaker === defaultSpeaker) return defaultPortrait;
    return null;
  }

  function renderPortrait(p) {
    var id = portraitId(p), url = DotGame.Portraits.url(id);
    boxEl.classList.toggle('has-portrait', !!url);
    portraitEl.classList.toggle('hidden', !url);
    portraitEl.setAttribute('data-portrait', url ? id : '');
    if (url && portraitImg.getAttribute('src') !== url) portraitImg.setAttribute('src', url);
  }

  function stopTimer() { if (timer) { clearInterval(timer); timer = null; } }

  function isChoice() { return open && pages[index] && !!pages[index].choice; }
  function renderChoices() {
    var p = pages[index];
    choiceEl.innerHTML = '';
    choiceEl.classList.toggle('hidden', !p.choice);
    if (!p.choice) return;
    p.choice.options.forEach(function (o, i) {
      var li = document.createElement('li');
      li.className = 'dlg-choice' + (i === choiceIdx ? ' selected' : '');
      li.setAttribute('data-choice', o.id);
      li.textContent = (i + 1) + '. ' + o.text;
      li.addEventListener('mousedown', function (e) { e.preventDefault(); choiceIdx = i; renderChoices(); });
      li.addEventListener('click', function () { choose(i); });
      choiceEl.appendChild(li);
    });
  }
  function choose(i) {
    var p = pages[index];
    if (!p || !p.choice) return;
    if (typing) finishTyping();
    var extra = (p.onChoose ? p.onChoose(i) : []) || [];
    p.chosen = i;
    var answered = { text: p.choice.options[i].text, speaker: p.speaker, portrait: p.portrait, chosenFrom: true };
    pages.splice.apply(pages, [index, 1, answered].concat(extra));   // 선택지 페이지 → 고른 말 + 반응
    render();
  }
  // 선택지 키 처리 (Phaser 보다 먼저 받음)
  function onChoiceKey(e) {
    if (!isChoice()) return;
    var p = pages[index], n = p.choice.options.length, k = e.key;
    if (k === 'Escape') return;                    // Esc 는 평소처럼 대화 닫기
    e.stopPropagation();
    if (k === 'ArrowUp' || k === 'w' || k === 'W') { e.preventDefault(); choiceIdx = (choiceIdx + n - 1) % n; renderChoices(); }
    else if (k === 'ArrowDown' || k === 's' || k === 'S') { e.preventDefault(); choiceIdx = (choiceIdx + 1) % n; renderChoices(); }
    else if (/^[1-9]$/.test(k) && +k <= n) { e.preventDefault(); choiceIdx = +k - 1; renderChoices(); }
    else if (k === 'Enter' || k === ' ') { e.preventDefault(); if (!e.repeat) { if (typing) finishTyping(); else choose(choiceIdx); } }
  }

  function render() {
    var p = pages[index];
    var full = p.text;
    var narr = !!p.narration;
    boxEl.classList.toggle('narration', narr);
    boxEl.classList.toggle('choosing', !!p.choice);
    if (nameBox) nameBox.classList.toggle('invisible', narr);
    nameEl.textContent = narr ? '' : (p.speaker || defaultSpeaker);   // 페이지별 화자(스토리용) 지원
    if (narr) { boxEl.classList.remove('has-portrait'); portraitEl.classList.add('hidden'); portraitEl.setAttribute('data-portrait', ''); }
    else renderPortrait(p);
    choiceIdx = 0;
    renderChoices();
    textEl.classList.toggle('title', !!p.title);
    metaEl.textContent = p.meta || '';
    pageEl.textContent = (index + 1) + ' / ' + pages.length;
    nextEl.textContent = p.choice ? '◆' : index === pages.length - 1 ? '■' : '▼';
    shown = 0; typing = true;
    textEl.textContent = '';
    nextEl.classList.add('hidden');
    stopTimer();
    timer = setInterval(function () {
      shown += 1;
      textEl.textContent = full.slice(0, shown);
      if (shown >= full.length) finishTyping();
    }, CHAR_MS);
  }

  function finishTyping() {
    stopTimer();
    typing = false;
    textEl.textContent = pages[index].text;
    nextEl.classList.remove('hidden');
  }

  function openDialogue(d, closeCb) {
    if (!el) init();
    pages = d.pages && d.pages.length ? d.pages : [{ text: '...' }];
    index = 0; open = true; onClose = closeCb || null;
    defaultSpeaker = d.speaker || '';
    defaultPortrait = d.portrait || null;
    badgeEl.classList.toggle('hidden', !d.isSample);
    el.classList.remove('hidden');
    el.setAttribute('aria-hidden', 'false');
    render();
  }

  function advance() {
    if (!open) return;
    if (typing) { finishTyping(); return; }
    if (pages[index].choice) return;           // 선택지는 onChoiceKey / 클릭으로만 진행
    if (index < pages.length - 1) { index += 1; render(); }
    else close();
  }

  function close() {
    if (!open) return;
    stopTimer();
    open = false; typing = false;
    el.classList.add('hidden');
    el.setAttribute('aria-hidden', 'true');
    if (choiceEl) { choiceEl.innerHTML = ''; choiceEl.classList.add('hidden'); }
    var cb = onClose; onClose = null;
    if (cb) cb();
    closeListeners.forEach(function (fn) { try { fn(); } catch (e) { console.warn('[DotGame]', e); } });
  }

  return {
    open: openDialogue, advance: advance, close: close,
    isOpen: function () { return open; },
    onAnyClose: function (fn) { closeListeners.push(fn); },
    choose: function (i) { choose(i); },
    info: function () {
      var p = open ? pages[index] : null;
      return { open: open, index: index, total: pages.length, typing: typing, narration: !!(p && p.narration),
        choice: p && p.choice ? { options: p.choice.options.map(function (o) { return o.id; }), selected: choiceIdx } : null };
    }
  };
})();
