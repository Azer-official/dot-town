/*
 * academy.js — 학원 UI (직업상담사 2급 공부): 교재 선택 + PDF 페이지 범위 입력 → 요약 보기 / 예상 문제 풀기
 *   - 요약: 하단 대화창(Dialogue)으로 페이지 넘김 표시
 *   - 예상 문제: 이 패널 안에서 4지선다 → 정답/오답 + 정답 + 해설 → 다음 문제 → 최종 점수
 * 키보드: ↑↓ 이동, ←→ 교재 변경, 숫자 입력, Enter 확인/다음, Esc 닫기. (마우스 클릭도 가능)
 * 열려 있는 동안 모든 keydown 은 여기서 소비(stopPropagation)되어 Phaser(이동/상호작용)로 가지 않는다.
 */
window.DotGame = window.DotGame || {};

DotGame.Academy = (function () {
  var QUIZ_MAX = 10;
  var SPEAKER = '학원 강사';
  var ROWS = ['material', 'start', 'end', 'summary', 'quiz'];
  var el = {}, open = false, mode = 'menu', focus = 1, matIdx = 0, onCloseCb = null;
  var quiz = null;   // { list, i, selected, answered, score, finished, range }

  function $(id) { return document.getElementById(id); }
  function init() {
    if (el.root) return;
    ['academy', 'ac-badge', 'ac-menu', 'ac-material', 'ac-start', 'ac-end', 'ac-pagecount', 'ac-error',
     'ac-quiz', 'ac-q-head', 'ac-q-text', 'ac-q-choices', 'ac-q-result', 'ac-q-help'].forEach(function (id) {
      el[id.replace(/-/g, '_')] = $(id);
    });
    el.root = el.academy;
    el.rows = ROWS.map(function (r) { return el.root.querySelector('[data-row="' + r + '"]'); });
    el.rows.forEach(function (row, i) {
      row.addEventListener('mousedown', function () { setFocus(i); });
      if (ROWS[i] === 'summary' || ROWS[i] === 'quiz') row.addEventListener('click', function () { run(ROWS[i]); });
    });
  }

  function materials() {
    var st = DotGame.Data.study;
    return (st.index && Array.isArray(st.index.materials)) ? st.index.materials.filter(function (m) { return st.materials[m.id]; }) : [];
  }
  function currentMaterial() { var ms = materials(); return ms.length ? ms[Math.min(matIdx, ms.length - 1)] : null; }
  function isSample() {
    var st = DotGame.Data.study, m = currentMaterial();
    return !!((st.index && st.index.is_sample) || (m && st.materials[m.id] && st.materials[m.id].is_sample));
  }

  function renderMenu() {
    var m = currentMaterial(), ms = materials();
    el.ac_material.textContent = m ? (m.title + (ms.length > 1 ? '  (' + (matIdx + 1) + '/' + ms.length + ')' : '')) : '교재 데이터 없음';
    el.ac_pagecount.textContent = m && m.page_count ? '(전체 ' + m.page_count + '쪽)' : '';
    el.ac_badge.classList.toggle('hidden', !isSample());
  }

  function setFocus(i) {
    focus = Math.max(0, Math.min(ROWS.length - 1, i));
    el.rows.forEach(function (r, k) { r.classList.toggle('focused', k === focus); });
    var name = ROWS[focus];
    if (name === 'start' || name === 'end') { var inp = el['ac_' + name]; inp.focus(); inp.select(); }
    else { if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); }
  }

  function error(msg) { el.ac_error.textContent = msg || ''; }

  function readRange() {
    var m = currentMaterial();
    if (!m) return { err: '학습 데이터를 불러오지 못했어요. (data/study/ 확인 필요)' };
    var sTxt = el.ac_start.value.trim(), eTxt = el.ac_end.value.trim();
    if (!/^\d+$/.test(sTxt) || !/^\d+$/.test(eTxt)) return { err: '시작/끝 페이지를 숫자로 입력해 주세요.' };
    var s = parseInt(sTxt, 10), e = parseInt(eTxt, 10);
    if (s < 1 || e < 1) return { err: '페이지는 1 이상이어야 해요.' };
    if (s > e) return { err: '시작 페이지가 끝 페이지보다 클 수 없어요.' };
    if (m.page_count && e > m.page_count) return { err: '이 교재는 ' + m.page_count + '쪽까지 있어요.' };
    return { s: s, e: e, material: m };
  }

  // 마지막 학습 범위(세이브) → 입력칸 미리 채우기
  function prefill() {
    var lr = DotGame.Save.data && DotGame.Save.data.academy.last_range;
    if (!lr || el.ac_start.value || el.ac_end.value) return;
    var ms = materials();
    for (var i = 0; i < ms.length; i++) if (ms[i].id === lr.material_id) matIdx = i;
    el.ac_start.value = String(lr.start); el.ac_end.value = String(lr.end);
  }

  // 퀴즈 세트 결과를 세이브에 기록 (끝까지 풀었거나, 1문제 이상 풀고 닫았을 때)
  function saveQuizSession() {
    var Q = quiz;
    if (!Q || Q.saved) return;
    var answered = Q.i + (Q.answered || Q.finished ? 1 : 0);
    if (Q.finished) answered = Q.list.length;
    if (answered < 1) return;
    Q.saved = true;
    DotGame.Save.recordQuizSession(Q.materialId, Q.s, Q.e, Q.list.length, answered, Q.score, Q.finished);
  }

  function sampleNote() { return isSample() ? '[예시 데이터] ' : ''; }

  function run(kind) {
    var r = readRange();
    if (r.err) { error(r.err); return; }
    error('');
    DotGame.Save.setLastRange(r.material.id, r.s, r.e);
    var q = DotGame.Data.queryStudy(r.material.id, r.s, r.e);
    var rangeTxt = 'p.' + r.s + '–' + r.e;
    if (kind === 'summary') {
      var pages = [{ text: sampleNote() + '「' + r.material.title + '」 ' + rangeTxt + ' 범위 요약이에요.' +
        (isSample() ? ' (검증된 시험 자료가 아닌 예시 내용이에요.)' : '') }];
      if (!q.chunks.length) {
        pages.push({ text: rangeTxt + ' 범위에 해당하는 요약이 아직 없어요. 다른 페이지 범위를 입력해 보세요!' });
      } else {
        q.chunks.forEach(function (c, idx) {
          var meta = '요약 ' + (idx + 1) + '/' + q.chunks.length + ' · p.' + c.pages[0] + '–' + c.pages[1] + (isSample() ? ' · 예시 데이터' : '');
          if (c.title) pages.push({ text: '「' + c.title + '」', meta: meta, title: true });
          c.summary.forEach(function (line) {
            if (typeof line !== 'string' || !line.trim()) return;
            DotGame.Data.splitLong(line.trim()).forEach(function (t) { pages.push({ text: t, meta: meta }); });
          });
        });
        pages.push({ text: '요약은 여기까지! 예상 문제도 풀어 보면 더 오래 기억에 남아요.' });
      }
      close();
      DotGame.Dialogue.open({ speaker: SPEAKER, isSample: isSample(), pages: pages });
      return;
    }
    // quiz
    if (!q.questions.length) {
      close();
      DotGame.Dialogue.open({ speaker: SPEAKER, isSample: isSample(), pages: [
        { text: sampleNote() + rangeTxt + ' 범위에 해당하는 예상 문제가 아직 없어요. 범위를 넓혀서 다시 시도해 볼까요?' }
      ] });
      return;
    }
    quiz = { list: q.questions.slice(0, QUIZ_MAX), i: 0, selected: 0, answered: false, score: 0, finished: false, range: rangeTxt,
             materialId: r.material.id, s: r.s, e: r.e, saved: false };
    mode = 'quiz';
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    el.ac_menu.classList.add('hidden');
    el.ac_quiz.classList.remove('hidden');
    renderQuiz();
  }

  var NUM = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨'];
  function renderQuiz() {
    var Q = quiz, res = el.ac_q_result;
    el.ac_q_choices.innerHTML = '';
    res.className = 'ac-q-result hidden';
    if (Q.finished) {
      var pct = Math.round(Q.score / Q.list.length * 100);
      el.ac_q_head.textContent = '결과 · ' + Q.range + (isSample() ? ' · 예시 데이터' : '');
      el.ac_q_text.textContent = Q.list.length + '문제 중 ' + Q.score + '문제 정답! (' + pct + '점)' +
        (pct >= 60 ? '  잘했어요!' : '  요약을 한 번 더 보고 다시 도전해 봐요.');
      el.ac_q_help.textContent = 'Enter / Esc : 닫기';
      return;
    }
    var q = Q.list[Q.i];
    el.ac_q_head.textContent = '예상 문제 ' + (Q.i + 1) + '/' + Q.list.length + ' · p.' + q._pages[0] + '–' + q._pages[1] +
      (isSample() ? ' · 예시 데이터' : '');
    el.ac_q_text.textContent = q.question;
    q.choices.forEach(function (c, k) {
      var li = document.createElement('li');
      li.textContent = (NUM[k] || (k + 1) + '.') + ' ' + c;
      if (k === Q.selected) li.classList.add('selected');
      if (Q.answered) {
        if (k === q.answer_index) li.classList.add('correct');
        else if (k === Q.selected) li.classList.add('wrong');
      }
      if (!Q.answered) {
        li.addEventListener('mousedown', function () { Q.selected = k; renderQuiz(); });
        li.addEventListener('dblclick', submit);
      }
      el.ac_q_choices.appendChild(li);
    });
    if (Q.answered) {
      var ok = Q.selected === q.answer_index;
      res.className = 'ac-q-result ' + (ok ? 'ok' : 'ng');
      res.innerHTML = '';
      var h = document.createElement('div'); h.className = 'ac-q-verdict';
      h.textContent = ok ? '정답입니다!' : '아쉽게도 오답이에요.';
      var a = document.createElement('div');
      a.textContent = '정답: ' + (NUM[q.answer_index] || '') + ' ' + q.choices[q.answer_index];
      var x = document.createElement('div'); x.className = 'ac-q-expl';
      x.textContent = '해설: ' + (q.explanation || '(해설 없음)');
      res.appendChild(h); res.appendChild(a); res.appendChild(x);
      el.ac_q_help.textContent = Q.i < Q.list.length - 1 ? 'Enter : 다음 문제 · Esc : 닫기' : 'Enter : 결과 보기 · Esc : 닫기';
    } else {
      el.ac_q_help.textContent = '↑↓ 또는 숫자키 : 선택 · Enter : 제출 · Esc : 닫기';
    }
  }

  function submit() {
    var Q = quiz;
    if (!Q || Q.finished) { close(); return; }
    if (!Q.answered) {
      Q.answered = true;
      if (DotGame.Save.recordAnswer(Q.materialId, Q.list[Q.i], Q.selected)) Q.score += 1;
    } else if (Q.i < Q.list.length - 1) {
      Q.i += 1; Q.selected = 0; Q.answered = false;
    } else {
      Q.finished = true;
      saveQuizSession();
    }
    renderQuiz();
  }

  function onKey(e) {
    if (!open) return;
    e.stopPropagation();               // Phaser 로 전달 금지 (문자 입력 기본동작은 유지)
    var k = e.key;
    if (k === 'Escape') { e.preventDefault(); close(); return; }
    if (mode === 'quiz') {
      var Q = quiz, n = Q && !Q.finished ? Q.list[Q.i].choices.length : 0;
      if (k === 'Enter' || k === ' ') { e.preventDefault(); if (!e.repeat) submit(); return; }
      if (!Q.answered && !Q.finished) {
        if (k === 'ArrowUp' || k === 'w' || k === 'W') { e.preventDefault(); Q.selected = (Q.selected + n - 1) % n; renderQuiz(); }
        else if (k === 'ArrowDown' || k === 's' || k === 'S') { e.preventDefault(); Q.selected = (Q.selected + 1) % n; renderQuiz(); }
        else if (/^[1-9]$/.test(k) && parseInt(k, 10) <= n) { e.preventDefault(); Q.selected = parseInt(k, 10) - 1; renderQuiz(); }
      }
      return;
    }
    // menu
    var row = ROWS[focus];
    if (k === 'ArrowUp') { e.preventDefault(); setFocus(focus - 1); }
    else if (k === 'ArrowDown' || k === 'Tab') { e.preventDefault(); setFocus(e.shiftKey && k === 'Tab' ? focus - 1 : focus + 1); }
    else if ((k === 'ArrowLeft' || k === 'ArrowRight') && row === 'material') {
      e.preventDefault();
      var ms = materials(); if (ms.length) { matIdx = (matIdx + (k === 'ArrowLeft' ? ms.length - 1 : 1)) % ms.length; renderMenu(); }
    } else if (k === 'Enter') {
      e.preventDefault();
      if (e.repeat) return;
      if (row === 'summary' || row === 'quiz') run(row);
      else setFocus(focus + 1);
    } else if (k === ' ' && (row === 'summary' || row === 'quiz')) { e.preventDefault(); if (!e.repeat) run(row); }
  }

  function openAcademy(closeCb) {
    init();
    open = true; mode = 'menu'; quiz = null; onCloseCb = closeCb || null;
    el.ac_menu.classList.remove('hidden');
    el.ac_quiz.classList.add('hidden');
    error(materials().length ? '' : '학습 데이터를 불러오지 못했어요. (data/study/ 확인 필요)');
    prefill();
    renderMenu();
    el.root.classList.remove('hidden');
    document.addEventListener('keydown', onKey, true);
    setFocus(el.ac_start.value ? 3 : 1);
  }

  function close() {
    if (!open) return;
    if (mode === 'quiz') saveQuizSession();
    open = false;
    document.removeEventListener('keydown', onKey, true);
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    el.root.classList.add('hidden');
    var cb = onCloseCb; onCloseCb = null;
    if (cb) cb();
  }

  return {
    open: openAcademy, close: close,
    isOpen: function () { return open; },
    info: function () {
      return { open: open, mode: mode, focus: ROWS[focus],
        quiz: quiz ? { index: quiz.i, total: quiz.list.length, answered: quiz.answered, score: quiz.score, finished: quiz.finished } : null };
    }
  };
})();
