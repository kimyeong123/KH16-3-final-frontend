// src/App.js

import { Bounce, ToastContainer } from "react-toastify"
import './App.css'
import Content from "./components/Content"
import Footer from "./components/Footer"
import Header from "./components/Header"
import {BrowserRouter} from "react-router-dom"
import { Provider, useSetAtom } from "jotai";
import React, { useEffect } from "react";
import axios from "axios";

import 'react-toastify/dist/ReactToastify.css';
import'./styles/toast.css';
import'./styles/sweetalert2-flatly.css';

// 💡 Jotai 아톰 경로를 맞게 수정하세요.
import { adminState, loginCompleteState, loginState } from "./utils/jotai"; 


// ----------------------------------------------------
// 💡 인증 상태 복구 로직을 담당하는 컴포넌트 (AuthRoot)
// ----------------------------------------------------
function AuthRoot() {
    const setLoginComplete = useSetAtom(loginCompleteState);
    const setAdmin = useSetAtom(adminState);
    const setIsLogin = useSetAtom(loginState);
    
    // 새로고침 시 딱 한 번 실행되어 Jotai 상태를 복구합니다.
    useEffect(() => {
        const checkAuth = async () => {
            try {
                // [1] 서버에 토큰 유효성 검사 요청 (Header에 JWT 포함되어야 함)
                // 서버는 토큰을 확인하고, 유효하다면 사용자 정보(loginLevel 포함)를 반환해야 합니다.
                const response = await axios.post("/member/check-token"); 
                
                // [2] 성공 시 상태 업데이트
                const loginLevel = response.data.loginLevel; // 서버에서 받은 권한 레벨
                
                setIsLogin(true);
                // 응답에서 관리자 여부를 판단하여 Jotai 아톰에 저장
                setAdmin(loginLevel === 'ADMIN');
                
            } catch (error) {
                // [3] 실패 시 (토큰 없음/만료) 상태 초기화
                setIsLogin(false);
                setAdmin(false); 
            } finally {
                // [4]  로딩 상태 해제 (성공 여부와 관계없이 완료를 알려야 Admin이 동작함)
                setLoginComplete(true); 
            }
        };
        
        checkAuth(); 
        
    }, [setLoginComplete, setAdmin, setIsLogin]); 
    
    const contentPaddingStyle = { paddingTop: '150px' };

    return (
        <BrowserRouter>
            <Provider>
                <Header/>
                <div className="container-fluid my-5 pt-5" style={contentPaddingStyle}>
                    <Content/> {/* 라우팅(Routes)이 포함된 컴포넌트 */}
                    <hr/>
                    <Footer/>
                </div>
            </Provider>
        </BrowserRouter>
    );
}


function App() {
    return (
        <>
            <AuthRoot/> {/* AuthRoot를 렌더링 */}
            
            {/* 토스트 메세지 컨테이너 */}
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