import { useEffect, useReducer, useState } from "react";
import "./App.css";

function App() {
  let classSkill = require("./classSkill.json"); //classSkill종합파일
  let classSkillList = Object.keys(classSkill); //class목록 추출

  let classIcon = require("./classIcon.json");
  let classDivision = ["아르카나", "배틀마스터", "블레이드", "호크아이", "도화가"];
  let classDivision2 = ["전사", "마법사", "무도가", "암살자", "헌터", "스페셜리스트"];
  let newclassDivision = {}; //class 클래스별 정리
  let test = [];
  let [classSkillCount, setClassSkillCount] = useState(0); //전체스킬개수(api검색수)
  let [nowClassSkillCount, setNowClassSkillCount] = useState(0);

  let [apiKey, setapiKey] = useState(() => JSON.parse(window.localStorage.getItem("apiKey")) || "");
  let [checked, setChecked] = useState([]); //class 체크 저장
  let [gemLevel, setGemLevel] = useState("5레벨"); //보석 레벨 저장
  let [gemDamCol, setGemDamCol] = useState("멸화"); //보석 멸홍 저장
  let [gemListAll, setGemListAll] = useState([]); //검색후 결과 저장

  let count123 = 0;
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0);

  /*클래스 분류*/
  let count1 = 0;
  let count2 = 0;
  classSkillList.map((a, i) => {
    classDivision.map((b, j) => {
      if (a == b) {
        newclassDivision[classDivision2[count2++]] = test;
        count1 = 0;
        test = [];
      }
    });
    test[count1++] = a;
  });
  newclassDivision[classDivision2[count2]] = test;

  const handleCheck = (e) => {
    //체크할때마다 실시칸 배열저장
    e.stopPropagation();
    let updatedList = [...checked];
    if (e.target.checked) {
      updatedList = [...checked, e.target.value];
    } else {
      updatedList.splice(checked.indexOf(e.target.value), 1);
    }
    setChecked(updatedList);
  };

  function api() {
    let count = 0;
    let timeCount = 1;
    setGemListAll(() => []);
    checked.map((b) => {
      //체크한 직업만큼 반복
      classSkill[b].map((a, i) => {
        timeCount++;
        if (count > 89) {
          setTimeout(() => {
            count++;

            //체크한 직업의 스킬만큼 반복
            var XMLHttpRequest = require("xhr2");
            var xhr2 = new XMLHttpRequest();
            xhr2.open("POST", "https://developer-lostark.game.onstove.com/auctions/items", true);
            xhr2.setRequestHeader("accept", "application/json");
            xhr2.setRequestHeader("authorization", `bearer ${apiKey.replaceAll(" ", "")}`);
            xhr2.setRequestHeader("content-Type", "application/json");
            xhr2.onreadystatechange = () => {
              // if (xhr2.readyState === 1 || xhr2.readyState === 2 || xhr2.readyState === 3) {
              //   console.log("처리중");
              // } else if (xhr2.readyState === 4) {
              //   console.log("처리완료");
              // }
            };

            xhr2.send(
              JSON.stringify({
                ItemLevelMin: 0,
                ItemLevelMax: 0,
                ItemGradeQuality: null,
                SkillOptions: [
                  {
                    FirstOption: a.Value,
                    SecondOption: null,
                    MinValue: null,
                    MaxValue: null,
                  },
                ],
                EtcOptions: [
                  {
                    FirstOption: null,
                    SecondOption: null,
                    MinValue: null,
                    MaxValue: null,
                  },
                ],
                Sort: "BUY_PRICE",
                CategoryCode: 210000,
                CharacterClass: b,
                ItemTier: 3,
                ItemGrade: null,
                ItemName: `${gemLevel} ${gemDamCol}`,
                PageNo: 0,
                SortCondition: "ASC",
              })
            );

            xhr2.onload = () => {
              let classGem = JSON.parse(xhr2.response); //직업스킬 불러옴

              if (xhr2.status == 200) {
                if (classGem.TotalCount !== 0) {
                  let test = {}; //오브젝트 생성
                  test.skillValue = a.Value; //스킬값 저장
                  test.price = classGem.Items[0].AuctionInfo.BuyPrice; //즉시구매가 저장
                  test.skillName = classGem.Items[0].Options[0].OptionName; //스킬이름 저장
                  test.className = classGem.Items[0].Options[0].ClassName; //직업이름 저장
                  test.Icon = a.Icon; //아이콘 경로 저장
                  setGemListAll((gemListAll) => [...gemListAll, test]); //list에 저장
                  setNowClassSkillCount(count);
                }
              }
            };
          }, Math.floor(timeCount / 91) * 62000);
        }
        //체크한 직업의 스킬만큼 반복
        else {
          count++;
          var XMLHttpRequest = require("xhr2");
          var xhr2 = new XMLHttpRequest();
          xhr2.open("POST", "https://developer-lostark.game.onstove.com/auctions/items", true);
          xhr2.setRequestHeader("accept", "application/json");
          xhr2.setRequestHeader("authorization", `bearer ${apiKey.replaceAll(" ", "")}`);
          xhr2.setRequestHeader("content-Type", "application/json");
          xhr2.onreadystatechange = () => {
            // if (xhr2.readyState === 1 || xhr2.readyState === 2 || xhr2.readyState === 3) {
            //   console.log("처리중");
            // } else if (xhr2.readyState === 4) {
            //   console.log("처리완료");
            // }
          };

          xhr2.send(
            JSON.stringify({
              ItemLevelMin: 0,
              ItemLevelMax: 0,
              ItemGradeQuality: null,
              SkillOptions: [
                {
                  FirstOption: a.Value,
                  SecondOption: null,
                  MinValue: null,
                  MaxValue: null,
                },
              ],
              EtcOptions: [
                {
                  FirstOption: null,
                  SecondOption: null,
                  MinValue: null,
                  MaxValue: null,
                },
              ],
              Sort: "BUY_PRICE",
              CategoryCode: 210000,
              CharacterClass: b,
              ItemTier: 3,
              ItemGrade: null,
              ItemName: `${gemLevel} ${gemDamCol}`,
              PageNo: 0,
              SortCondition: "ASC",
            })
          );

          xhr2.onload = () => {
            let classGem = JSON.parse(xhr2.response); //직업스킬 불러옴
            if (xhr2.status == 200) {
              if (classGem.TotalCount !== 0) {
                let test = {}; //오브젝트 생성
                test.skillValue = a.Value; //스킬값 저장
                test.price = classGem.Items[0].AuctionInfo.BuyPrice; //즉시구매가 저장
                test.skillName = classGem.Items[0].Options[0].OptionName; //스킬이름 저장
                test.className = classGem.Items[0].Options[0].ClassName; //직업이름 저장
                test.Icon = a.Icon; //아이콘 경로 저장
                setGemListAll((gemListAll) => [...gemListAll, test]); //list에 저장
                setNowClassSkillCount(count);
              }
            }
          };
        }
      });
    });
  }
  useEffect(() => {
    forceUpdate();
  }, [nowClassSkillCount]);

  useEffect(() => {
    gemListAll.sort((a, b) => {
      //가격내림차순으로 정렬
      if (a.hasOwnProperty("price")) {
        return b.price - a.price;
      }
    });
    forceUpdate();
  }, [gemListAll]);

  useEffect(() => {
    window.localStorage.setItem("apiKey", JSON.stringify(apiKey.replaceAll(" ", "")));
  }, [apiKey]);

  useEffect(() => {
    setClassSkillCount(0);
    let classCount = 0;
    checked.map((a) => {
      //스킬개수 계산
      classSkill[a].map(() => {
        classCount++;
      });
    });
    setClassSkillCount(classCount);
  }, [checked]);

  return (
    <>
      <div className="navbar"></div>
      <div className="main-frame">
        <div className="gem-option">
          <div className="api-input-frame">
            <div className="api-key">
              <span style={{ fontWeight: "600" }}>API 키</span>
              <input
                type="text"
                onChange={(e) => {
                  setapiKey(e.target.value);
                }}
                value={apiKey}
                placeholder="API 키"
              />
            </div>
            <div>
              <span>검색수</span>
              <span>{`${nowClassSkillCount}/${classSkillCount}`}</span>
            </div>
          </div>
          <div className="class-choice">
            {Object.keys(newclassDivision).map((a, i) => {
              return (
                <div className="class-division" key={i}>
                  <span className="class-division-classname">{a}</span>
                  {newclassDivision[a].map((b, j) => {
                    return (
                      <div className="class-division-checkbox" key={count123++}>
                        <label>
                          <input value={b} id={b} type="checkbox" onChange={handleCheck} />
                          <img className="class-icon" src={classIcon[b]} />
                          <span>{b}</span>
                        </label>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
          <div className="gem-choice-damage-cooldown">
            <div className="gem-choice">
              <span>보석 레벨</span>
              <select
                onChange={(e) => {
                  setGemLevel(e.target.value);
                  console.log(e.target.value);
                }}>
                <option value="5레벨">5레벨</option>
                <option value="6레벨">6레벨</option>
                <option value="7레벨">7레벨</option>
                <option value="8레벨">8레벨</option>
                <option value="9레벨">9레벨</option>
                <option value="10레벨">10레벨</option>
              </select>
            </div>
            <div className="gem-damage-cooldown">
              <span>보석 종류</span>
              <div className="gem-damage">
                <input
                  name="gem"
                  value="멸화"
                  id="damage"
                  type="radio"
                  defaultChecked
                  onChange={(e) => {
                    setGemDamCol(e.target.value);
                    console.log(e.target.value);
                  }}
                />
                <label htmlFor="damage">멸화</label>
              </div>
              <div className="gem-cooldown">
                <input
                  name="gem"
                  value="홍염"
                  id="cooldown"
                  type="radio"
                  onChange={(e) => {
                    setGemDamCol(e.target.value);
                    console.log(e.target.value);
                  }}
                />
                <label htmlFor="cooldown">홍염</label>
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              api();
            }}>
            검색
          </button>
        </div>
        <div className="gem-list-frame">
          {gemListAll.map((a, i) => {
            return a.price != null ? (
              <div className="gem-list" key={i}>
                <img src={a.Icon} alt="스킬아이콘" />
                <span className="skill-name">{a.skillName}</span>
                <span className="price">{a.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</span>
                <span className="className">{a.className}</span>
              </div>
            ) : null;
          })}
        </div>
      </div>
    </>
  );
}

export default App;
