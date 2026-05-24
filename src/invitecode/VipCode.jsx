import {useRef, useState} from "react";
import './VipCode.css'
import {useNavigate} from "react-router-dom";

export default function VipCode() {

    const [digits, setDigits] = useState(["", "", "", ""]);
    const snows = Array.from({ length: 30 });
    const inputRefs = useRef([]);
    const [msg, setMsg] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (i, value) => {
        const v = value.replace(/\D/g, "").slice(0, 1);
        const newDigits = [...digits];
        newDigits[i] = v;
        setDigits(newDigits);

        if (v && i < 3) {
            inputRefs.current[i + 1]?.focus();
        }
    };

    const handleEnter = async () => {
        const code = digits.join("");

        if(code.length !== 4) {
            alert("4자리 코드를 모두 입력해주세요.")
            return;
        }

        setLoading(true);
        setMsg("");

        try{
            const res = await fetch ("/api/invite/enter", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: code }),
            });

            if (!res.ok) {
                setMsg("코드를 다시 확인해주시겠습니까?");
                setDigits(["", "", "", ""]);
                inputRefs.current[0]?.focus();
                setLoading(false);
                return;
            }

            const data = await res.json();
            alert(`${data.name}님 환영합니다.`);
            const grade = (data.grade || "").trim().toUpperCase();

            if (grade === "VIP") {
                navigate("/vip");
            } else if (grade === "VVIP") {
                navigate("/vvip");
            } else if (grade === "DIAMOND") {
                navigate("/diamond");
            } else {
                setMsg("등급 에러");
            }

            setLoading(false);

        } catch(err) {
            console.error(err);
            alert("오류 발생");
            setLoading(false);
        }
    };



  return (
    <div className='page'>
      <div className={"snowing"}>
          {snows.map((_, i) => (
              <div
                  key={i}
                  className="snow"
                  style={{
                      left: `${Math.random() * 100}vw`,
                      animationDuration: `${5 + Math.random() * 5}s`,
                      animationDelay: `${Math.random() * 5}s`,
                  }}
              />
          ))}

          <h1 className={"vip-title"}>A Private Invitation Awaits You</h1>
          <img src={"ribbon.png"} alt="ribbon" className="ribbon" />

          <div className={"box-container"}>
              {digits.map((digit, i) => (
                  <div className="box" key={i}>
                      <input
                          ref={(el) => (inputRefs.current[i] = el)}
                          type="text"
                          className="digit-input"
                          value={digit}
                          onChange={(e) => handleChange(i, e.target.value)}
                          onKeyDown={(e) => {
                              if (e.key === "Enter") handleEnter();
                          }}
                          maxLength={1}
                          inputMode="numeric"
                      />
                  </div>
              ))}
          </div>

          <button className={"enter"} onClick={handleEnter} disabled={loading}>
              {loading ? "..." : "ENTER"}
          </button>

          {msg && <span className={"text-box"}>{msg}</span>}
      </div>
    </div>
  )
}

