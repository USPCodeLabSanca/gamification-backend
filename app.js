// import path from 'path'
import logger from 'morgan'
import cookieParser from 'cookie-parser'
import express from 'express'

let app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.get('/', (req,res) => {res.send('')})

import AuthRouter from "./src/routes/auth"
app.use('/users', AuthRouter)

import QuestRouter from "./src/routes/quest"
app.use('/quests', QuestRouter)

export default app;
