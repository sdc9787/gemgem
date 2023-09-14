import { useEffect, useState } from "react";
import "./App.css";

function App() {
  let classSkill = require("./classSkill.json"); //classSkill종합파일
  let classSkillList = Object.keys(classSkill); //class목록 추출

  let [checked, setChecked] = useState([]); //class 체크 저장
  let [gemLevel, setGemLevel] = useState("7레벨"); //보석 레벨 저장
  let [gemDamCol, setGemDamCol] = useState("멸화"); //보석 멸홍 저장
  let [gemListAll, setGemListAll] = useState([]); //검색후 결과 저장

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
    console.log(updatedList);
  };

  function api() {
    setGemListAll(() => []);
    checked.map((b) => {
      //체크한 직업만큼 반복
      classSkill[b].map((a, i) => {
        //체크한 직업의 스킬만큼 반복
        var XMLHttpRequest = require("xhr2");
        var xhr2 = new XMLHttpRequest();
        xhr2.open("POST", "https://developer-lostark.game.onstove.com/auctions/items", true);
        xhr2.setRequestHeader("accept", "application/json");
        xhr2.setRequestHeader(
          "authorization",
          "bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6IktYMk40TkRDSTJ5NTA5NWpjTWk5TllqY2lyZyIsImtpZCI6IktYMk40TkRDSTJ5NTA5NWpjTWk5TllqY2lyZyJ9.eyJpc3MiOiJodHRwczovL2x1ZHkuZ2FtZS5vbnN0b3ZlLmNvbSIsImF1ZCI6Imh0dHBzOi8vbHVkeS5nYW1lLm9uc3RvdmUuY29tL3Jlc291cmNlcyIsImNsaWVudF9pZCI6IjEwMDAwMDAwMDAyOTk4OTgifQ.Q6OfRzEetB5YOcquTLrkkPI6sOOxe6OACPVE57i3aAu3QZ9sLI0VNat9EBydNZYAYxgP88Xc0Ecv7992FFWrnR1WJI6SfE9cqtOKC7A7a6-w7Eu4s7zQ2qZ2YA3LJQ36o6J4K30nq7xZwtet5z2pQ60In8IfkQxFTgjxVq7UoJhXtGAfKofaPQOLItDsMbGY_GrUccS6TxmQGXgctyJ2Zl-zLwOMpbFGYaqSsCuM8xp2oOOwRvn3VQYSrUL_Omdv8Dk3YY7yc4fDlh-6ApTL-bX_Br_vzbvd9CiEM2DOkjdFVGd4UT6mZ20RNgXHh5Hhet-_zlWZoo4d4mJPK4W8lg"
        );
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
            ItemGrade: gemLevel !== "10레벨" ? "전설" : "유물",
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
            }
          }
        };
      });
    });
  }

  useEffect(() => {
    gemListAll.sort((a, b) => {
      //가격내림차순으로 정렬
      return b.price - a.price;
    });
  }, [gemListAll]);
  return (
    <div className="main-frame">
      <div className="gem-option">
        <div className="class-choice">
          {classSkillList.map((a, i) => {
            return (
              <div key={i}>
                <input value={a} id={a} type="checkbox" onChange={handleCheck} />
                <label htmlFor={a}>{a}</label>
              </div>
            );
          })}
        </div>
        <div className="gem-choice">
          <select
            onChange={(e) => {
              setGemLevel(e.target.value);
              console.log(e.target.value);
            }}
          >
            <option value="7레벨">7레벨</option>
            <option value="8레벨">8레벨</option>
            <option value="9레벨">9레벨</option>
            <option value="10레벨">10레벨</option>
          </select>
        </div>
        <div className="gem-damage-coldown">
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
              <span className="price">{a.price}</span>
              <span className="className">{a.className}</span>
            </div>
          ) : null;
        })}
      </div>
    </div>
  );
}

export default App;
