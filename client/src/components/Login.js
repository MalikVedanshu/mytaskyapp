import React, { useState } from 'react';
import axios from 'axios';
import Loading from "./Loading.js";
import {Link, useNavigate} from "react-router-dom";

function Login() {

    let [loginVals, setLoginVals] = useState({
        email: "",
        password: ""
    })
    let [loading, setLoading] = useState(false);
    let [errorVals, setErrorVals] = useState("");
    const navigate = useNavigate();
    let {email, password} = loginVals;
    const onLoginChange = (e) => {
        setLoginVals({...loginVals, [e.target.name] : e.target.value})
    }
    const onUsrSubmit = async () => {
        try {
            setLoading(true);
            let res = await axios.post("/api/user/login",loginVals)
            localStorage.setItem("token",res.data.token);
            setLoading(false);
            navigate("/dashboard");
        }
        catch (error) {
            let allErrors = error.response.data
            typeof(allErrors.error) === "string" ? setErrorVals([{msg: allErrors.error}]) : typeof(allErrors.msg) === 'string' ? setErrorVals ([allErrors]) : setErrorVals(allErrors.error) 
            setLoading(false);
            setTimeout(() => {
                setErrorVals("")
            },3000)
        }
    }
    return (
        <div className="login-page">
            <h1>User Login</h1>
            <hr />
            {loading && <Loading />}
            {errorVals !== "" && errorVals.map((ele,idx) => (
                <p key={idx} style={{color:"red"}}>{ele.msg} </p>
            ))
            }
            {!loading && 
             
            <form>
                <label htmlFor="email" > Email </label><br />
                <input type="text" name='email' onChange={onLoginChange} value={email} placeholder='Enter your email ' /><br /><br />
                <label htmlFor="password" >Password </label><br />
                <input type="password" name='password' onChange={onLoginChange} value={password} placeholder='Enter your password' /><br /><br />
                <input type="button" onClick={onUsrSubmit} value='Login' className='clickbutton' />
            </form>
            }
            <p> New user ? <Link style={{textDecoration: "none" , color: "rgba(19, 184, 221, 0.857)"}} to='/register' >Register </Link> </p>
        </div>
    )
}
export default Login;