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
    const [editState, setEditState] = useState({
        taskname: "",
        date: "",
        notification: "",
        isCompleted: ""

    })
    const [taskData, setTaskData] = useState("")
    let [errorVals, setErrorVals] = useState("");
    const [loading, setLoading] = useState(false)
    const [isEdit, setIsEdit] = useState({ render: false, ids: "" });
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
            localStorage.removeItem("token");
            return navigate("/login");
        }
    })
    let onlogout = () => {
        logout();
    }
    function logout() {
        localStorage.removeItem("token");
        navigate("/login");
    }

    let onTaskSelect = (eve) => {
        if (eve.target.name === "date") {
            let dateNum = dateToGMT(eve.target.value);
            setUserTask({
                ...userTask, date: dateNum
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

            await axios.post("/api/task/add", userTask, {
                headers: {
                    "z-auth-token": token
                }
            })
            setLoading(false);
            // navigate("/login");
        }
        catch (error) {
            let allErrors = error.response.data
            typeof (allErrors.error) === "string" ? setErrorVals([{ msg: allErrors.error }]) : typeof (allErrors.msg) === 'string' ? setErrorVals([allErrors]) : setErrorVals(allErrors.error)
            setLoading(false);
            setTimeout(() => {
                setErrorVals("")
            }, 3000)
        }
    }
    let deleteTask = async (event) => {
        let token = localStorage.getItem("token");
        const config = {
            headers: {
                "z-auth-token": token
            }
        }
        await axios.delete(`/api/task/delete/${event.target.name}`, config)
    }
    let editTask = (eve) => {
        setIsEdit({ render: true, ids: eve.target.name });
    }


    let sendEditedTask = async (e) => {
        const token = localStorage.getItem("token");
        e.preventDefault();
        setLoading(true);
        await axios.put(`/api/task/edit/${e.target.name}`, editState, {
            headers: {
                "z-auth-token": token
            }
        })
        try {
            setIsEdit({ render: false, ids: "" });
            setLoading(false);
        }
        catch (error) {
            let allErrors = error.response.data
            typeof (allErrors.error) === "string" ? setErrorVals([{ msg: allErrors.error }]) : typeof (allErrors.msg) === 'string' ? setErrorVals([allErrors]) : setErrorVals(allErrors.error)
            setLoading(false);
            setTimeout(() => {
                setErrorVals("")
                localStorage.removeItem("token");
                navigate("/login");
            }, 3000)
            setIsEdit({ render: false, ids: "" });
        }
    }


    let changeEditState = (e) => {
        if (e.target.name === "date") {
            let dateNum = dateToGMT(e.target.value);
            setEditState({
                ...editState, date: dateNum
            })
        }
        else if(e.target.name === "isCompleted") {
            setEditState({...editState, isCompleted: JSON.parse(e.target.value)})
        } else {
            setEditState({
                ...editState, [e.target.name]: e.target.value
            })
        }
    }

    return (
        <>
            <div>
                <h1>Dashboard </h1><br />
                <hr />
                
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
                    <select name="notification" value={userTask.notification} onChange={onTaskSelect}>
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

                        {taskData.map((elem, idxx) => {
                            return (!(isEdit.render === true && elem._id === isEdit.ids)) ? (
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
                                    <td><input type="button" onClick={deleteTask} name={elem._id} value="Delete" /></td>
                                    <td><input type="button" onClick={editTask} name={elem._id} value="Edit" /></td>
                                </tr>
                            ) : (<tr key="idxx">
                                <td><input type="text" name='taskname' placeholder='New Taskname' onChange={changeEditState} /></td>
                                <td> <input type="datetime-local" name="date" onChange={changeEditState} /></td>
                                <td>{elem._id}</td>
                                <td>
                                    <div>{new Date(elem.reminders[0]).toLocaleString()}</div>
                                    <div>{new Date(elem.reminders[0]).toLocaleString()}</div>
                                    <div>{new Date(elem.reminders[0]).toLocaleString()}</div>
                                </td>
                                <td>
                                    <select name="notification" onChange={changeEditState}>
                                        <option>-select-</option>
                                        <option value="both">Both</option>
                                        <option value="email">Email</option>
                                        <option value="sms" >SMS </option>
                                    </select>
                                </td>
                                <td>
                                    <select name="isCompleted" onChange={changeEditState}>
                                        <option>-select-</option>
                                        <option value={true} >Completed</option>
                                        <option value={false}>Not-Completed</option>
                                    </select>
                                </td>
                                <td><input type="button" onClick={deleteTask} name={elem._id} value="Delete" /></td>
                                <td><input type="button" onClick={sendEditedTask} name={elem._id} value="Save" /></td>
                            </tr>)
                        }
                        )}
                    </tbody>
                </table>
            }
            <button onClick={onlogout}>Logout</button>
        </>
    )
}
export default Dashboard;