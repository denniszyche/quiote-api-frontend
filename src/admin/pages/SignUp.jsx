import React, { useEffect} from "react";
import { useNavigate } from "react-router-dom";
const SignUp = () => {    
    const navigate = useNavigate();
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            navigate("/dashboard", { replace: true });
        }
    }, [navigate]);
    return (
        <>
            SignUp here
        </>
    );
}
export default SignUp;