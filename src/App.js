import { useEffect, useReducer, useState } from "react";
import "./style/App.css";
import Modal from "react-modal";

//modal 오류방지
Modal.setAppElement("#root");

const customModalStyles = {
  //모달창 css설정
  overlay: {
    //밖
    backgroundColor: " rgba(0, 0, 0, 0.4)",
    width: "100%",
    height: "100vh",
    zIndex: "10",
    position: "fixed",
    top: "0",
    left: "0",
  },
  content: {
    //내용
    display: "flex",
    width: "250px",
    height: "250px",
    zIndex: "150",
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    borderRadius: "10px",
    border: "2px solid gray",
    backgroundColor: "#424242",
    justifyContent: "center",
    overflow: "auto",
  },
};

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

  let [modalIsOpen, setModalIsOpen] = useState(false); //모달창
  let [apiKey, setapiKey] = useState(() => (JSON.parse(window.localStorage.getItem("apiKey")) ? JSON.parse(window.localStorage.getItem("apiKey")) : ["", "", "", "", ""]));
  let [checked, setChecked] = useState(() => JSON.parse(window.localStorage.getItem("checked")) || []); //class 체크 저장
  let [gemLevel, setGemLevel] = useState(() => JSON.parse(window.localStorage.getItem("gemLevel")) || "5레벨"); //보석 레벨 저장
  let [gemDamCol, setGemDamCol] = useState(() => JSON.parse(window.localStorage.getItem("gemDamCol")) || "멸화"); //보석 멸홍 저장
  let [itemTier, setItemTier] = useState(() => JSON.parse(window.localStorage.getItem("itemTier")) || "3"); //아이템 티어
  let [gemListAll, setGemListAll] = useState([]); //검색후 결과 저장

  /**state리로딩 함수 */
  let [ignored, forceUpdate] = useReducer((x) => x + 1, 0);

  /**클래스 분류*/
  let classDivisionArray = [];
  let count1 = 0;
  let count2 = 0;
  classSkillList.forEach((a) => {
    classDivision.forEach((b) => {
      if (a === b) {
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

  let count = 0; //검색카운트
  let apicount = 0; //api카운트
  let apikeycount = apiKey.reduce((a, b) => (b !== "" ? a + 1 : a), 0); //api키 개수
  /**api실행 */
  function api() {
    count = 0;
    setGemListAll(() => []);
    //체크한 직업만큼 반복
    checked.forEach((b) => {
      //체크한 직업의 스킬만큼 반복
      classSkill[b].forEach((a) => {
        //검색api
        apicount++;
        if (Math.trunc(apicount / 100) === apikeycount) apicount = 0;
        apiSend(a, b, Math.trunc(apicount / 100));
      });
    });
  }

  /**api전송 */
  function apiSend(a, b, i) {
    var XMLHttpRequest = require("xhr2");
    var xhr2 = new XMLHttpRequest();
    xhr2.open("POST", "https://developer-lostark.game.onstove.com/auctions/items", true);
    xhr2.setRequestHeader("accept", "application/json");
    //xhr2.setRequestHeader("authorization", `bearer ${apiKey.replaceAll(" ", "")}`);
    xhr2.setRequestHeader("authorization", `bearer ${apiKey[i].replaceAll(" ", "")}`);
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
        CharacterClass: null,
        ItemTier: itemTier,
        ItemGrade: null,
        ItemName: `${gemLevel} ${gemDamCol}`,
        PageNo: 0,
        SortCondition: "ASC",
      })
    );

    xhr2.onload = () => {
      let classGem = JSON.parse(xhr2.response); //직업스킬 불러옴
      count++;
      if (xhr2.status === 200 && classGem.TotalCount !== 0) {
        let apiSearchValue = {}; //오브젝트 생성
        apiSearchValue.skillValue = a.Value; //스킬값 저장
        apiSearchValue.price = classGem.Items[0].AuctionInfo.BuyPrice; //즉시구매가 저장
        apiSearchValue.skillName = a.Text; //스킬이름 저장
        apiSearchValue.className = b; //직업이름 저장
        apiSearchValue.Icon = a.Icon; //아이콘 경로 저장
        setGemListAll((gemListAll) => [...gemListAll, apiSearchValue]); //list에 저장
        setNowClassSkillCount(count);
        console.log(apiSearchValue);
      } else if (xhr2.status === 429) {
        count--;
        //api키를 전부 사용하면 22초뒤 다시시도
        if (apiKey.reduce((a, b) => (b !== "" ? a + 1 : a), 0) === i + 1) {
          setTimeout(() => {
            apiSend(a, b, 0);
          }, 22000);
        }
        //api키가 남아있으면 재시도
        else {
          apiSend(a, b, i + 1);
        }
      }
    };
  }

  //state리로딩
  useEffect(() => {
    forceUpdate();
  }, [nowClassSkillCount]);

  //paice내림차순으로 정렬
  useEffect(() => {
    gemListAll.sort((a, b) => b.price - a.price);
    forceUpdate();
  }, [gemListAll]);

  //gemLevel-localstorage 저장
  useEffect(() => {
    window.localStorage.setItem("gemLevel", JSON.stringify(gemLevel));
  }, [gemLevel]);

  //itemTier-localstorage 저장
  useEffect(() => {
    if (itemTier === "3") {
      if (gemDamCol === "작열") {
        setGemDamCol("홍염");
      } else {
        setGemDamCol("멸화");
      }
    } else {
      if (gemDamCol === "홍염") {
        setGemDamCol("작열");
      } else {
        setGemDamCol("겁화");
      }
    }
    window.localStorage.setItem("itemTier", JSON.stringify(itemTier));
    window.localStorage.setItem("gemDamCol", JSON.stringify(gemDamCol));
  }, [itemTier, gemDamCol]);

  //api-key-localstorage저장
  useEffect(() => {
    window.localStorage.setItem("apiKey", JSON.stringify(apiKey.map((a) => a.replaceAll(" ", ""))));
  }, [apiKey]);

  //ckecked-localstorage저장
  useEffect(() => {
    window.localStorage.setItem("checked", JSON.stringify(checked));
  }, [checked]);

  //스킬개수 계산
  useEffect(() => {
    setClassSkillCount(0);
    let classCount = 0;

    // 만약 classSkill이라는 변수를 사용하지 않는다면, 해당 코드를 제거
    // classSkill[a].forEach(() => {
    //   classCount++;
    // });

    checked.forEach((a) => {
      // classSkill[a].forEach(() => {
      //   classCount++;
      // });
      // 위의 코드를 아래와 같이 수정
      classCount += classSkill[a].length;
    });

    setClassSkillCount(classCount);
  }, [checked, classSkill]); // 의존성 배열에 classSkill 추가

  return (
    <>
      <header className="navbar">
        <h1 className="navbar-title">LoaGem</h1>
      </header>

      <div className="main-frame">
        <div className="gem-option">
          <div className="api-input-frame">
            <div className="api-key">
              <span style={{ display: "none" }}>{ignored}</span>
              <button onClick={() => setModalIsOpen(true)}>API 키</button>
              <Modal style={customModalStyles} isOpen={modalIsOpen} closeTimeoutMS={250} onRequestClose={() => setModalIsOpen(false)}>
                <div className="api-modal">
                  {apiKey.map((a, i) => {
                    return (
                      <input
                        key={i}
                        type="text"
                        onChange={(e) => {
                          let copy = [...apiKey];
                          copy[i] = e.target.value;
                          setapiKey(copy);
                        }}
                        value={apiKey[i]}
                        placeholder="API 키"
                      />
                    );
                  })}
                  <button onClick={() => setModalIsOpen(false)}>닫기</button>
                </div>
              </Modal>
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
                          <img alt={b} className="class-icon" src={classIcon[b]} />
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
              <span>보석 티어</span>
              <select
                onChange={(e) => {
                  setItemTier(e.target.value);
                  console.log(e.target.value);
                }}
                defaultValue={itemTier}>
                <option value="3">3티어</option>
                <option value="4">4티어</option>
              </select>
            </div>
            <div className="gem-choice">
              <span>보석 레벨</span>
              <select
                onChange={(e) => {
                  setGemLevel(e.target.value);
                  console.log(e.target.value);
                }}
                defaultValue={gemLevel}>
                <option value="5레벨">5레벨</option>
                <option value="6레벨">6레벨</option>
                <option value="7레벨">7레벨</option>
                <option value="8레벨">8레벨</option>
                <option value="9레벨">9레벨</option>
                <option value="10레벨">10레벨</option>
              </select>
            </div>
            {itemTier === "3" ? (
              <div className="gem-damage-cooldown">
                <span>보석 종류</span>
                <div className="gem-damage">
                  <input
                    name="gem"
                    value="멸화"
                    id="damage"
                    type="radio"
                    checked={gemDamCol === "멸화"}
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
                    checked={gemDamCol === "홍염"}
                    onChange={(e) => {
                      setGemDamCol(e.target.value);
                    }}
                  />
                  <label htmlFor="cooldown">홍염</label>
                </div>
              </div>
            ) : (
              <div className="gem-damage-cooldown">
                <span>보석 종류</span>
                <div className="gem-damage">
                  <input
                    name="gem"
                    value="겁화"
                    id="damage"
                    type="radio"
                    checked={gemDamCol === "겁화"}
                    onChange={(e) => {
                      setGemDamCol(e.target.value);
                    }}
                  />
                  <label htmlFor="damage">겁화</label>
                </div>
                <div className="gem-cooldown">
                  <input
                    name="gem"
                    value="작열"
                    id="cooldown"
                    type="radio"
                    checked={gemDamCol === "작열"}
                    onChange={(e) => {
                      setGemDamCol(e.target.value);
                    }}
                  />
                  <label htmlFor="cooldown">작열</label>
                </div>
              </div>
            )}
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
