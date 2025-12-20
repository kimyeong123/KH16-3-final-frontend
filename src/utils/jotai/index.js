/**
 * 죠-타이 (jotai)
 * - Recoil의 스타일 계승하여 최신버전과의 호환성을 개선한 상태관리 라이브러리
 */

import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

// ----------------------------------------------------
// 1. 기본 상태 아톰 (쓰기 가능 아톰)
// ----------------------------------------------------

// localStorage를 사용하여 데이터 저장 (브라우저 종료 후에도 유지됨)
// sessionStorage 또는 localStorage와 연결하여 상태를 저장합니다.
export const accessTokenState = atomWithStorage(
  "accessTokenState",
  "",
  localStorage
);
export const refreshTokenState = atomWithStorage(
  "refreshTokenState",
  "",
  localStorage
);

// 로그인 관련 정보들
export const loginNoState = atomWithStorage("loginNoState", "", localStorage);
export const loginIdState = atomWithStorage("loginIdState", "", localStorage);
export const loginRoleState = atomWithStorage(
  "loginRoleState",
  "",
  localStorage
);
export const loginNicknameState = atomWithStorage(
  "loginNicknameState",
  "",
  localStorage
);
export const loginEmailState = atomWithStorage(
  "loginEmailState",
  "",
  localStorage
);
export const loginPostState = atomWithStorage(
  "loginPostState",
  "",
  localStorage
);
export const loginAddress1State = atomWithStorage(
  "loginAddress1State",
  "",
  localStorage
);
export const loginAddress2State = atomWithStorage(
  "loginAddress2State",
  "",
  localStorage
);
export const loginPointState = atomWithStorage(
  "loginPointState",
  0,
  localStorage
);
export const loginCreatedTimeState = atomWithStorage(
  "loginCreatedTimeState",
  "",
  localStorage
);
export const loginContactState = atomWithStorage(
  "loginContactState",
  "",
  localStorage
);

//관리자 관련 정보들

// 메모리 전용 플래그 (App.js에서 set)
export const loginCompleteState = atom(false); // 새로고침 후 인증 복구 완료 플래그
export const apiCallingState = atom(false);
export const tokenRefreshingState = atom(false);
export const globalErrorState = atom(null);

// ----------------------------------------------------
// 2. Selector (읽기 전용 아톰)
// ----------------------------------------------------
// 💡 로그인 여부 판정: loginId와 Role이 존재하면 true
export const loginState = atom((get) => {
  const accessToken = get(accessTokenState);
  return typeof accessToken === "string" && accessToken.length > 0;
});

// 관리자 여부
export const adminState = atom((get) => {
  const role = (get(loginRoleState) || "").trim();
  if (!role) return null;
  return role === "ADMIN";
});

// ----------------------------------------------------
// 3. 쓰기 함수 (초기화)
// ----------------------------------------------------

// 💡 로그인 관련 state를 초기화하는 함수
export const clearLoginState = atom(
  null, // 읽기 기능 없음
  (get, set) => {
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

loginNoState.debugLabel = "loginNoState";
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
