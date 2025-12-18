import axios from "axios";
import { accessTokenState, clearLoginState, refreshTokenState, loginIdState, loginRoleState } from "../jotai";
import { getDefaultStore } from "jotai";

const store = getDefaultStore();

axios.defaults.baseURL = "http://localhost:8080";
axios.defaults.timeout = 10000;

// 요청 인터셉터: Access Token을 가져와 헤더에 추가
axios.interceptors.request.use((config) => {
    config.headers["Frontend-Url"] = window.location.href;
    
    const accessToken = store.get(accessTokenState);
    if (accessToken) {
        config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    
    return config;
}, (error) => {
    return Promise.reject(error);
});

// 응답 인터셉터
axios.interceptors.response.use((response) => {
    console.log("request success");
    
    const newAccessToken = response.headers["access-token"];
    if (newAccessToken) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
        store.set(accessTokenState, newAccessToken);
    }
    return response;
}, async (error) => {
    console.log("request fail");
    
    if (!error.response || !error.response.status) {
        return Promise.reject(error);
    }
    
    const originalRequest = error.config;
    const data = error.response?.data;
    const status = error.response.status; 

    // check-token에 대한 401/403 응답은 무조건 로그인 페이지로 강제 이동
    if (originalRequest.url === "/member/check-token" && (status === 401 || status === 403)) {
        store.set(clearLoginState); 
        window.location.href = "/member/login";
        return new Promise(()=>{});
    }

    try {
        // 토큰 만료 처리 (상태 401, 메시지 TOKEN_EXPIRED)
        if ((status === 401 || status === 403) && data?.message === "TOKEN_EXPIRED") { 
            const refreshToken = store.get(refreshTokenState);
            if (!refreshToken) throw new Error("No Refresh Token"); 

            const response = await axios.post("/member/refresh", { 
                refreshToken: refreshToken.startsWith("Bearer ") ? refreshToken.substring(7) : refreshToken
            });
            
            // 새 Access Token으로 헤더 및 Jotai 상태 업데이트
            const newAccessToken = response.data.accessToken; 
            originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
            store.set(accessTokenState, newAccessToken);
            
            // 기존 요청 재시도
            return axios(originalRequest); 
        }

        // 갱신 토큰 재발급을 시도하지 않은 다른 모든 401/403 에러는 에러 반환
        if (status === 401 || status === 403) {
            return Promise.reject(error);
        }

    } catch (ex) {
        // 갱신 토큰까지 실패 시 최종 로그아웃
        console.error("Token Refresh Failed:", ex);
        store.set(clearLoginState); 
        window.location.href = "/member/login"; 
        return new Promise(()=>{});
    }
    
    return Promise.reject(error);
});