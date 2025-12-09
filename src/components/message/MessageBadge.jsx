import { useEffect, useState } from "react"
import { FaBell } from "react-icons/fa";

export default function MessageBadge() {

    //state
    const [count, setCount] = useState();

    //effect
    useEffect(()=>{

    }, []);
    
    //render
    return (<>
    
        <FaBell />
    </>)
}