/*
 * dialogue.js — 스타듀밸리풍 하단 대화창 (DOM 오버레이: 한글 폰트 렌더링이 가장 깔끔함)
 *   open({speaker, portrait?, pages:[{text, meta?, title?, speaker?, portrait?}], isSample}, onClose?) / advance() / close() / isOpen()
 *   초상화: page.portrait(id, null=없음) → 화자 이름 매핑(assets.js speakerPortraits, story player.name) → 기본 화자면 d.portrait.
 *   URL 이 없으면(파일 없음/로드 실패/?art=0) 초상화 없는 기존 레이아웃.
 *   타자기 효과: 글자 출력 중 Space/Enter → 즉시 전체 표시, 다시 누르면 다음 페이지. 마지막 페이지에서 닫힘.
 *   나레이션: page.narration → 이름표·초상화 없이 가운데 정렬 기울임체 (.dlg-box.narration)
 *   선택지: page.choice = {prompt, options:[{id, text}]}, page.onChoose(i) → 반응 페이지 배열(현재 페이지 뒤에 끼움).
 *           ↑↓/W/S/숫자키로 고르고 Space/Enter 확정. 반응이 끝나면 원래 장면이 그대로 이어진다.
 *   이전 줄: Backspace / ← → 같은 대화(장면) 안에서 한 줄 뒤로. 첫 줄에선 무시.
 *           타자 중이어도 곧바로 이전 줄로 가며, 되돌아간 줄은 타자 효과 없이 전체 표시(이미 읽은 줄).
 *           선택지 화면에서 → 선택지 바로 앞 줄. 고른 뒤 되돌아오면 선택지 화면이 다시 보이지만 **첫 선택으로 고정**:
 *           고른 보기만 선택 상태(나머지는 흐리게), Space/Enter 는 같은 반응 줄을 다시 보여 줄 뿐 onChoose(효과)는 다시 부르지 않는다.
 *           장면 효과(set_flags/affection/단계/일일 반응 played)는 대화를 열 때 한 번만 적용되므로 앞뒤 이동으로 중복되지 않는다.
 *   Backspace 는 입력칸(input/textarea/contenteditable) 밖에서는 항상 preventDefault (브라우저 뒤로가기 방지).
 */
window.DotGame = window.DotGame || {};

// Backspace 브라우저 뒤로가기 방지: 입력칸 밖이면 항상 preventDefault (전파는 막지 않음 — 학원 입력칸 글자 삭제는 그대로)
(function () {
  function editable(t) {
    return !!(t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName || '')));
  }
  window.addEventListener('keydown', function (e) {
    if (e.key === 'Backspace' && !editable(e.target)) e.preventDefault();
  }, true);
})();

