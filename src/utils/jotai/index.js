/**
 * 죠-타이 (jotai)
 * - Recoil의 스타일 계승하여 최신버전과의 호환성을 개선한 상태관리 라이브러리
 */

import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

// ----------------------------------------------------
// 1. 기본 상태 아톰 (쓰기 가능 아톰)
//    - 값이 직접 저장되거나 변경됩니다. (atomWithStorage 포함)
// ----------------------------------------------------

// localStorage를 사용하여 데이터 저장 (브라우저 종료 후에도 유지됨)
// sessionStorage 또는 localStorage와 연결하여 상태를 저장합니다.
export const accessTokenState = atomWithStorage("accessTokenState", "", localStorage);
export const refreshTokenState = atomWithStorage("refreshTokenState", "", localStorage);

// 로그인 관련 정보들
export const loginNoState = atomWithStorage("loginNoState", "", localStorage);
export const loginIdState = atomWithStorage("loginIdState", "", localStorage);
export const loginRoleState = atomWithStorage("loginRoleState", "", localStorage);
export const loginNicknameState = atomWithStorage("loginNicknameState", "", localStorage);
export const loginEmailState = atomWithStorage("loginEmailState", "", localStorage);
export const loginPostState = atomWithStorage("loginPostState", "", localStorage);
export const loginAddress1State = atomWithStorage("loginAddress1State", "", localStorage);
export const loginAddress2State = atomWithStorage("loginAddress2State", "", localStorage);
export const loginPointState = atomWithStorage("loginPointState", "", localStorage);
export const loginCreatedTimeState = atomWithStorage("loginCreatedTimeState", "", localStorage);
export const loginContactState = atomWithStorage("loginContactState", "", localStorage);


// 💡 [쓰기 가능] 전역 상태 및 로딩 관련 플래그 (세션에 저장되지 않음)
// loginCompleteState, apiCallingState, tokenRefreshingState, globalErrorState 만 남기고 중복 제거
export const loginCompleteState = atom(false); // 새로고침 후 인증 복구 완료 플래그 (App.js에서 set)
export const apiCallingState = atom(false); 
export const tokenRefreshingState = atom(false); 
export const globalErrorState = atom(null); 


// ----------------------------------------------------
// 2. Selector (읽기 전용 아톰)
//    - 다른 아톰의 값을 get하여 계산된 값을 반환합니다. (App.js에서 set 불가)
// ----------------------------------------------------

// 💡 로그인 여부 판정 (loginId와 Role이 모두 존재하면 true)
// 이전의 중복된 loginState를 Selector로 정의하고 이름 유지
export const loginState = atom(get=>{
    const loginId = get(loginIdState);
    const loginRole = get(loginRoleState);
    return loginId?.length > 0 && loginRole?.length > 0;
});

// 💡 관리자 여부 판정 (loginRole이 "ADMIN"일 경우 true)
// 이전의 중복된 adminState를 Selector로 정의하고 이름 유지
export const adminState = atom(get=>{
    const loginRole = get(loginRoleState);
    // loginId는 loginRole에 포함되므로 Role만 확인해도 됨
    return loginRole === "ADMIN";
});


// ----------------------------------------------------
// 3. 쓰기 함수 (초기화)
// ----------------------------------------------------

// 로그인 관련 state를 초기화하는 함수 (쓰기 함수)
export const clearLoginState = atom(
    null, // 읽기 기능은 사용하지 않음
    (get, set)=>{// 변경만 하겠다!
        // 사용자 정보 초기화 (atomWithStorage 포함)
        set(loginNoState, "");
        set(loginIdState, "");
        set(loginRoleState, "");
        set(accessTokenState, "");
        set(refreshTokenState, "");
        set(loginNicknameState, "");
        set(loginEmailState, "");
        set(loginPostState,"");
        set(loginAddress1State, "");
        set(loginAddress2State, "");
        set(loginContactState, "");
        set(loginPointState, 0); // Point는 숫자일 경우 0으로 초기화하는 것이 좋습니다.
        set(loginCreatedTimeState, "");
        
        // 플래그 초기화
        set(apiCallingState, false); 
        set(tokenRefreshingState, false); 
        set(loginCompleteState, false); // clearLoginState 실행 시 다시 로딩 상태로 돌아가도록 설정 (선택 사항)
        
        // 전역 에러 상태도 초기화
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
loginPostState.debugLabel = "loginPostState";
loginAddress1State.debugLabel = "loginAddress1State";
loginAddress2State.debugLabel = "loginAddress2State";
loginPointState.debugLabel = "loginPointState";
loginContactState.debugLabel = "loginContactState";
loginCreatedTimeState.debugLabel = "loginCreatedTimeState";
apiCallingState.debugLabel = "apiCallingState";
tokenRefreshingState.debugLabel = "tokenRefreshingState";
globalErrorState.debugLabel = "globalErrorState";