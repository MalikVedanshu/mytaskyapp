import express from "express";
const port = process.env.PORT || 5000;
const app = express();


import './utils/dbConnect.js';
import taskRouter from './controllers/tasks.js';
import userRouter from './controllers/users.js';
import adminRouter from './controllers/admin.js';
/*
    API : /api/tasks
    Method : POST
    Desc : This API will schedule the task as crons
*/
app.use(express.static('build'))
app.use(express.json())

app.use("/api/task",taskRouter);
app.use("/api/user",userRouter);
app.use("/api/admin",adminRouter);
app.listen(port,() => {
    console.log(`app started at ${port}`);
})