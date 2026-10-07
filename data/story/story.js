// 자동 생성 파일 — 직접 수정 금지. 원본: data/story/story.json
// 재생성: python3 tools/build_fallbacks.py
window.STORY_DATA = {
  "version": 1,
  "updated_at": "2026-10-07T01:30:00+09:00",
  "is_sample": false,
  "note": "스토리 봇 작성 v2: 주연 장면 E01~E04(10월) + 단계 진입 핵심 장면 E09(stage3_ready)·E15(stage4_ready)·E24(stage5_ready)·E31(ending_seen). 날짜는 available_from, 늦게 보면 late_lines. E03·E15는 PC방 건물 장면. 학원 NPC 5인(park_youngmi, jung_hyuna, jo_sunmi, lee_jin, kang_myeongheon) 기본 대사. 원본 시안: story/opening_scene_draft.md, story/affection_timeline.md. 나레이션은 narration: true.",
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
          "note": "시작 장면(opening_scene_draft.md). 쉬는 시간 선택지는 반응만 다른 choices(notes / s_type).",
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
              "narration": true,
              "text": "(10월 7일 수요일 아침, 개강 3주 차. 학원 앞.)"
            },
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
              "text": "그럼 다음엔 현수쌤 차례예요. 약속!",
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
              "narration": true,
              "text": "(3층 302호 강의실. 몇 주째 앉는 창가 두 번째 줄에 나란히 앉는다.)"
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
              "text": "(이어폰을 빼고 현수 쪽으로 몸을 돌리며) 현수쌤, 오셨어요? 어제 야구 보셨어요? 이따 쉬는 시간에 얘기해요.",
              "portrait": "kang_myeongheon"
            },
            {
              "narration": true,
              "text": "(다른 사람들 앞에선 말수가 적은 명헌쌤이지만, 현수에게는 늘 먼저 말을 건다.)"
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
              "narration": true,
              "text": "(수업이 이어지고… 쉬는 시간.)"
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
              "prompt": "주연쌤에게 뭐라고 할까?",
              "choices": [
                {
                  "id": "notes",
                  "text": "제 필기 같이 볼래요? 유형별로 표로 정리해 놨어요.",
                  "set_flags": [
                    "e01_choice_notes"
                  ],
                  "lines": [
                    {
                      "speaker": "주연",
                      "text": "표요? 보여 주세요! …와, 깔끔하다. 현수쌤 필기는 뭔가 레시피 같아요.",
                      "portrait": "heroine"
                    },
                    {
                      "speaker": "현수",
                      "text": "필요하면 사진 찍어 가세요.",
                      "portrait": "hero"
                    },
                    {
                      "speaker": "주연",
                      "text": "감사해요. 대신 커피는 제가 계속 살게요.",
                      "portrait": "heroine"
                    }
                  ]
                },
                {
                  "id": "s_type",
                  "text": "주연쌤은 S형(사회형) 같아요. 사람 얘기 들어 주는 거 잘하시잖아요.",
                  "set_flags": [
                    "e01_choice_s_type"
                  ],
                  "lines": [
                    {
                      "speaker": "주연",
                      "text": "(잠깐 놀란 얼굴로 보다가, 작게 웃으며) …그런 말 들으니까 좀 힘나네요.",
                      "portrait": "heroine"
                    },
                    {
                      "speaker": "주연",
                      "text": "카페에서 일할 때도 커피보다 손님 얘기 듣는 게 더 좋았거든요.",
                      "portrait": "heroine"
                    },
                    {
                      "speaker": "현수",
                      "text": "그럼 이 공부, 주연쌤한테 잘 맞을 거예요.",
                      "portrait": "hero"
                    }
                  ]
                }
              ]
            },
            {
              "narration": true,
              "text": "(수업이 끝나고, 노을 진 학원 앞.)"
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
              "narration": true,
              "text": "(마을의 다른 건물에도 들러 보자. 매일 새로운 소식이 있다.)"
            }
          ],
          "late_lines": [
            {
              "narration": true,
              "text": "(늦었지만, 오늘이 이 마을에서의 첫날이다. 개강한 지는 몇 주째, 학원 앞.)"
            },
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
              "text": "그럼 다음엔 현수쌤 차례예요. 약속!",
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
              "narration": true,
              "text": "(3층 302호 강의실. 몇 주째 앉는 창가 두 번째 줄에 나란히 앉는다.)"
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
              "text": "(이어폰을 빼고 현수 쪽으로 몸을 돌리며) 현수쌤, 오셨어요? 어제 야구 보셨어요? 이따 쉬는 시간에 얘기해요.",
              "portrait": "kang_myeongheon"
            },
            {
              "narration": true,
              "text": "(다른 사람들 앞에선 말수가 적은 명헌쌤이지만, 현수에게는 늘 먼저 말을 건다.)"
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
              "text": "자, 쌤들. 오늘은 직업심리학 이어서 갈게요. 곧 쪽지시험 한 번 봅니다.",
              "portrait": "park_youngmi"
            },
            {
              "speaker": "박영미 선생님",
              "text": "점수보다 '어디서 막히는지' 아는 게 목적이에요. 겁먹지 마세요.",
              "portrait": "park_youngmi"
            },
            {
              "narration": true,
              "text": "(수업이 이어지고… 쉬는 시간.)"
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
              "prompt": "주연쌤에게 뭐라고 할까?",
              "choices": [
                {
                  "id": "notes",
                  "text": "제 필기 같이 볼래요? 유형별로 표로 정리해 놨어요.",
                  "set_flags": [
                    "e01_choice_notes"
                  ],
                  "lines": [
                    {
                      "speaker": "주연",
                      "text": "표요? 보여 주세요! …와, 깔끔하다. 현수쌤 필기는 뭔가 레시피 같아요.",
                      "portrait": "heroine"
                    },
                    {
                      "speaker": "현수",
                      "text": "필요하면 사진 찍어 가세요.",
                      "portrait": "hero"
                    },
                    {
                      "speaker": "주연",
                      "text": "감사해요. 대신 커피는 제가 계속 살게요.",
                      "portrait": "heroine"
                    }
                  ]
                },
                {
                  "id": "s_type",
                  "text": "주연쌤은 S형(사회형) 같아요. 사람 얘기 들어 주는 거 잘하시잖아요.",
                  "set_flags": [
                    "e01_choice_s_type"
                  ],
                  "lines": [
                    {
                      "speaker": "주연",
                      "text": "(잠깐 놀란 얼굴로 보다가, 작게 웃으며) …그런 말 들으니까 좀 힘나네요.",
                      "portrait": "heroine"
                    },
                    {
                      "speaker": "주연",
                      "text": "카페에서 일할 때도 커피보다 손님 얘기 듣는 게 더 좋았거든요.",
                      "portrait": "heroine"
                    },
                    {
                      "speaker": "현수",
                      "text": "그럼 이 공부, 주연쌤한테 잘 맞을 거예요.",
                      "portrait": "hero"
                    }
                  ]
                }
              ]
            },
            {
              "narration": true,
              "text": "(수업이 끝나고, 노을 진 학원 앞.)"
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
              "narration": true,
              "text": "(마을의 다른 건물에도 들러 보자. 매일 새로운 소식이 있다.)"
            }
          ]
        },
        {
          "id": "e02_quiz_note",
          "event_id": "E02",
          "available_from": "2026-10-12",
          "location": "academy",
          "stage": "s1_comfortable",
          "requires_flags": [
            "e01_opening_day_done"
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
              "narration": true,
              "text": "(직업심리학 쪽지시험이 끝난 강의실. 주연쌤이 책상에 엎드려 있다.)"
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
          ],
          "late_lines": [
            {
              "narration": true,
              "text": "(며칠 전 본 직업심리학 쪽지시험지가 돌아왔다. 주연쌤이 책상에 엎드려 있다.)"
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
              "text": "(노트를 건네며) 늦었지만 제가 정리한 거예요. 틀린 부분만 같이 봐요.",
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
          "door_mode": "instead",
          "stage": "s1_comfortable",
          "note": "PC방 건물 장면. 문에서 Space → 소식 대신 장면, 다음 방문부터 소식.",
          "requires_flags": [
            "e01_opening_day_done"
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
              "narration": true,
              "text": "(토요일 오후, PC방. 과제를 출력하러 온 주연쌤과 마주쳤다.)"
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
          ],
          "late_lines": [
            {
              "narration": true,
              "text": "(PC방. 과제를 출력하러 온 주연쌤과 마주쳤다.)"
            },
            {
              "speaker": "주연",
              "text": "어, 현수쌤! 여기서 다 보네요. 이거 축구 게임 맞죠? 선수 카드 모으는 거.",
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
          "note": "★ ② 스터디 메이트 진입(11-01부터, stage2_ready).",
          "requires_flags": [
            "e02_quiz_note_done"
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
              "narration": true,
              "text": "(쉬는 시간, 조선미 반장님이 교탁 앞에 선다.)"
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
          ],
          "late_lines": [
            {
              "narration": true,
              "text": "(며칠 전 조선미 반장님이 스터디 짝을 정하자고 했었다. 주연쌤이 머뭇거리며 다가온다.)"
            },
            {
              "speaker": "주연",
              "text": "현수쌤, 혹시… 아직 스터디 짝 없으면, 쉬는 시간에 10분씩만 같이 해 볼래요?",
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
              "text": "약속이에요! 늦게 시작한 만큼 바로 시작해요.",
              "portrait": "heroine"
            }
          ]
        },
        {
          "id": "e09_internal_eval",
          "event_id": "E09",
          "available_from": "2026-11-23",
          "location": "academy",
          "stage": "s2_study_mate",
          "key_event": true,
          "note": "★ ③ 친구 진입(12-01부터, stage3_ready). 타임라인 E09 내부평가 불안.",
          "requires_flags": [
            "e04_study_offer_done"
          ],
          "excludes_flags": [
            "e09_internal_eval_done"
          ],
          "set_flags": [
            "e09_internal_eval_done",
            "stage3_ready"
          ],
          "affection": 3,
          "lines": [
            {
              "narration": true,
              "text": "(11월 말, 내부평가 일정이 공지된 날. 쉬는 시간의 강의실.)"
            },
            {
              "speaker": "박영미 선생님",
              "text": "쌤들, 내부평가 일정 단톡에 올렸어요. 지금까지 한 만큼만 보여 주면 돼요.",
              "portrait": "park_youngmi"
            },
            {
              "speaker": "주연",
              "text": "(평가 일정표를 한참 보다가) …현수쌤, 저 이것저것 하다가 그만둔 게 많거든요.",
              "portrait": "heroine"
            },
            {
              "speaker": "주연",
              "text": "이번에도 중간에 그만두면… 저 진짜 저한테 실망할 것 같아요.",
              "portrait": "heroine"
            },
            {
              "speaker": "현수",
              "text": "주연쌤, 한 달 동안 스터디 한 번도 안 빠졌잖아요. 그게 끝까지 하는 거예요.",
              "portrait": "hero"
            },
            {
              "speaker": "현수",
              "text": "불안하면 평가 전까지 범위 나눠서 같이 봐요. 천천히요.",
              "portrait": "hero"
            },
            {
              "speaker": "주연",
              "text": "…그 말, 적어 둘게요. 힘들 때 꺼내 보게요.",
              "portrait": "heroine"
            },
            {
              "speaker": "주연",
              "text": "(웃으며) 현수쌤은 이제 그냥 동기 말고, 친구 같아요.",
              "portrait": "heroine"
            }
          ],
          "late_lines": [
            {
              "narration": true,
              "text": "(내부평가 일정이 공지된 지 며칠 지난 쉬는 시간. 주연쌤이 일정표를 보고 있다.)"
            },
            {
              "speaker": "주연",
              "text": "(평가 일정표를 한참 보다가) …현수쌤, 저 이것저것 하다가 그만둔 게 많거든요.",
              "portrait": "heroine"
            },
            {
              "speaker": "주연",
              "text": "이번에도 중간에 그만두면… 저 진짜 저한테 실망할 것 같아요.",
              "portrait": "heroine"
            },
            {
              "speaker": "현수",
              "text": "주연쌤, 한 달 동안 스터디 한 번도 안 빠졌잖아요. 그게 끝까지 하는 거예요.",
              "portrait": "hero"
            },
            {
              "speaker": "현수",
              "text": "불안하면 평가 전까지 범위 나눠서 같이 봐요. 천천히요.",
              "portrait": "hero"
            },
            {
              "speaker": "주연",
              "text": "…그 말, 적어 둘게요. 힘들 때 꺼내 보게요.",
              "portrait": "heroine"
            },
            {
              "speaker": "주연",
              "text": "(웃으며) 현수쌤은 이제 그냥 동기 말고, 친구 같아요.",
              "portrait": "heroine"
            }
          ]
        },
        {
          "id": "e15_new_year_countdown",
          "event_id": "E15",
          "available_from": "2026-12-31",
          "location": "pcbang",
          "door_mode": "before",
          "stage": "s3_friend",
          "note": "★ ④ 가까운 사이 진입(01-01부터, stage4_ready). PC방 건물 장면, 장면 뒤 소식.",
          "requires_flags": [
            "e09_internal_eval_done"
          ],
          "excludes_flags": [
            "e15_new_year_countdown_done"
          ],
          "set_flags": [
            "e15_new_year_countdown_done",
            "stage4_ready"
          ],
          "affection": 3,
          "lines": [
            {
              "narration": true,
              "text": "(12월 31일 밤, PC방. 둘이 나란히 앉아 코옵 게임을 하며 자정을 기다린다.)"
            },
            {
              "speaker": "주연",
              "text": "현수쌤, 방금 그거 제 실수 아니에요! …제 실수 맞아요.",
              "portrait": "heroine"
            },
            {
              "speaker": "현수",
              "text": "괜찮아요. 한 판만 더 해요. 아직 시간 있어요.",
              "portrait": "hero"
            },
            {
              "speaker": "주연",
              "text": "(화면을 보다가 조용히) 올해 제일 잘한 일은… 그 학원 등록한 거예요.",
              "portrait": "heroine"
            },
            {
              "speaker": "주연",
              "text": "내년에는… 아니, 내년에도 같이 해요. 공부도, 이것도.",
              "portrait": "heroine"
            },
            {
              "narration": true,
              "text": "(화면 구석의 시계가 00:00이 된다.)"
            },
            {
              "speaker": "현수",
              "text": "새해 복 많이 받으세요, 주연쌤.",
              "portrait": "hero"
            },
            {
              "speaker": "주연",
              "text": "현수쌤도요. 올해는 우리 둘 다 붙는 해예요!",
              "portrait": "heroine"
            }
          ],
          "late_lines": [
            {
              "narration": true,
              "text": "(새해가 밝은 뒤의 PC방. 주연쌤이 옆자리에서 손을 흔든다.)"
            },
            {
              "speaker": "주연",
              "text": "현수쌤! 카운트다운은 놓쳤지만, 새해 첫 판은 같이 해요.",
              "portrait": "heroine"
            },
            {
              "speaker": "현수",
              "text": "좋아요. 한 판만 더가 몇 판이 될지 모르겠지만요.",
              "portrait": "hero"
            },
            {
              "speaker": "주연",
              "text": "(웃다가 조용히) 작년에 제일 잘한 일은… 그 학원 등록한 거예요.",
              "portrait": "heroine"
            },
            {
              "speaker": "주연",
              "text": "올해도 같이 해요. 공부도, 이것도.",
              "portrait": "heroine"
            },
            {
              "speaker": "현수",
              "text": "새해 복 많이 받으세요, 주연쌤.",
              "portrait": "hero"
            },
            {
              "speaker": "주연",
              "text": "현수쌤도요. 올해는 우리 둘 다 붙는 해예요!",
              "portrait": "heroine"
            }
          ]
        },
        {
          "id": "e24_back_from_home",
          "event_id": "E24",
          "available_from": "2027-02-10",
          "location": "academy",
          "stage": "s4_close",
          "key_event": true,
          "note": "★ ⑤ 설렘 진입(02-14부터, stage5_ready). 자습 기간 = 학원 건물 재사용.",
          "requires_flags": [
            "e15_new_year_countdown_done"
          ],
          "excludes_flags": [
            "e24_back_from_home_done"
          ],
          "set_flags": [
            "e24_back_from_home_done",
            "stage5_ready"
          ],
          "affection": 3,
          "lines": [
            {
              "narration": true,
              "text": "(설 연휴가 끝난 2월 10일, 자습실. 본가에 다녀온 주연쌤이 반찬통을 들고 왔다.)"
            },
            {
              "speaker": "주연",
              "text": "현수쌤! 엄마가 반찬 싸 주셨는데, 이건 현수쌤 몫이에요.",
              "portrait": "heroine"
            },
            {
              "speaker": "현수",
              "text": "저까지요? 잘 먹을게요. 어머님께 감사하다고 전해 주세요.",
              "portrait": "hero"
            },
            {
              "speaker": "주연",
              "text": "엄마한테 말하고 왔어요. 이번엔 끝까지 해 볼 거라고.",
              "portrait": "heroine"
            },
            {
              "speaker": "주연",
              "text": "엄마가 그러더라고요. 이번엔 얼굴이 좀 편해 보인다고. …누구 덕분인지는 말 안 했어요.",
              "portrait": "heroine"
            },
            {
              "speaker": "이진",
              "text": "어머~ 두 쌤 요즘 맨날 같이 다니시던데, 반찬까지요?",
              "portrait": "lee_jin"
            },
            {
              "speaker": "주연",
              "text": "이, 이진쌤! 스터디 메이트잖아요, 스터디 메이트!",
              "portrait": "heroine"
            },
            {
              "speaker": "강명헌",
              "text": "(웃으며 현수 옆자리에 앉는다) 현수쌤, 반찬 좋겠네요. 근데 두산 캠프 소식 보셨어요? 올해는 기아가 먼저 웃을 거예요.",
              "portrait": "kang_myeongheon"
            },
            {
              "speaker": "현수",
              "text": "명헌쌤, 그 얘기는 시험 끝나고 길게 해요. 두산 팬도 할 말 많거든요.",
              "portrait": "hero"
            },
            {
              "narration": true,
              "text": "(시험까지 2주. 옆자리의 주연쌤이 오늘따라 자꾸 현수 쪽을 본다.)"
            },
            {
              "speaker": "주연",
              "text": "…현수쌤, 남은 2주도 옆에 있어 줄 거죠? 아, 공부요. 공부.",
              "portrait": "heroine"
            }
          ],
          "late_lines": [
            {
              "narration": true,
              "text": "(설 연휴가 지나고 며칠 뒤, 자습실. 주연쌤이 반찬통을 들고 왔다.)"
            },
            {
              "speaker": "주연",
              "text": "현수쌤! 늦었지만 엄마가 싸 주신 반찬이에요. 이건 현수쌤 몫이에요.",
              "portrait": "heroine"
            },
            {
              "speaker": "현수",
              "text": "저까지요? 잘 먹을게요. 어머님께 감사하다고 전해 주세요.",
              "portrait": "hero"
            },
            {
              "speaker": "주연",
              "text": "엄마한테 말하고 왔어요. 이번엔 끝까지 해 볼 거라고.",
              "portrait": "heroine"
            },
            {
              "speaker": "주연",
              "text": "엄마가 그러더라고요. 이번엔 얼굴이 좀 편해 보인다고. …누구 덕분인지는 말 안 했어요.",
              "portrait": "heroine"
            },
            {
              "speaker": "이진",
              "text": "어머~ 두 쌤 요즘 맨날 같이 다니시던데, 반찬까지요?",
              "portrait": "lee_jin"
            },
            {
              "speaker": "주연",
              "text": "이, 이진쌤! 스터디 메이트잖아요, 스터디 메이트!",
              "portrait": "heroine"
            },
            {
              "speaker": "강명헌",
              "text": "(웃으며 현수 옆자리에 앉는다) 현수쌤, 반찬 좋겠네요. 근데 두산 캠프 소식 보셨어요? 올해는 기아가 먼저 웃을 거예요.",
              "portrait": "kang_myeongheon"
            },
            {
              "speaker": "현수",
              "text": "명헌쌤, 그 얘기는 시험 끝나고 길게 해요. 두산 팬도 할 말 많거든요.",
              "portrait": "hero"
            },
            {
              "narration": true,
              "text": "(시험이 얼마 남지 않았다. 옆자리의 주연쌤이 오늘따라 자꾸 현수 쪽을 본다.)"
            },
            {
              "speaker": "주연",
              "text": "…현수쌤, 시험 날까지 옆에 있어 줄 거죠? 아, 공부요. 공부.",
              "portrait": "heroine"
            }
          ]
        },
        {
          "id": "e31_pass_together",
          "event_id": "E31",
          "kind": "ending",
          "available_from": "2027-03-05",
          "location": "academy",
          "stage": "s5_flutter",
          "key_event": true,
          "note": "★ 엔딩 「같이 합격」(ending_seen → post_ending 단계). 고백 아님, 주연의 살짝 호감 표시.",
          "requires_flags": [
            "e24_back_from_home_done"
          ],
          "excludes_flags": [
            "e31_pass_together_done"
          ],
          "set_flags": [
            "e31_pass_together_done",
            "ending_seen"
          ],
          "affection": 5,
          "lines": [
            {
              "narration": true,
              "text": "(2027년 3월 5일 금요일, 합격자 발표 날. 학원 앞.)"
            },
            {
              "speaker": "주연",
              "text": "현수쌤… 저 손 떨려서 못 누르겠어요. 같이 봐요. 하나, 둘, 셋.",
              "portrait": "heroine"
            },
            {
              "narration": true,
              "text": "(두 사람의 화면에 동시에 '합격'이 뜬다.)"
            },
            {
              "speaker": "주연",
              "text": "합격… 합격이에요! 현수쌤도요?!",
              "portrait": "heroine"
            },
            {
              "speaker": "현수",
              "text": "네. 둘 다 붙었어요, 주연쌤.",
              "portrait": "hero"
            },
            {
              "speaker": "박영미 선생님",
              "text": "제가 그랬죠, 쌤들 충분하다고. 축하해요. 이제 진짜 선생님들이네요.",
              "portrait": "park_youngmi"
            },
            {
              "speaker": "정현아",
              "text": "어머, 두 쌤 다! 오늘은 사탕 말고 케이크 사야겠어요.",
              "portrait": "jung_hyuna"
            },
            {
              "speaker": "조선미",
              "text": "단톡에 바로 올릴게요! 우리 반 진짜 최고예요!",
              "portrait": "jo_sunmi"
            },
            {
              "speaker": "이진",
              "text": "주연쌤 우는 거예요? 저도 울 것 같아요~",
              "portrait": "lee_jin"
            },
            {
              "speaker": "강명헌",
              "text": "현수쌤, 축하해요. 기아랑 두산 얘기는 축하 밥 먹으면서 실컷 해요.",
              "portrait": "kang_myeongheon"
            },
            {
              "narration": true,
              "text": "(축하가 지나가고, 학원 앞에 둘만 남았다.)"
            },
            {
              "speaker": "주연",
              "text": "우리, 진짜 해냈네요. 처음으로 뭔가를 끝까지 해냈어요.",
              "portrait": "heroine"
            },
            {
              "speaker": "주연",
              "text": "…그리고 저, 다른 누구보다 현수쌤이랑 같이 붙어서 제일 좋아요.",
              "portrait": "heroine"
            },
            {
              "narration": true,
              "text": "(주연쌤의 귀가 살짝 빨개진다.)"
            },
            {
              "speaker": "주연",
              "text": "아, 그러니까… 축하 겸, 다음에 둘이서 밥 먹을래요?",
              "portrait": "heroine"
            },
            {
              "speaker": "현수",
              "text": "좋아요. 제가 맛있는 거 해 줄게요.",
              "portrait": "hero"
            },
            {
              "speaker": "주연",
              "text": "…약속이에요, 현수쌤.",
              "portrait": "heroine"
            },
            {
              "narration": true,
              "text": "(「같이 합격」 — 두 사람의 이야기는 조금 더 이어집니다.)"
            }
          ],
          "late_lines": [
            {
              "narration": true,
              "text": "(합격자 발표가 난 지 며칠 지났다. 학원 앞에서 주연쌤이 기다리고 있었다.)"
            },
            {
              "speaker": "주연",
              "text": "현수쌤! 저 결과 혼자 안 보고 기다렸어요. 같이 보기로 했잖아요. 하나, 둘, 셋.",
              "portrait": "heroine"
            },
            {
              "narration": true,
              "text": "(두 사람의 화면에 동시에 '합격'이 뜬다.)"
            },
            {
              "speaker": "주연",
              "text": "합격… 합격이에요! 현수쌤도요?!",
              "portrait": "heroine"
            },
            {
              "speaker": "현수",
              "text": "네. 둘 다 붙었어요, 주연쌤.",
              "portrait": "hero"
            },
            {
              "speaker": "박영미 선생님",
              "text": "제가 그랬죠, 쌤들 충분하다고. 축하해요. 이제 진짜 선생님들이네요.",
              "portrait": "park_youngmi"
            },
            {
              "speaker": "정현아",
              "text": "어머, 두 쌤 다! 오늘은 사탕 말고 케이크 사야겠어요.",
              "portrait": "jung_hyuna"
            },
            {
              "speaker": "조선미",
              "text": "단톡에 바로 올릴게요! 우리 반 진짜 최고예요!",
              "portrait": "jo_sunmi"
            },
            {
              "speaker": "이진",
              "text": "주연쌤 우는 거예요? 저도 울 것 같아요~",
              "portrait": "lee_jin"
            },
            {
              "speaker": "강명헌",
              "text": "현수쌤, 축하해요. 기아랑 두산 얘기는 축하 밥 먹으면서 실컷 해요.",
              "portrait": "kang_myeongheon"
            },
            {
              "narration": true,
              "text": "(축하가 지나가고, 학원 앞에 둘만 남았다.)"
            },
            {
              "speaker": "주연",
              "text": "우리, 진짜 해냈네요. 처음으로 뭔가를 끝까지 해냈어요.",
              "portrait": "heroine"
            },
            {
              "speaker": "주연",
              "text": "…그리고 저, 다른 누구보다 현수쌤이랑 같이 붙어서 제일 좋아요.",
              "portrait": "heroine"
            },
            {
              "narration": true,
              "text": "(주연쌤의 귀가 살짝 빨개진다.)"
            },
            {
              "speaker": "주연",
              "text": "아, 그러니까… 축하 겸, 다음에 둘이서 밥 먹을래요?",
              "portrait": "heroine"
            },
            {
              "speaker": "현수",
              "text": "좋아요. 제가 맛있는 거 해 줄게요.",
              "portrait": "hero"
            },
            {
              "speaker": "주연",
              "text": "…약속이에요, 현수쌤.",
              "portrait": "heroine"
            },
            {
              "narration": true,
              "text": "(「같이 합격」 — 두 사람의 이야기는 조금 더 이어집니다.)"
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
        "현수쌤, 오셨어요? 오늘은 야구 얘기 좀 해요. 기아 팬도 두산한테 할 말 많거든요."
      ]
    }
  }
};
