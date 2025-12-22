import { Bounce, ToastContainer } from "react-toastify";
import "./App.css";
import Content from "./components/Content";
import Footer from "./components/Footer";
import Header from "./components/Header";
import { BrowserRouter } from "react-router-dom";
import { useAtomValue, useSetAtom, Provider } from "jotai"; // useAtomValue, useSetAtom, Provider 통합
import React, { useEffect } from "react";
import axios from "axios";
import { loginIdState, loginRoleState } from "./utils/jotai";

import "react-toastify/dist/ReactToastify.css";
import "./styles/toast.css";
import "./styles/sweetalert2-flatly.css";



// jotai.js에서 인증 상태 관리용 atom들을 임포트합니다.
import {
  accessTokenState,
  clearLoginState,
  loginCompleteState,
} from "./utils/jotai";
import ScrollToTop from "./components/ScrollToTop";

function AuthRoot() {
  const setLoginComplete = useSetAtom(loginCompleteState);
  const clearLogin = useSetAtom(clearLoginState);
  const currentAccessToken = useAtomValue(accessTokenState);
  const isLoginComplete = useAtomValue(loginCompleteState);

  // 앱 로드/새로고침 시 Jotai 상태를 복구하고 인증 상태를 확인합니다.
  useEffect(() => {
    // localStorage에서 직접 토큰 확인
    let token =
      localStorage.getItem("access_token") ||
      localStorage.getItem("accessTokenState");
    if (token) token = token.replace(/^"|"$/g, "");

    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setLoginComplete(true);
      return;
    }

    clearLogin();
    setLoginComplete(true);
  }, []); // 의존성 제거

  const contentPaddingStyle = { paddingTop: "150px" };
  // isLoginComplete가 true가 될 때까지 로딩 스피너를 표시
  // if (!isLoginComplete) {
  //   return (
  //     <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
  //       <div className="spinner-border text-success" role="status"></div>
  //       <span className="sr-only">인증 상태 복구 중...</span>
  //     </div>
  //   );
  // }
  // 로딩이 완료되면 앱의 주요 콘텐츠를 렌더링합니다.
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Header />
      <div className="container-fluid my-5 pt-5" style={contentPaddingStyle}>
        <Content />
        <hr />
        <Footer />
      </div>
    </BrowserRouter>
  );
}

function App() {
  return (
    // Provider 추가 (main 브랜치 로직)
    <Provider>
      <AuthRoot />
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        transition={Bounce}
      />
    </Provider>
  );
}

export default App;
