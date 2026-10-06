/*
 * npc.js — NPC 대화 훅. NPC 목록은 map.js DotGame.NPCS (heroine + 학원 NPC 5인, docs/NPCS.md)
 *   DotGame.NPC.talk(npcDef) → data/story/story.json 의 characters[id] 를 읽어 대화창으로 표시.
 *   장면 선택·재생은 story.js (날짜 트리거, 밀린 이벤트, 단계, 선택지, 나레이션), 일일 반응은 daily.js.
 *   맞는 장면이 없으면 일일 반응 → default_lines → fallback_lines → 내장 placeholder 대사.
 *   플래그/호감도는 DotGame.Save (localStorage) 에 저장되어 새로고침 후에도 유지된다.
 */
window.DotGame = window.DotGame || {};

DotGame.NPC = (function () {
  var PLACEHOLDER = {
    heroine: ['……(같은 반 학생이 직업상담사 2급 교재를 넘기고 있다.)', '(아직 대사가 준비되지 않았어요. 스토리 데이터를 기다리는 중 — data/story/story.json)']
  };
  // 받침 있으면 '이', 없으면 '가'
  function josaIGa(word) {
    var c = word.charCodeAt(word.length - 1) - 0xAC00;
    return c >= 0 && c < 11172 && c % 28 ? '이' : '가';
  }
  function placeholderLines(npc) {
    if (PLACEHOLDER[npc.id]) return PLACEHOLDER[npc.id];
    var who = (npc.name || '???') + (npc.role === '강사' || npc.role === '반장' ? ' ' + npc.role + '님' : '');
    return ['(' + who + josaIGa(who) + ' 가볍게 눈인사를 한다.)', '(아직 대사가 준비되지 않았어요 — data/story/story.json 의 characters.' + npc.id + ')'];
  }
  // story.json characters 에서 이 NPC 항목 찾기: id → storyKeys(별칭) 순서
  function findCharacter(data, npc) {
    if (!data || !data.characters) return null;
    var keys = [npc.id].concat(npc.storyKeys || []);
    for (var i = 0; i < keys.length; i++) {
      var c = data.characters[keys[i]];
      if (c && typeof c === 'object') return c;
    }
    return null;
  }

  // where: NPC 가 지금 서 있는 곳 (기본 장소, 또는 스토리 장면 때문에 방문 중인 건물 id)
  //   1) 스토리 장면 (game/js/story.js: 날짜·밀린 이벤트·단계·플래그·장소 조건)
  //   2) 오늘의 일일 반응 on_talk (game/js/daily.js)
  //   3) story.json default_lines → 4) daily_reactions.json fallback_lines → 5) 내장 placeholder
  function talk(npc, where) {
    var Story = DotGame.Story, data = DotGame.Data.story.data;
    where = where || Story.homeOf(npc.id) || npc.location;
    var sc = Story.talkScene(npc.id, where);
    if (sc) return Story.play(npc.id, sc);
    var r = DotGame.Daily.pick({ where: where, trigger: 'on_talk', character: DotGame.Daily.charFor(npc.id) });
    if (r && DotGame.Daily.play(r)) return;
    var ch = findCharacter(data, npc);
    var name = (ch && ch.name) || npc.name || '???';
    var isSample = !!(data && data.is_sample);
    var pages = [];
    if (ch && Array.isArray(ch.default_lines) && ch.default_lines.length) {
      ch.default_lines.forEach(function (t) { if (typeof t === 'string') pages.push({ text: t }); });
    }
    if (!pages.length) {
      var fb = DotGame.Daily.fallbackLine(npc.id);
      if (fb) pages = [{ text: fb }];
    }
    if (!pages.length) pages = placeholderLines(npc).map(function (t) { return { text: t }; });
    if (isSample) pages[0] = Object.assign({}, pages[0], { text: '[예시 데이터] ' + pages[0].text });
    DotGame.Dialogue.open({ speaker: name, portrait: npc.id, isSample: isSample, pages: pages });
  }

  return { talk: talk };
})();
