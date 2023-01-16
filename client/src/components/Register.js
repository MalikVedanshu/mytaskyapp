import React, { useState } from "react";
import axios from "axios";
import Loading from "./Loading.js";
import {Link, useNavigate} from "react-router-dom";


function Register() {
    const [registerData, setRegisterData] = useState({
        firstname: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: ""
    })
    const [errorVals, setErrorVals] = useState("");
    const [loading, setLoading] = useState(false);

    const { firstname, email, phone, password, confirmPassword } = registerData;
    const navigate = useNavigate();

    const onNewTrigger = (eve) => {
        setRegisterData({
            ...registerData, [eve.target.name]: eve.target.value
        })
    }

    const onRegSubmit = async (e) => {
        try {
            e.preventDefault();
            setLoading(true);
            await axios.post("/api/user/register", registerData)
            setLoading(false);
            navigate("/login");
        }
        catch (error) {
            let errorMsg = error.response.data
            errorMsg.error === undefined ? setErrorVals([errorMsg]) : setErrorVals(errorMsg.error)
            setLoading(false);
            setTimeout(() => {
                setErrorVals("")
            },3000)
        }
    }

    return (
        <>
            <div className="login-page">
                <h1>User Register</h1>
                <hr />
                {loading && (<Loading />)}
                {errorVals !== "" && errorVals.map((ele,idx) => (
                    <p key={idx} style={{color:"red"}}>{ele.msg}</p>
                ))
                }
                {!loading && 
                <form>
                    <label htmlFor="firstname" >Enter your First Name </label>
                    <input type="text" name='firstname' onChange={onNewTrigger} value={firstname} placeholder='Enter your first-name' /><br /><br />
                    <label htmlFor="email"  >Enter your Email </label>
                    <input type="text" name='email' onChange={onNewTrigger} value={email} placeholder='Enter your email ' /><br /><br />
                    <label htmlFor="phone" >Enter your phone number </label>
                    <input type="tel" name='phone' onChange={onNewTrigger} value={phone} placeholder='Enter your phone number ' /><br /><br />
                    <label htmlFor="password" >Enter password : </label>
                    <input type="password" name='password' onChange={onNewTrigger} value={password} placeholder='Enter a strong password' /><br /><br />
                    <label htmlFor="confirmPassword" >Confirm Password : </label>
                    <input type="password" name='confirmPassword' onChange={onNewTrigger} value={confirmPassword} placeholder='Confirm password' /><br /><br />
                    <input type="button" onClick={onRegSubmit} value='Sign-Up' className='clickbutton' />
                </form> }
                <p> Already registered ? <Link style={{textDecoration: "none" , color: "rgba(19, 184, 221, 0.857)"}} to='/login' >Login </Link> </p>
            </div>
        </>
    )
}
export default Register;