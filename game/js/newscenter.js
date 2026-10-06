/*
 * newscenter.js — 분야 메뉴(학원 패널 스타일) → 하단 대화창으로 기사 열람 → 끝나면 메뉴로 복귀
 *   뉴스 센터(분야 4개)와, news.json 에 categories 가 있는 건물(스포츠센터 종목별 소식)이 같이 쓴다.
 *   키: ↑↓ 선택, Enter/Space 확인, Esc 닫기 (대화 중 Esc → 메뉴로 돌아옴, 메뉴에서 Esc → 완전히 닫힘)
 *   열려 있는 동안 keydown 은 여기서 소비되어 Phaser 로 가지 않는다 (main.js setUiLock 과 함께 사용).
 */
window.DotGame = window.DotGame || {};

DotGame.NewsCenter = (function () {
  var el = {}, open = false, focus = 0, building = null, info = null, hooks = null, reading = false;

  function init() {
    if (el.root) return;
    el.root = document.getElementById('newscenter');
    el.title = document.getElementById('nc-title');
    el.badge = document.getElementById('nc-badge');
    el.greeting = document.getElementById('nc-greeting');
    el.list = document.getElementById('nc-list');
  }

  function rows() { return info.categories.length + 1; }   // + 닫기

  function render() {
    el.title.textContent = info.name + ' · ' + info.menuTitle;
    el.badge.classList.toggle('hidden', !info.isSample);
    el.greeting.textContent = info.speaker + ': ' + info.greeting;
    el.list.innerHTML = '';
    info.categories.forEach(function (c, i) {
      var d = document.createElement('div');
      d.className = 'ac-row ac-action nc-cat' + (i === focus ? ' focused' : '');
      d.setAttribute('data-cat', c.id);
      d.textContent = c.label + (c.count ? '  (' + c.count + '건)' : '  (없음)');
      d.addEventListener('mousedown', function () { focus = i; render(); });
      d.addEventListener('click', function () { choose(); });
      el.list.appendChild(d);
    });
    var x = document.createElement('div');
    x.className = 'ac-row nc-close' + (focus === info.categories.length ? ' focused' : '');
    x.textContent = '닫기';
    x.addEventListener('click', function () { close(); });
    el.list.appendChild(x);
  }

  function choose() {
    if (focus >= info.categories.length) { close(); return; }
    var cat = info.categories[focus];
    hideMenu();
    reading = true;
    DotGame.Dialogue.open(DotGame.Data.newsCategoryDialogue(building, cat.id), function () {
      reading = false;
      showMenu();          // 마지막 페이지/ Esc → 메뉴로 복귀
    });
  }

  function onKey(e) {
    if (!open || reading) return;
    e.stopPropagation();
    var k = e.key;
    if (k === 'Escape') { e.preventDefault(); close(); }
    else if (k === 'ArrowUp' || k === 'w' || k === 'W') { e.preventDefault(); focus = (focus + rows() - 1) % rows(); render(); }
    else if (k === 'ArrowDown' || k === 's' || k === 'S') { e.preventDefault(); focus = (focus + 1) % rows(); render(); }
    else if (k === 'Enter' || k === ' ') { e.preventDefault(); if (!e.repeat) choose(); }
  }

  // 메뉴 표시/숨김 (+ Phaser 키보드 잠금 토글)
  function showMenu() {
    info = DotGame.Data.newsCenterInfo(building);
    render();
    el.root.classList.remove('hidden');
    document.addEventListener('keydown', onKey, true);
    if (hooks && hooks.lock) hooks.lock(true);
  }
  function hideMenu() {
    el.root.classList.add('hidden');
    document.removeEventListener('keydown', onKey, true);
    if (hooks && hooks.lock) hooks.lock(false);
  }

  function openCenter(b, h) {
    init();
    building = b; hooks = h || null; open = true; reading = false;
    showMenu();
  }
  function close() {
    if (!open) return;
    if (reading) { reading = false; DotGame.Dialogue.close(); }
    hideMenu();
    open = false;
    if (hooks && hooks.onClose) hooks.onClose();
  }

  return {
    open: openCenter, close: close,
    isOpen: function () { return open; },
    menuVisible: function () { return open && !reading; },
    info: function () {
      return { open: open, reading: reading, menu: open && !reading, focus: info ? (info.categories[focus] ? info.categories[focus].id : 'close') : null,
        categories: info ? info.categories.map(function (c) { return { id: c.id, label: c.label, count: c.count }; }) : [] };
    }
  };
})();
