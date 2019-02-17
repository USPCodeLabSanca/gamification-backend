import express from 'express';
import User from '../models/user'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import authConfig from '../auth.json'
import authMiddleware from '../middlewares/auth'
import adminMiddleware from '../middlewares/admin'
import mailer from '../modules/mailer'
import crypto from 'crypto'

let router = express.Router();

//basic crud stuff - requires admin authentication
router.delete('/', [authMiddleware, adminMiddleware, deleteAllUsers])
router.delete('/:nusp', [authMiddleware, adminMiddleware, deleteUser])
router.patch('/:nusp', [authMiddleware, adminMiddleware, patchUser])

//routes that do not require authentication
router.post('/register', registerUser)
router.post('/auth', authUser)
router.post('/forgot', forgotPassword)
router.post('/resetoken', authResetToken)
router.post('/reset', resetPassword)

//routes that requires authentication
router.post('/open', [authMiddleware, openPack])


// generates a json web token based on user id
function generateToken(params = {}){
    return jwt.sign(params, authConfig.secret_key, {
        expiresIn: 86400,
    });
}


// user registration
async function registerUser(req, res) {
    let { email } = req.body
    let { nusp } = req.body
    try {
        //if email taken
        if(await User.findOne({ email })) {
            return res.status(409).send({ error: 'User already exists (email taken)'})
        }

        //if nusp taken
        if(await User.findOne({ nusp })) {
            return res.status(409).send({ error: 'User already exists (nusp taken)'})
        }
        //creates a new user and stores it in database
        let user = await User.create(req.body);

        user.password = undefined;
        user.admin = undefined;
        return res.send({user, token: generateToken({id: user.id, admin: false}) })
    } catch(err) {
        console.log(err)
        return res.status(400).send({error: 'Registration Failed'})
    }
}

// user authentication
async function authUser(req, res) {
    let { email, password } = req.body;

    let user = await User.findOne({ email }).select('+password').select('+admin')

    if(!user) 
        return res.status(400).send({ error: 'Email not found.' })

    let isAdmin = user.admin

    if(!await bcrypt.compare(password, user.password))
        return res.status(400).send({ error: 'Invalid Password.' })

    user.password = undefined;
    user.admin = undefined;
    res.send({ user, token: generateToken({ id: user.id, admin: isAdmin }) })
}

// function to get cards index
function getCards(user) {
    let a, b, c;
    for(a = 0; a < 3; a++){
        for(b = 0; b < 16; b++){
            if(user.cards[a][b] == 0){
                while(true){
                    let i = Math.floor((Math.random() * 3));
                    let j = Math.floor((Math.random() * 16));
                    if(user.cards[i][j] == 0){
                        return [i,j];
                    }
                }
            }
        }
    }
    return [-1, -1]
}

// open a card pack for the user
async function openPack(req, res) {
    console.log(req.userId)
    let user = await User.findById(req.userId);

    if(!user) 
        return res.status(400).send({ error: 'Invalid user.' })

    if(user.packs <= 0)
        return res.status(400).send({ error: 'Not enough packs.' })

    else { 
        let my_cards = []
        for(let count = 0; count < 3; count++){
            let [i, j] = getCards(user)
            if(i < 0 || j < 0)
                break
            user.cards[i][j] += 1
            my_cards.push( [i, j] )         
        }
        user.packs -= 1
        user.markModified('cards')
        await user.save();

        return res.send({
            indexes: my_cards,
            cards: user.cards,
            packs: user.packs
        })
    }
}

// resets password
async function forgotPassword(req, res) {
    let { email } = req.body;

    try {

        let user = await User.findOne({ email })

        if(!user)
            return res.status(400).send({error: 'Email not found.'})

        let token = crypto.randomBytes(3).toString('hex');

        const now = new Date();
        now.setMinutes(now.getMinutes() + 15)

        user.passwordResetToken = token
        user.passwordResetExpires = now

        user.save();

        mailer.sendMail({
            to: email,
            from: "Porcarata <bixoquest@gmail.com>",
            subject: "BixoQuest: Esqueci minha senha",
            text: "Olá " + user.name + ", Seu token é " + token
        }, (err, info) => {
            if(err){
                return res.status(400).send({error: 'Could not set email'})
            } else {
                return res.send()
            }
         });

    } catch (err) {
        return res.status(400).send({error: 'Error on forgot password.'})
    }

}

async function authResetToken(req, res) {
    let { token } = req.body;
    try {
        let user = await User.findOne({ passwordResetToken: token }).select('+passwordResetExpires')
        
        if(!user) 
            return res.status(400).send({ error: 'Token not found.' })

        let now = new Date();
        if(now > user.passwordResetExpires)
            return res.status(400).send({ error: 'Token expired.'})

        res.send()
    } catch (e) {
        res.status(400).send({ error: 'Could not validate token. Please try again' });
    }
}

async function resetPassword(req, res) {
    let { email, token, password } = req.body;

    try {
        let user = await User.findOne({ email }).select('+passwordResetToken passwordResetExpires')

        if(!user)
            return res.status(400).send({ error: 'User not found.' })

        if(token !== user.passwordResetToken)
            return res.status(400).send({ error: 'Invalid Token.' })

        let now = new Date();
        if(now > user.passwordResetExpires)
            return res.status(400).send({ error: 'Token expired.'})

        user.password = password
        user.passwordResetExpires = undefined
        user.passwordResetToken = undefined

        await user.save();

        res.send();

    } catch (err) {
        res.status(400).send({ error: 'Cannot reset password, try again' });
    }
}


// ==== CRUD ====


async function deleteUser(req, res) {
    try {
        let result = await User.deleteOne({nusp: req.params.nusp})
        return res.send({result: 'Ok'})
    } catch (err) {
        console.log(err)
        return res.status(404).send({error: 'Error deleting user'})
    }
}

async function deleteAllUsers(req, res) {
    try {
        await User.collection.drop();
        return res.send({result: 'Ok'})
    } catch (err) {
        console.log(err)
        return res.status(404).send({error: 'Error deleting users'})
    }
}

async function patchUser(req, res) {
    try {
        let result = await User.updateOne({nusp: req.params.nusp}, req.body)
        return res.send({result: 'Ok'})
    } catch (err) {
        console.log(err)
        return res.status(404).send({error: 'Error deleting user'})
    }
}

export default router