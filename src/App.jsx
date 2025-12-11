// src/App.js

import { Bounce, ToastContainer } from "react-toastify"
import './App.css'
import Content from "./components/Content"
import Footer from "./components/Footer"
import Header from "./components/Header"
import {BrowserRouter} from "react-router-dom"
import { useAtomValue, useSetAtom } from "jotai";
import React, { useEffect } from "react";
import axios from "axios";

import 'react-toastify/dist/ReactToastify.css';
import'./styles/toast.css';
import'./styles/sweetalert2-flatly.css';

// jotai.js에서 인증 상태 관리용 atom들을 임포트합니다.
import { accessTokenState, clearLoginState, loginCompleteState } from "./utils/jotai"; 

function AuthRoot() {
  const setLoginComplete = useSetAtom(loginCompleteState);
  const clearLogin = useSetAtom(clearLoginState); 
  const currentAccessToken = useAtomValue(accessTokenState);
  const isLoginComplete = useAtomValue(loginCompleteState);

  // 앱 로드/새로고침 시 Jotai 상태를 복구하고 인증 상태를 확인합니다.
  useEffect(() => {
    console.log("AuthRoot 실행. 현재 AccessToken:", currentAccessToken);
    
    // Access Token이 없으면 (null 또는 "")
    if (currentAccessToken === null || currentAccessToken === "") {
      clearLogin(); // 로그인 정보 (ID, Role, Token 등)를 초기화합니다.
      
      // 토큰이 없으므로, 로딩 완료 상태를 true로 설정하여 스피너를 해제하고 비로그인 콘텐츠를 표시합니다.
      setLoginComplete(true); 
      return;
    }

    // Access Token이 존재하면, 즉시 로딩 완료 처리합니다.
    // 토큰의 유효성 검사 및 갱신은 axiosSetup.js의 인터셉터가 담당합니다.
    setLoginComplete(true); 

  }, [currentAccessToken, clearLogin, setLoginComplete]);

  const contentPaddingStyle = { paddingTop: '150px' };

  // isLoginComplete가 true가 될 때까지 로딩 스피너를 표시합니다.
  if (!isLoginComplete) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="spinner-border text-success" role="status"></div>
        <span className="sr-only">인증 상태 복구 중...</span>
      </div>
    );
  }

  // 로딩이 완료되면 앱의 주요 콘텐츠를 렌더링합니다.
  return (
    <BrowserRouter>
      <Header/>
      <div className="container-fluid my-5 pt-5" style={contentPaddingStyle}>
        <Content/>
        <hr/>
        <Footer/>
      </div>
    </BrowserRouter>
  );
}

function App() {
  return (
    <>
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
    </>
  )
}

export default App