import { Bounce, ToastContainer } from "react-toastify"
import './App.css'
import Content from "./components/Content"
import Footer from "./components/Footer"
import Menu from "./components/Menu"
import {BrowserRouter, HashRouter, useNavigate} from "react-router-dom"
import { Provider, useAtom, useSetAtom } from "jotai";
import React, { useState } from "react";


//Jotai 개발자 도구 설정
// import { DevTools, useAtomDevtools } from "jotai-devtools";//도구
import axios from "axios";

import 'react-toastify/dist/ReactToastify.css';
import'./styles/toast.css';
import'./styles/sweetalert2-flatly.css';
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
          <BrowserRouter>
        {/* Jotai에서 제공하는 데이터 공유 영역 (생략하면 전체 앱에 적용됨) */}
        <Provider>
          {/* 
            Jotai 개발자 도구 - 개발 모드에서만 작동하고 배포 시 자동으로 제거되어야 함 
            process.env.NODE_ENV 정보를 읽었을 때 development면 개발모드, production이면 배포모드
          */}
          {/* {process.env.NODE_ENV === "development" && <DevTools/>} */}

          <Menu/>

          <div className="container-fluid my-5  pt-5">
            <Content/>
            <hr/>
            <Footer/>
          </div>
        </Provider>
      </BrowserRouter>


          {/* 토스트 메세지 컨테이너 */}
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
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
