import axios from "axios";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAtom } from "jotai";
import { loginPointState, accessTokenState } from "../../utils/jotai";
import Jumbotron from "../templates/Jumbotron";

export default function KakaoPaySuccess() {
  const navigate = useNavigate();
  const [, setLoginPoint] = useAtom(loginPointState);
  const [accessToken] = useAtom(accessTokenState); 

  useEffect(() => {
    const run = async () => {

      const { data: me } = await axios.get("/member/mypage", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

       if (!accessToken) {
        alert("로그인이 필요한 서비스입니다.");
        navigate("/member/login");
        return;
      }

      setLoginPoint(me.point);
    };
  }, [accessToken, navigate, setLoginPoint]);

  return (
    <>

  <Jumbotron subject="결제 성공" detail="결제가 성공적으로 완료되었습니다" />
  </>
)}