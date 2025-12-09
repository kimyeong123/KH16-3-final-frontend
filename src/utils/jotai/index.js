/**
 * 죠-타이 (jotai)
 * - Recoil의 스타일 계승하여 최신버전과의 호환성을 개선한 상태관리 라이브러리
 * - 대부분이 Recoil과 비슷하기 때문에 러닝커브 없이 마이그레이션 가능
 * - atom(값) 은 recoil atom와 같음
 * - atom(함수) 는 recoil selector와 같음
 */

import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
// import axios from "axios"; // clearLoginState에서 axios를 사용하지 않아 제거


export const loginIdState = atomWithStorage("loginIdState", "", sessionStorage);
export const loginRoleState = atomWithStorage("loginRoleState", "", sessionStorage);
export const accessTokenState = atomWithStorage("accessTokenState", "", sessionStorage);
export const refreshTokenState = atomWithStorage("refreshToken", "", sessionStorage);

export const loginState = atom(get=>{//로그인 여부 판정
    const loginId = get(loginIdState);
    const loginRole = get(loginRoleState);
    return loginId?.length > 0 && loginRole?.length > 0;
});

export const adminState = atom(get=>{//관리자 여부 판정
    const loginId = get(loginIdState);
    const loginRole = get(loginRoleState);
    return loginId?.length > 0 && loginRole === "admin";
});

export const apiCallingState = atom(false); 
export const tokenRefreshingState = atom(false); 
export const globalErrorState = atom(null); 

export const loginCompleteState = atom(false);

// 로그인 관련 state를 초기화하는 함수 (쓰기 함수)
export const clearLoginState = atom(
    null, //읽는건 필요없고
    (get, set)=>{//변경만 하겠다!
        set(loginIdState, "");
        set(loginRoleState, "");
        set(accessTokenState, "");
        set(refreshTokenState, "");
        // clearLogin 시 전역 에러 상태도 초기화
        set(globalErrorState, null);
    }
);

loginIdState.debugLabel = "loginIdState";
loginRoleState.debugLabel = "loginRoleState";
loginState.debugLabel = "loginState";
adminState.debugLabel = "adminState";
accessTokenState.debugLabel = "accessTokenState";
refreshTokenState.debugLabel = "refreshTokenState";
loginCompleteState.debugLabel = "loginCompleteState";

apiCallingState.debugLabel = "apiCallingState";
tokenRefreshingState.debugLabel = "tokenRefreshingState";
globalErrorState.debugLabel = "globalErrorState";