// 자동 생성 파일 — 직접 수정 금지. 원본: data/story/story.json
// 재생성: python3 tools/build_fallbacks.py
window.STORY_DATA = {
  "version": 1,
  "updated_at": "2026-10-07T00:30:00+09:00",
  "is_sample": false,
  "note": "스토리 봇 작성 v1: 10월(① 편한 동기, 2026-10-07~10-31) 이벤트 E01~E04 + 학원 NPC 5인(park_youngmi, jung_hyuna, jo_sunmi, lee_jin, kang_myeongheon) 기본 대사. NPC 5인은 주연 장면 안에서도 실명·초상화로 등장. 원본 시안: story/opening_scene_draft.md, story/affection_timeline.md. scene 의 event_id/available_from/location/stage/key_event/note 는 개발 봇용 메타데이터(현재 게임은 무시). E02~E04 는 'date_reached_YYYY-MM-DD' 플래그가 생기기 전까지 잠겨 있음. 화자 '　'(전각 공백)+portrait null = 나레이션.",
  "player": {
    "name": "현수"
  },
  "affection_stages": {
    "heroine": [
      {
        "id": "s1_comfortable",
        "name": "① 편한 동기"
      },
      {
        "id": "s2_study_mate",
        "name": "② 스터디 메이트",
        "from": "2026-11-01",
        "requires_flags": [
          "stage2_ready"
        ]
      },
      {
        "id": "s3_friend",
        "name": "③ 친구",
        "from": "2026-12-01",
        "requires_flags": [
          "stage3_ready"
        ]
      },
      {
        "id": "s4_close",
        "name": "④ 가까운 사이",
        "from": "2027-01-01",
        "requires_flags": [
          "stage4_ready"
        ]
      },
      {
        "id": "s5_flutter",
        "name": "⑤ 설렘",
        "from": "2027-02-14",
        "requires_flags": [
          "stage5_ready"
        ]
      },
      {
        "id": "post_ending",
        "name": "엔딩 이후",
        "from": "2027-03-05",
        "requires_flags": [
          "ending_seen"
        ]
      }
    ]
  },
  "characters": {
    "heroine": {
      "name": "주연",
      "location": "academy",
      "scenes": [
        {
          "id": "e01_opening_day",
          "event_id": "E01",
          "available_from": "2026-10-07",
          "location": "academy",
          "stage": "s1_comfortable",
          "note": "시작 장면(opening_scene_draft.md). 쉬는 시간 선택지는 현재 형식에 선택지가 없어 A안(필기 공유)으로 고정.",
          "excludes_flags": [
            "e01_opening_day_done"
          ],
          "set_flags": [
            "e01_opening_day_done",
            "met_heroine"
          ],
          "affection": 1,
          "lines": [
            {
              "speaker": "주연",
              "text": "현수쌤, 좋은 아침이에요! 딱 맞춰 오셨네요.",
              "portrait": "heroine"
            },
            {
              "speaker": "현수",
              "text": "좋은 아침이에요, 주연쌤. 오늘은 일찍 오셨네요.",
              "portrait": "hero"
            },
            {
              "speaker": "주연",
              "text": "(테이크아웃 컵을 내밀며) 지난번에 졸아서 오늘은 커피 수혈하고 왔어요. 라떼 괜찮으시죠?",
              "portrait": "heroine"
            },
            {
              "speaker": "현수",
              "text": "아, 고마워요. 다음엔 제가 살게요.",
              "portrait": "hero"
            },
            {
              "speaker": "주연",
              "text": "그럼 다음 주는 현수쌤 차례예요. 약속!",
              "portrait": "heroine"
            },
            {
              "speaker": "주연",
              "text": "근데 현수쌤, 자기소개 때 요리 좋아한다고 하셨잖아요. 진짜 잘하세요?",
              "portrait": "heroine"
            },
            {
              "speaker": "현수",
              "text": "잘한다기보다… 해 먹는 걸 좋아해요. 혼자 먹어도 제대로 차려 먹는 편이에요.",
              "portrait": "hero"
            },
            {
              "speaker": "주연",
              "text": "와, 부럽다. 저는 자취 7년 차인데 아직도 라면이 제일 자신 있어요.",
              "portrait": "heroine"
            },
            {
              "speaker": "　",
              "text": "(3층 302호 강의실. 3주째 앉는 창가 두 번째 줄에 나란히 앉는다.)",
              "portrait": null
            },
            {
              "speaker": "조선미",
              "text": "현수쌤, 주연쌤 굿모닝! 출석 사인 여기요. 쪽지시험 공지도 단톡에 올려 둘게요!",
              "portrait": "jo_sunmi"
            },
            {
              "speaker": "이진",
              "text": "주연쌤! 오늘 가디건 색 너무 예뻐요. 아, 현수쌤도 안녕하세요~",
              "portrait": "lee_jin"
            },
            {
              "speaker": "강명헌",
              "text": "(이어폰을 빼며 작게 목례) …안녕하세요.",
              "portrait": "kang_myeongheon"
            },
            {
              "speaker": "정현아",
              "text": "두 쌤, 귤 하나씩 드세요. 애들 간식 챙기다 보니까 가방에 늘 있어요.",
              "portrait": "jung_hyuna"
            },
            {
              "speaker": "주연",
              "text": "감사합니다, 현아쌤! (귤 하나를 현수쌤 책상으로 굴려 준다)",
              "portrait": "heroine"
            },
            {
              "speaker": "박영미 선생님",
              "text": "자, 쌤들. 오늘은 직업심리학 이어서 갈게요. 다음 주에 쪽지시험 한 번 봅니다.",
              "portrait": "park_youngmi"
            },
            {
              "speaker": "박영미 선생님",
              "text": "점수보다 '어디서 막히는지' 아는 게 목적이에요. 겁먹지 마세요.",
              "portrait": "park_youngmi"
            },
            {
              "speaker": "　",
              "text": "(수업이 이어지고… 쉬는 시간.)",
              "portrait": null
            },
            {
              "speaker": "주연",
              "text": "홀랜드 유형… RIASEC… 들을 땐 알겠는데 돌아서면 다 섞여요.",
              "portrait": "heroine"
            },
            {
              "speaker": "주연",
              "text": "저 원래 공부를 잘하는 편이 아니라서요. 그래도 이번엔 끝까지 해 보고 싶어요.",
              "portrait": "heroine"
            },
            {
              "speaker": "현수",
              "text": "제 필기 같이 볼래요? 유형별로 표로 정리해 놨어요.",
              "portrait": "hero"
            },
            {
              "speaker": "주연",
              "text": "표요? 보여 주세요! …와, 깔끔하다. 현수쌤 필기는 뭔가 레시피 같아요.",
              "portrait": "heroine"
            },
            {
              "speaker": "　",
              "text": "(수업이 끝나고, 노을 진 학원 앞.)",
              "portrait": null
            },
            {
              "speaker": "주연",
              "text": "오늘도 고생하셨어요, 현수쌤. 저 이제 집 가서 또 라면…",
              "portrait": "heroine"
            },
            {
              "speaker": "현수",
              "text": "오늘은 따뜻한 밥으로 드세요. 쌀쌀하던데.",
              "portrait": "hero"
            },
            {
              "speaker": "주연",
              "text": "…네, 그럴게요. 내일 봬요!",
              "portrait": "heroine"
            },
            {
              "speaker": "　",
              "text": "(마을의 다른 건물에도 들러 보자. 매일 새로운 소식이 있다.)",
              "portrait": null
            }
          ]
        },
        {
          "id": "e02_quiz_note",
          "event_id": "E02",
          "available_from": "2026-10-12",
          "location": "academy",
          "stage": "s1_comfortable",
          "note": "날짜 트리거 미지원 → 'date_reached_2026-10-12' 플래그(게임이 아직 세팅하지 않음)로 잠가 둠.",
          "requires_flags": [
            "e01_opening_day_done",
            "date_reached_2026-10-12"
          ],
          "excludes_flags": [
            "e02_quiz_note_done"
          ],
          "set_flags": [
            "e02_quiz_note_done"
          ],
          "affection": 2,
          "lines": [
            {
              "speaker": "　",
              "text": "(직업심리학 쪽지시험이 끝난 강의실. 주연쌤이 책상에 엎드려 있다.)",
              "portrait": null
            },
            {
              "speaker": "정현아",
              "text": "주연쌤, 사탕 하나 드세요. 우리 애들도 받아쓰기 망치면 딱 이 표정이에요.",
              "portrait": "jung_hyuna"
            },
            {
              "speaker": "주연",
              "text": "…감사해요, 현아쌤. 저 진짜 반도 못 썼어요.",
              "portrait": "heroine"
            },
            {
              "speaker": "현수",
              "text": "(노트를 건네며) 제가 정리한 거예요. 틀린 부분만 같이 봐요.",
              "portrait": "hero"
            },
            {
              "speaker": "주연",
              "text": "현수쌤 노트 보니까… 제가 들은 수업이랑 같은 수업 맞아요?",
              "portrait": "heroine"
            },
            {
              "speaker": "주연",
              "text": "글씨가 너무 깔끔해서 반칙이에요. (웃음) 고마워요, 진짜로.",
              "portrait": "heroine"
            }
          ]
        },
        {
          "id": "e03_pcbang_meet",
          "event_id": "E03",
          "available_from": "2026-10-17",
          "location": "pcbang",
          "stage": "s1_comfortable",
          "note": "원래 PC방 방문 시 이벤트. 위치 트리거 미지원 → 지금은 학원 앞 주연 NPC에서 재생됨(날짜 플래그로 잠금).",
          "requires_flags": [
            "e01_opening_day_done",
            "date_reached_2026-10-17"
          ],
          "excludes_flags": [
            "e03_pcbang_meet_done"
          ],
          "set_flags": [
            "e03_pcbang_meet_done"
          ],
          "affection": 2,
          "lines": [
            {
              "speaker": "　",
              "text": "(토요일 오후, PC방. 과제를 출력하러 온 주연쌤과 마주쳤다.)",
              "portrait": null
            },
            {
              "speaker": "주연",
              "text": "어, 현수쌤! 주말에도 여기 계시네요. 이거 축구 게임 맞죠? 선수 카드 모으는 거.",
              "portrait": "heroine"
            },
            {
              "speaker": "현수",
              "text": "네, FC온라인이에요. 좋아하는 팀으로 스쿼드 짜는 게 재밌어요.",
              "portrait": "hero"
            },
            {
              "speaker": "주연",
              "text": "이 선수가 왜 비싼 거예요? …아, 잘하는구나. 그렇겠네요. (웃음)",
              "portrait": "heroine"
            },
            {
              "speaker": "주연",
              "text": "다음엔 옆에서 구경해도 돼요? 규칙은 천천히 배울게요.",
              "portrait": "heroine"
            }
          ]
        },
        {
          "id": "e04_study_offer",
          "event_id": "E04",
          "available_from": "2026-10-26",
          "location": "academy",
          "stage": "s1_comfortable",
          "key_event": true,
          "note": "★ ② 스터디 메이트 진입 조건(11-01 이후). 날짜 플래그로 잠금.",
          "requires_flags": [
            "e02_quiz_note_done",
            "date_reached_2026-10-26"
          ],
          "excludes_flags": [
            "e04_study_offer_done"
          ],
          "set_flags": [
            "e04_study_offer_done",
            "stage2_ready"
          ],
          "affection": 3,
          "lines": [
            {
              "speaker": "　",
              "text": "(반 단톡방 알림이 울린다.)",
              "portrait": null
            },
            {
              "speaker": "조선미",
              "text": "쌤들! 과목별 스터디 짝 정해 봐요. 같이 하면 무조건 붙어요!",
              "portrait": "jo_sunmi"
            },
            {
              "speaker": "주연",
              "text": "현수쌤, 혹시… 쉬는 시간에 10분씩만 같이 해 볼래요?",
              "portrait": "heroine"
            },
            {
              "speaker": "주연",
              "text": "혼자 하면 저 진짜 미룰 거예요. 감시해 주세요, 현수쌤.",
              "portrait": "heroine"
            },
            {
              "speaker": "현수",
              "text": "좋아요. 노동관계법규부터 같이 해요.",
              "portrait": "hero"
            },
            {
              "speaker": "주연",
              "text": "약속이에요! 다음 주부터 진짜 시작이에요.",
              "portrait": "heroine"
            }
          ]
        }
      ],
      "default_lines": [
        "(교재에 형광펜을 긋다가 고개를 들며) 아, 현수쌤! 오늘도 같이 힘내요."
      ]
    },
    "park_youngmi": {
      "name": "박영미 선생님",
      "location": "academy",
      "scenes": [],
      "default_lines": [
        "현수쌤, 오늘 배운 거 자기 전에 한 번만 다시 보세요. 그게 제일 오래 남아요."
      ]
    },
    "jung_hyuna": {
      "name": "정현아",
      "location": "academy",
      "scenes": [],
      "default_lines": [
        "현수쌤도 사탕 하나 드세요. 당 떨어지면 집중 안 돼요."
      ]
    },
    "jo_sunmi": {
      "name": "조선미",
      "location": "academy",
      "scenes": [],
      "default_lines": [
        "현수쌤! 공지는 단톡에 다 올려 둘게요. 오늘도 파이팅이에요!"
      ]
    },
    "lee_jin": {
      "name": "이진",
      "location": "academy",
      "scenes": [],
      "default_lines": [
        "안녕하세요, 현수쌤~ 오늘 수업도 같이 버텨요!"
      ]
    },
    "kang_myeongheon": {
      "name": "강명헌",
      "location": "academy",
      "scenes": [],
      "default_lines": [
        "(작게 목례) …안녕하세요, 현수쌤."
      ]
    }
  }
};
