/**
 * 죠-타이 (jotai)
 * - Recoil의 스타일 계승하여 최신버전과의 호환성을 개선한 상태관리 라이브러리
 * - 대부분이 Recoil과 비슷하기 때문에 러닝커브 없이 마이그레이션 가능
 * - recoil에서는 atom, selector로 상태를 구현하지만 jotai는 atom 만으로 생성
 * - atom(값) 은 recoil atom와 같음
 * - atom(함수) 는 recoil selector와 같음
 * 
 * Recoil에는 없지만 Jotai에는 있는 개발자 도구(DevTools)
 * - npm i jotai-devtools
 * - 프로그램 내부에 개발 모드에서만 작동하도록 <DevTools> 배치 (jotai 영역 내부에 배치)
 */

import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

//export const loginIdState = atom({key : "loginIdState", default: null});//recoil
//export const loginIdState = atom(null);//jotai
export const loginIdState = atomWithStorage("loginIdState", "", sessionStorage);//jotai + persist

//export const loginLevelState = atom({key : "loginLevelState", default : null});//recoil
//export const loginLevelState = atom(null);//jotai
export const loginLevelState = atomWithStorage("loginLevelState", "", sessionStorage);//jotai + persist

//accessToken
export const accessTokenState = atomWithStorage("accessTokenState", "", sessionStorage);

//refreshToken
export const refreshTokenState = atomWithStorage("refreshToken", "", sessionStorage);

// export const loginState = selector({//recoil
//     key:"loginState",
//     get: (state)=>{
//         const loginId = state.get(loginIdState);
//         const loginLevel = state.get(loginLevelState);
//         return loginId !== null && loginLevel !== null;
//     }
// });
export const loginState = atom(get=>{//jotai
    const loginId = get(loginIdState);
    const loginLevel = get(loginLevelState);
    //return loginId !== "" && loginLevel !== "";
    return loginId?.length > 0 && loginLevel?.length > 0;
});

export const adminState = atom(get=>{//jotai
    const loginId = get(loginIdState);
    const loginLevel = get(loginLevelState);
    //return loginId !== "" && loginLevel === "관리자";
    return loginId?.length > 0 && loginLevel === "관리자";
});

//로그인 관련 state를 초기화하는 함수 (쓰기 함수)
//문법 - const 변수명 = atom(null, 변경함수);
export const clearLoginState = atom(
    null, //읽는건 필요없고
    (get, set)=>{//변경만 하겠다!
        set(loginIdState, "");
        set(loginLevelState, "");
        set(accessTokenState, "");
        set(refreshTokenState, "");
    }
);

//로그인 판정이 완료되었는지 확인하기 위한 데이터
export const loginCompleteState = atom(false);

//DevTools에서 확인하기 위한 이름 설정
loginIdState.debugLabel = "loginIdState";
loginLevelState.debugLabel = "loginLevelState";
loginState.debugLabel = "loginState";
adminState.debugLabel = "adminState";
accessTokenState.debugLabel = "accessTokenState";
loginCompleteState.debugLabel = "loginCompleteState";
refreshTokenState.debugLabel = "refreshTokenState";