DotGame.Dialogue = (function () {
  var CHAR_MS = 28;
  var el, nameEl, badgeEl, textEl, metaEl, nextEl, pageEl;
  var pages = [], index = 0, typing = false, shown = 0, timer = null, open = false;
  var onClose = null, defaultSpeaker = '', defaultPortrait = null, boxEl, portraitEl, portraitImg;
  var choiceEl = null, choiceIdx = 0, closeListeners = [], nameBox = null, hintEl = null;

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
    hintEl = document.getElementById('dlg-hint');
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
      var locked = p.chosen !== undefined;
      li.className = 'dlg-choice' + (i === choiceIdx ? ' selected' : '') + (locked && i !== p.chosen ? ' locked' : '');
      li.setAttribute('data-choice', o.id);
      li.textContent = (i + 1) + '. ' + o.text;
      li.addEventListener('mousedown', function (e) { e.preventDefault(); if (!locked) { choiceIdx = i; renderChoices(); } });
      li.addEventListener('click', function () { choose(i); });
      choiceEl.appendChild(li);
    });
  }
  function choose(i) {
    var p = pages[index];
    if (!p || !p.choice) return;
    if (typing) finishTyping();
    if (p.chosen === undefined) {
      // 첫 선택만 효과 적용. 선택지 페이지는 남겨 두고(이전 줄로 돌아올 수 있게) 뒤에 고른 말 + 반응을 끼운다
      var extra = (p.onChoose ? p.onChoose(i) : []) || [];
      p.chosen = i;
      var answered = { text: p.choice.options[i].text, speaker: p.speaker, portrait: p.portrait, chosenFrom: true };
      pages.splice.apply(pages, [index + 1, 0, answered].concat(extra));
    }
    // 이미 고른 선택지(되돌아온 경우): 고정 — 같은 반응 줄을 다시 보여 줄 뿐 효과는 다시 적용하지 않음
    index += 1;
    render();
  }

  // 이전 줄 (Backspace / ←). 첫 줄이면 무시. 되돌아간 줄은 바로 전체 표시
  function back() {
    if (!open || index <= 0) return false;
    index -= 1;
    render(true);
    return true;
  }
  // 선택지 키 처리 (Phaser 보다 먼저 받음)
  // + 이전 줄 키(Backspace/←)는 모든 대화 페이지에서 여기서 소비 → Phaser(이동)로 가지 않음
  function onChoiceKey(e) {
    if (!open) return;
    var k = e.key;
    if (k === 'Backspace' || k === 'ArrowLeft') {
      e.preventDefault(); e.stopPropagation();
      if (!e.repeat) back();                       // 누르고 있어도 한 번에 한 줄
      return;
    }
    if (!isChoice()) return;
    var p = pages[index], n = p.choice.options.length;
    if (k === 'Escape') return;                    // Esc 는 평소처럼 대화 닫기
    e.stopPropagation();
    if (p.chosen !== undefined && k !== 'Enter' && k !== ' ') { e.preventDefault(); return; }   // 고정된 선택지: 이동 불가
    if (k === 'ArrowUp' || k === 'w' || k === 'W') { e.preventDefault(); choiceIdx = (choiceIdx + n - 1) % n; renderChoices(); }
    else if (k === 'ArrowDown' || k === 's' || k === 'S') { e.preventDefault(); choiceIdx = (choiceIdx + 1) % n; renderChoices(); }
    else if (/^[1-9]$/.test(k) && +k <= n) { e.preventDefault(); choiceIdx = +k - 1; renderChoices(); }
    else if (k === 'Enter' || k === ' ') { e.preventDefault(); if (!e.repeat) { if (typing) finishTyping(); else choose(choiceIdx); } }
  }

  function hintText(p) {
    var parts = [];
    if (p.choice) parts.push(p.chosen !== undefined ? 'Space 계속(선택 고정)' : '↑↓ 고르기 · Space 결정');
    else parts.push(index === pages.length - 1 ? 'Space 닫기' : 'Space 다음');
    if (index > 0) parts.push('Backspace 이전');
    parts.push('Esc 닫기');
    return parts.join(' · ');
  }

  function render(instant) {
    var p = pages[index];
    var full = p.text;
    var narr = !!p.narration;
    boxEl.classList.toggle('narration', narr);
    boxEl.classList.toggle('choosing', !!p.choice);
    if (nameBox) nameBox.classList.toggle('invisible', narr);
    nameEl.textContent = narr ? '' : (p.speaker || defaultSpeaker);   // 페이지별 화자(스토리용) 지원
    if (narr) { boxEl.classList.remove('has-portrait'); portraitEl.classList.add('hidden'); portraitEl.setAttribute('data-portrait', ''); }
    else renderPortrait(p);
    choiceIdx = p.chosen !== undefined ? p.chosen : 0;
    renderChoices();
    if (hintEl) hintEl.textContent = hintText(p);
    textEl.classList.toggle('title', !!p.title);
    metaEl.textContent = p.meta || '';
    pageEl.textContent = (index + 1) + ' / ' + pages.length;
    nextEl.textContent = p.choice ? '◆' : index === pages.length - 1 ? '■' : '▼';
    shown = 0; typing = true;
    textEl.textContent = '';
    nextEl.classList.add('hidden');
    stopTimer();
    if (instant) { finishTyping(); return; }
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
    if (pages[index].choice) { if (pages[index].chosen !== undefined) choose(pages[index].chosen); return; }   // 선택지는 onChoiceKey / 클릭으로만 진행 (고정된 선택지는 계속)
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
    open: openDialogue, advance: advance, close: close, back: back,
    isOpen: function () { return open; },
    onAnyClose: function (fn) { closeListeners.push(fn); },
    choose: function (i) { choose(i); },
    info: function () {
      var p = open ? pages[index] : null;
      return { open: open, index: index, total: pages.length, typing: typing, narration: !!(p && p.narration),
        hint: hintEl ? hintEl.textContent : '',
        choice: p && p.choice ? { options: p.choice.options.map(function (o) { return o.id; }), selected: choiceIdx,
          locked: p.chosen !== undefined } : null };
    }
  };
})();
