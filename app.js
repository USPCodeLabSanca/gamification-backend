// import path from 'path'
import logger from 'morgan'
import cookieParser from 'cookie-parser'
import express from 'express'

let app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.get('/', (req,res) => {res.send('Hello!')})

import LoginRouter from "./src/routes/login"
app.use('/users', LoginRouter)

export default app;
