import { useEffect, useReducer, useState } from "react";
import "./App.css";

function App() {
  /**classSkill종합 파일*/
  let classSkill = require("./classSkill.json");
  /**class목록 추출*/
  let classSkillList = Object.keys(classSkill);
  /**class아이콘 파일*/
  let classIcon = require("./classIcon.json");
  /**class 직업 분류 */
  let classDivision = ["아르카나", "배틀마스터", "블레이드", "호크아이", "도화가"];
  /**class직업 분류 */
  let classDivision2 = ["전사", "마법사", "무도가", "암살자", "헌터", "스페셜리스트"];
  /**class별 정리 */
  let newclassDivision = {};

  /**전체스킬개수(총api검색수) */
  let [classSkillCount, setClassSkillCount] = useState(0);
  /**현재전체스킬개수(현재총api점색수) */
  let [nowClassSkillCount, setNowClassSkillCount] = useState(0);

  let [apiKey, setapiKey] = useState(() => JSON.parse(window.localStorage.getItem("apiKey")) || "");
  let [checked, setChecked] = useState(() => JSON.parse(window.localStorage.getItem("checked")) || []); //class 체크 저장
  let [gemLevel, setGemLevel] = useState("5레벨"); //보석 레벨 저장
  let [gemDamCol, setGemDamCol] = useState("멸화"); //보석 멸홍 저장
  let [gemListAll, setGemListAll] = useState([]); //검색후 결과 저장

  /**state리로딩 함수 */
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0);

  /**클래스 분류*/
  let classDivisionArray = [];
  let count1 = 0;
  let count2 = 0;
  classSkillList.map((a, i) => {
    classDivision.map((b, j) => {
      if (a == b) {
        newclassDivision[classDivision2[count2++]] = classDivisionArray;
        count1 = 0;
        classDivisionArray = [];
      }
    });
    classDivisionArray[count1++] = a;
  });
  newclassDivision[classDivision2[count2]] = classDivisionArray;

  /**직업 체크할때마다 실시칸 배열저장*/
  const handleCheck = (e) => {
    setNowClassSkillCount(0);
    e.stopPropagation();
    let updatedList = [...checked];
    if (e.target.checked) {
      updatedList = [...checked, e.target.value];
    } else {
      updatedList.splice(checked.indexOf(e.target.value), 1);
    }
    setChecked(updatedList);
  };

  let count = 0;
  function api() {
    count = 0;
    setGemListAll(() => []);
    //체크한 직업만큼 반복
    checked.map((b) => {
      //체크한 직업의 스킬만큼 반복
      classSkill[b].map((a, i) => {
        var XMLHttpRequest = require("xhr2");
        var xhr2 = new XMLHttpRequest();
        xhr2.open("POST", "https://developer-lostark.game.onstove.com/auctions/items", true);
        xhr2.setRequestHeader("accept", "application/json");
        xhr2.setRequestHeader("authorization", `bearer ${apiKey.replaceAll(" ", "")}`);
        xhr2.setRequestHeader("content-Type", "application/json");
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
          count++;
          if (xhr2.status == 200 && classGem.TotalCount !== 0) {
            let apiSearchValue = {}; //오브젝트 생성
            apiSearchValue.skillValue = a.Value; //스킬값 저장
            apiSearchValue.price = classGem.Items[0].AuctionInfo.BuyPrice; //즉시구매가 저장
            apiSearchValue.skillName = classGem.Items[0].Options[0].OptionName; //스킬이름 저장
            apiSearchValue.className = classGem.Items[0].Options[0].ClassName; //직업이름 저장
            apiSearchValue.Icon = a.Icon; //아이콘 경로 저장
            setGemListAll((gemListAll) => [...gemListAll, apiSearchValue]); //list에 저장
            setNowClassSkillCount(count);
            console.log(apiSearchValue);
          } else if (xhr2.status == 429) {
            count--;
            apiResand(a, b);
          }
        };

        //체크한 직업의 스킬만큼 반복
      });
    });
  }

  function apiResand(a, b) {
    var XMLHttpRequest = require("xhr2");
    var xhr2 = new XMLHttpRequest();
    xhr2.open("POST", "https://developer-lostark.game.onstove.com/auctions/items", true);
    xhr2.setRequestHeader("accept", "application/json");
    xhr2.setRequestHeader("authorization", `bearer ${apiKey.replaceAll(" ", "")}`);
    xhr2.setRequestHeader("content-Type", "application/json");
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
      count++;
      if (xhr2.status == 200 && classGem.TotalCount !== 0) {
        let apiSearchValue = {}; //오브젝트 생성
        apiSearchValue.skillValue = a.Value; //스킬값 저장
        apiSearchValue.price = classGem.Items[0].AuctionInfo.BuyPrice; //즉시구매가 저장
        apiSearchValue.skillName = classGem.Items[0].Options[0].OptionName; //스킬이름 저장
        apiSearchValue.className = classGem.Items[0].Options[0].ClassName; //직업이름 저장
        apiSearchValue.Icon = a.Icon; //아이콘 경로 저장
        setGemListAll((gemListAll) => [...gemListAll, apiSearchValue]); //list에 저장
        setNowClassSkillCount(count);
        console.log(apiSearchValue);
      } else if (xhr2.status == 429) {
        count--;
        //20초뒤 다시시도
        setTimeout(() => {
          apiResand(a, b);
        }, 20000);
      }
    };
  }

  useEffect(() => {
    //리로딩
    forceUpdate();
  }, [nowClassSkillCount]);

  useEffect(() => {
    //가격내림차순으로 정렬
    gemListAll.sort((a, b) => {
      if (a.hasOwnProperty("price")) {
        return b.price - a.price;
      }
    });
    forceUpdate();
  }, [gemListAll]);

  useEffect(() => {
    //localstorage저장
    window.localStorage.setItem("apiKey", JSON.stringify(apiKey.replaceAll(" ", "")));
  }, [apiKey]);
  useEffect(() => {
    //localstorage저장
    window.localStorage.setItem("checked", JSON.stringify(checked));
  }, [checked]);

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
      <div className="navbar">
        <span className="navbar-title">LoaGem</span>
      </div>
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
                      <div className="class-division-checkbox" key={j}>
                        <label>
                          <input value={b} id={b} type="checkbox" onChange={handleCheck} checked={checked.includes(`${b}`)} />
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
                }}
              >
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
                  }}
                />
                <label htmlFor="cooldown">홍염</label>
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              api();
            }}
          >
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
