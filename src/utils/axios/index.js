import axios from "axios";
import { getDefaultStore } from "jotai";
import { accessTokenState, clearLoginState, refreshTokenState } from "../jotai";
//외부에서 jotai를 이용하기 위한 도구 생성

const store = getDefaultStore();//store에 set(), get()을 이용

//axios setting
axios.defaults.baseURL = "http://localhost:8080";//앞으로 모든 통신에 이 주소를 접두사로 추가
axios.defaults.timeout = 10000;//10000ms초가 넘어가면 통신 취소(상황에 따라 조절)
//axios interceptor
//-서버로 요청을 보낼 때 "Frontend-URL"이름으로 현재 url을 전송(카카오페이 결제 등에서 사용)
axios.interceptors.request.use((config)=>{
    config.headers["Frontend-Url"] =window.location.href;
    return config;
})

//axios interceptor
// - 서버의 응답 헤더에 "Access-Token"이 있으면 axios 헤더와 jotai의 AccessTokenState를 교체
axios.interceptors.response.use((response) => {
    console.log("request success");
    const newAccessToken = response.headers["access-token"];//response의 header를 조사 (* 소문자로 작성)
    if(newAccessToken) {//newAccessToken?.length > 0
        axios.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
        //setAccessToken(newAccessToken);//jotai 갱신 코드 (컴포넌트 내부에서 사용하는 코드)
        store.set(accessTokenState, newAccessToken);//jotai 갱신 코드 (컴포넌트 외부에서 사용하는 코드)
    }
    return response;
}, async (error) => {
    console.log("request fail");
    try {
        //console.log(error.response.data?.status);
        //console.log(error.response.data?.message);
        const data = error.response?.data;
        if(data?.status === "401" && data?.message === "TOKEN_EXPIRED") {//토큰이 만료된 경우
            //토큰 갱신 요청(axios)
            //const refreshToken = useAtomValue(refreshTokenState);//컴포넌트 내부에서 쓰는 코드
            const refreshToken = store.get(refreshTokenState);//컴포넌트 외부에서 쓰는 코드
            const response = await axios.post("/account/refresh", { 
                refreshToken : `Bearer ${refreshToken}` 
            });
            //response안에는 반드시 다시 발급된 accessToken과 refreshToken이 있어야 함
            // - jotai 또는 axios에 대한 갱신작업
            axios.defaults.headers.common["Authorization"] = `Bearer ${response.data.accessToken}`;
            //setAccessToken(response.data.accessToken);
            store.set(accessTokenState, response.data.accessToken);
            //setRefreshToken(response.data.refreshToken);
            store.set(refreshTokenState, response.data.refreshToken);

            const originalRequest = error.config;//원래 하려고 했던 요청 정보
            originalRequest.headers["Authorization"] = `Bearer ${response.data.accessToken}`;
            return axios(originalRequest);//원래 하려던 요청을 다시 진행
        }
    }
    catch(ex) {//refresh token마저 사용이 불가능한 상황
        //clearLogin();//모든 jotai state 초기화(컴포넌트 내부에서만 가능한 코드)
        store.set(clearLoginState);//모든 jotai state 초기화(컴포넌트 외부에서만 가능한 코드)
        //navigate("/account/login");//로그인 페이지로 이동 (사용불가... Routes 외부)
        location.href = "/account/login";
    }
    return Promise.reject(error);//에러 발생 처리
});