// src/App.jsx

import { Bounce, ToastContainer } from "react-toastify"
import './App.css'
import Content from "./components/Content"
import Footer from "./components/Footer"
import Header from "./components/Header"
import { BrowserRouter } from "react-router-dom"
import { Provider, useSetAtom } from "jotai";
import React, { useEffect } from "react";
import axios from "axios";

import 'react-toastify/dist/ReactToastify.css';
import './styles/toast.css';
import './styles/sweetalert2-flatly.css';

// loginState, adminState 는 더 이상 import 안 함
import { loginCompleteState } from "./utils/jotai"; 


function AuthRoot() {
  const setLoginComplete = useSetAtom(loginCompleteState);
  
  useEffect(() => {
    // 1) 새로고침 후 토큰을 axios 헤더에 다시 세팅
    let token = localStorage.getItem("access_token") 
             || localStorage.getItem("accessTokenState");

    if (token) {
      token = token.replace(/^"|"$/g, "");
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      console.log("초기 토큰 복원:", token);
    } else {
      console.log("초기 토큰 없음 (localStorage)");
    }

    // 2) 토큰 유효성 검사
    const checkAuth = async () => {
      try {
        const res = await axios.post("/member/check-token");
        console.log("request success", res.data);
        // 여기서 더 이상 loginState/adminState 를 set 하지 않음
        // 로그인 여부는 loginIdState/loginRoleState + Selector로 판정
      } catch (error) {
        console.warn("check-token 실패:", error);
        // 필요하면 여기서 clearLoginState 같은 걸 호출해도 됨
      } finally {
        setLoginComplete(true);
      }
    };

    checkAuth();
  }, [setLoginComplete]);

  const contentPaddingStyle = { paddingTop: '150px' };

  return (
    <BrowserRouter>
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
  )
}

export default App;
