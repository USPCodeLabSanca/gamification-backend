// import path from 'path'
import logger from 'morgan'
import cookieParser from 'cookie-parser'
import express from 'express'
import cors from 'cors'

let app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors())

app.get('/api/', (req,res) => {res.send('Ok')})

import AuthRouter from "./routes/auth"
app.use('/api/users', AuthRouter)

import QuestRouter from "./routes/quest"
app.use('/api/quests', QuestRouter)

export default app;
