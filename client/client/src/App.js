import React from "react";

import { Routes, Route, Navigate } from 'react-router-dom';

import Home from "./components/Home.js";
import Register from "./components/Register.js";
import About from "./components/About.js";
import Login from "./components/Login.js";
import Dashboard from "./components/Dashboard.js";

function App() {

    return (
        <Routes>
            <Route path="/" element={<Home />}></Route>
            <Route path="/about" element={<About />}></Route>
            <Route path="/register" element={<Register />}></Route>
            <Route path="/login" element={<Login />}></Route>
            <Route path="/dashboard" element={<Dashboard />}> </Route>
            <Route path="*" element={<Navigate to="/login" />}></Route>
        </Routes>
    )
}
export default App;