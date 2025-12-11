/**
 * 죠-타이 (jotai)
 * - Recoil의 스타일 계승하여 최신버전과의 호환성을 개선한 상태관리 라이브러리
 */

import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

// ----------------------------------------------------
// 1. 기본 상태 아톰 (쓰기 가능 아톰)
// ----------------------------------------------------
// 💡 Session Storage에 저장되는 아톰들
export const loginNoState = atomWithStorage("loginNoState", "", sessionStorage);
export const loginIdState = atomWithStorage("loginIdState", "", sessionStorage);
export const loginRoleState = atomWithStorage("loginRoleState", "", sessionStorage);
export const accessTokenState = atomWithStorage("accessTokenState", "null", sessionStorage);
export const refreshTokenState = atomWithStorage("refreshTokenState", "null", sessionStorage);
export const loginNicknameState = atomWithStorage("loginNicknameState", "", sessionStorage);

// 💡 [추가됨] MemberLogin.jsx에서 사용되는 우편번호(Post) 아톰 정의
export const loginPostState = atomWithStorage("loginPostState", "", sessionStorage); // loginPostState 추가됨

export const loginAddress1State = atomWithStorage("loginAddress1State", "", sessionStorage);
export const loginAddress2State = atomWithStorage("loginAddress2State", "", sessionStorage);
export const loginEmailState = atomWithStorage("loginEmailState", "", sessionStorage);
export const loginPointState = atomWithStorage("loginPointState", 0, sessionStorage); // 숫자는 0으로
export const loginCreatedTimeState = atomWithStorage("loginCreatedTimeState", "", sessionStorage);
export const loginContactState = atomWithStorage("loginContactState","", sessionStorage);

// 💡 메모리 전용 플래그 (App.js에서 set)
export const loginCompleteState = atom(false); // 새로고침 후 인증 복구 완료 플래그
export const apiCallingState = atom(false); 
export const tokenRefreshingState = atom(false); 
export const globalErrorState = atom(null); 


// ----------------------------------------------------
// 2. Selector (읽기 전용 아톰)
// ----------------------------------------------------
// 💡 로그인 여부 판정: loginId와 Role이 존재하면 true
export const loginState = atom(get=>{
    const loginId = get(loginIdState);
    const loginRole = get(loginRoleState);
    return loginId?.length > 0 && loginRole?.length > 0;
});

// 💡 관리자 여부 판정: Role이 "ADMIN"이면 true
export const adminState = atom(get=>{
    const loginRole = get(loginRoleState);
    return loginRole === "ADMIN";
});


// ----------------------------------------------------
// 3. 쓰기 함수 (초기화)
// ----------------------------------------------------

// 💡 로그인 관련 state를 초기화하는 함수
export const clearLoginState = atom(
    null, // 읽기 기능 없음
    (get, set)=>{
        // 사용자 정보 초기화
        set(loginNoState, "");
        set(loginIdState, "");
        set(loginRoleState, "");
        set(accessTokenState, "");
        set(refreshTokenState, "");
        set(loginNicknameState, "");
        set(loginEmailState, "");
        
        // 💡 [수정] loginPostState 초기화 (값 누락 오류 수정)
        set(loginPostState, ""); 
        
        set(loginAddress1State, "");
        set(loginAddress2State, "");
        set(loginContactState, "");
        set(loginPointState, 0); 
        set(loginCreatedTimeState, "");
        
        // 플래그 초기화
        set(apiCallingState, false); 
        set(tokenRefreshingState, false); 
        set(loginCompleteState, false); 
        set(globalErrorState, null);
    }
);

// ----------------------------------------------------
// 4. 디버그 라벨 설정
// ----------------------------------------------------

loginNoState.debugLabel="loginNoState";
loginIdState.debugLabel = "loginIdState";
loginRoleState.debugLabel = "loginRoleState";
loginState.debugLabel = "loginState (Selector)";
adminState.debugLabel = "adminState (Selector)";
accessTokenState.debugLabel = "accessTokenState";
refreshTokenState.debugLabel = "refreshTokenState";
loginCompleteState.debugLabel = "loginCompleteState";
loginNicknameState.debugLabel = "loginNicknameState";
loginEmailState.debugLabel = "loginEmailState";

// 💡 [추가됨] loginPostState 디버그 라벨 설정
loginPostState.debugLabel = "loginPostState"; 

loginAddress1State.debugLabel = "loginAddress1State";
loginAddress2State.debugLabel = "loginAddress2State";
loginPointState.debugLabel = "loginPointState";
loginContactState.debugLabel = "loginContactState";
loginCreatedTimeState.debugLabel = "loginCreatedTimeState";
apiCallingState.debugLabel = "apiCallingState";
tokenRefreshingState.debugLabel = "tokenRefreshingState";
globalErrorState.debugLabel = "globalErrorState";