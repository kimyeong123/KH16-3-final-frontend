import { useAtomValue } from "jotai"
import { Navigate } from "react-router-dom"
import { adminState, loginCompleteState } from "../../utils/jotai"
import { ClimbingBoxLoader } from "react-spinners";


export default function Admin ( { children } ) {
    const loginComplete = useAtomValue(loginCompleteState); // 상태 복구 완료 플래그
    const isAdmin = useAtomValue(adminState); // 관리자 여부
    
    // [1] 로그인 복구 과정이 완료되지 않았다면 로딩 화면 출력
    if(loginComplete === false) {
        return <ClimbingBoxLoader/>
    }

    // [2] 복구 완료 후, 관리자라면 자식 렌더링, 아니면 403 리디렉션
    return isAdmin === true ? children : <Navigate to={"/error/403"}/>
}