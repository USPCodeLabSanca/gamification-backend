import mongoose from '../database/index'
import bcrypt from 'bcryptjs'

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    email: {
        type: String,
        unique: true,
        require: true,
        required: true,
        lowercase: true
    },
    nusp: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    points: {
        type: Number,
        required: false,
        select: true,
        default: 0
    },
    packs: {
        type: Number,
        required: false,
        select: true,
        default: 0
    },
    questsCompleted: {
        type: Array,
        required: false,
        select: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    admin: {
        type: Boolean,
        default: false,
        select: false
    },
    cards: {
        type: Array,
        default: [ [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] ]
    }
});

UserSchema.pre('save', async function(next) {
    if (this.password) {
        let hash = await bcrypt.hash(this.password, 10);
        this.password = hash;
    }

    next();
})

const User = mongoose.model('User', UserSchema)

export default User;