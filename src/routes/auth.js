import express from 'express';
import User from '../models/user'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import authConfig from '../auth.json'

const router = express.Router();

//routes
router.post('/register', registerUser)
router.post('/auth', authUser)
router.post('/open', openPack)
router.post('/forgot', forgotPassword)


// generates a json web token based on user id
function generateToken(params = {}){
    return jwt.sign(params, authConfig.secret_key, {
        expiresIn: 86400,
    });
}


// user registration
async function registerUser(req, res) {
    let { email } = req.body
    try {
        //if email taken
        if(await User.findOne({ email })) {
            return res.status(409).send({ error: 'User already exists (email taken)'})
        }
        //creates a new user and stores it in database
        let user = await User.create(req.body);

        user.password = undefined;
        user.admin = false;

        return res.send({user, token: generateToken({id: user.id}) })
    } catch(err) {
        console.log(err)
        return res.status(400).send({error: 'Registration Failed'})
    }
}


// user authentication
async function authUser(req, res) {
    let { email, password } = req.body;

    let user = await User.findOne({ email }).select('+password').select('+admin')
    let isAdmin = user.admin
    if(!user) 
        return res.status(400).send({ error: 'Email not found.' })

    if(!await bcrypt.compare(password, user.password))
        return res.status(400).send({ error: 'Invalid Password.' })

    user.password = undefined;
    user.admin = undefined;
    res.send({ user, token: generateToken({ id: user.id, admin:isAdmin }) })
}


// open a card pack for the user
async function openPack(req, res) {
    
}

// resets password
async function forgotPassword(req, res) {

}

export default router