import { useAtomValue } from "jotai";
import { Navigate } from "react-router-dom";
import { adminState, loginCompleteState } from "../../utils/jotai";
import { ClimbingBoxLoader } from "react-spinners";

export default function Admin({ children }) {
  const loginComplete = useAtomValue(loginCompleteState); // true / false
  const isAdmin = useAtomValue(adminState); // null / true / false

  if (loginComplete !== true || isAdmin === null) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "60vh"
      }}>
        <ClimbingBoxLoader />
      </div>
    );
  }
if (loginComplete !== true || isAdmin === null) return <Loader />;
return isAdmin ? children : <Navigate to="/error/403" replace />;

}
