import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Loading from "./Loading";
import dateToGMT from './dateConverter.js';

function Dashboard() {
    const [userTask, setUserTask] = useState({
        taskname: "",
        date: "",
        notification: ""
    })
    const [taskData, setTaskData] = useState("")
    let [errorVals, setErrorVals] = useState("");
    const [loading, setLoading] = useState(false)
    const [isEdit, setIsEdit] = useState(false);
    const navigate = useNavigate();
    useEffect(() => {
        try {
            const token = localStorage.getItem("token");
            async function fetchData() {
                const config = {
                    headers: {
                        "z-auth-token": token
                    }
                }
                const res = await axios.get("/api/task/all", config);
                return setTaskData(res.data.tasks);
            }
            fetchData();
        }
        catch (error) {
            console.log(error.response.data);
            localStorage.removeItem("token");
            navigate("/login");
        }
    })
    let onlogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    }

    let onTaskSelect = (eve) => {
        console.log(eve.target.name, eve.target.value);
        if(eve.target.name === "date") {
            let dateNum = dateToGMT(eve.target.value);
            setUserTask({
                ...userTask, date : dateNum
            })
        } else {
            setUserTask({
                ...userTask, [eve.target.name]: eve.target.value
            })
        }
    }
    let submitTask = async (e) => {
        try {
            const token = localStorage.getItem("token");
            e.preventDefault();
            setLoading(true);

            setUserTask({
                ...userTask, date: dateToGMT(userTask.date)
            })

            const res = await axios.post("/api/task/add", userTask, {
                headers: {
                    "z-auth-token": token
                }
            })
            console.log(res.data);
            setLoading(false);
            // navigate("/login");
        }
        catch (error) {
            let allErrors = error.response.data
            console.log(allErrors);
            typeof (allErrors.error) === "string" ? setErrorVals([{ msg: allErrors.error }]) : typeof (allErrors.msg) === 'string' ? setErrorVals([allErrors]) : setErrorVals(allErrors.error)
            setLoading(false);
            setTimeout(() => {
                setErrorVals("")
            }, 3000)
        }
    }
    let deleteTask = async (event) => {
        console.log(event.target.name);
        let token = localStorage.getItem("token");
        const config = {
            headers: {
                "z-auth-token": token
            }
        }
        await axios.delete(`/api/task/delete/${event.target.name}`, config)
        try {
            console.log("successfully Deleted");
        }
        catch (error) {
            console.log(error);
        }
    }
    let editTask = (eve) => {
        setIsEdit(true);

        console.log(eve.target.name);
    }

    return (
        <>
            <div>
                <h1>Dashboard </h1><br />
                <hr />
                <button onClick={onlogout}>Logout</button>
                <h1>Schedule task</h1>
            </div>
            {loading && (<Loading />)}
            {errorVals !== "" && errorVals.map((ele, idx) => (
                <p key={idx} style={{ color: "red" }}>{ele.msg} </p>
            ))}
            {!loading &&
                <form>
                    <label htmlFor="taskname" >Taskname </label><br />
                    <input type="text" name='taskname' placeholder='Enter Taskname' value={userTask.taskname} onChange={onTaskSelect} /><br /><br />
                    <label htmlFor="date"  >Deadline </label><br />
                    <input type="datetime-local" name='date' placeholder='Enter schedule date ' onChange={onTaskSelect} /><br /><br />
                    <label htmlFor="Completed" >Norifiy on : </label><br />
                    <select  name="notification" value={userTask.notification} onChange={onTaskSelect}>
                        <option value={"both"}>Both</option>
                        <option value={"email"}>Email</option>
                        <option value={"sms"}>SMS</option>
                    </select><br /><br />
                    <input type="button" className='clickbutton' onClick={submitTask} value="Submit Task" /><br /><br /><br />
                </form>
            }
            {taskData !== "" &&
                <table>
                    <thead>
                        <tr>
                            <th>taskname</th>
                            <th>date</th>
                            <th>id</th>
                            <th>Reminders </th>
                            <th>Notification Type</th>
                            <th>Completed</th>
                            <th>Delete</th>
                            <th>Edit </th>
                        </tr>
                    </thead>
                    <tbody>
                        {taskData.map((elem, idxx) => (
                            <tr key={idxx}>
                                <td>{elem.taskname}</td>
                                <td>{new Date(elem.date * 1).toLocaleString()}</td>
                                <td>{elem._id}</td>
                                <td>
                                    <div>{new Date(elem.reminders[0]).toLocaleString()}</div>
                                    <div>{new Date(elem.reminders[0]).toLocaleString()}</div>
                                    <div>{new Date(elem.reminders[0]).toLocaleString()}</div>
                                </td>
                                <td>{elem.notification}</td>
                                {elem.isCompleted === true ? (<td>completed</td>) : (<td>not-completed</td>)}
                                <td><input type="button" onClick={deleteTask} name= {elem._id} value="Delete" /></td>
                                {isEdit === true && <td><input type="button" onClick={editTask} name= {elem._id} value="Save" /></td>}
                                {isEdit === false && <td><input type="button" onClick={editTask} name= {elem._id} value="Edit" /></td>}
                            </tr>
                        ))}
                    </tbody>
                </table>
            }
        </>
    )
}
export default Dashboard;