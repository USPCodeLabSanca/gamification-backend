import mongoose from '../database/index'

const QuestSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    description: {
        type: String,
        require: true,
    },
    questType: {
        type: String,
        require: true,
    },
    questId: {
        type: Number,
        unique: true,
        required: true
    },
    code: {
        type: String,
        required: true,
        select: false
    },
    rewardPoints: {
        type: Number,
        required: true,
        select: true
    },
    rewardPacks: {
        type: Number,
        required: true,
        select: true
    },
    startDate: {
        type: Date,
        required: true,
        select: true
    },
    endDate: {
        type: Date,
        select: true,
        default: new Date(2019, 2, 22, 23, 59, 59, 60)
    }
});

const Quest = mongoose.model('Quest', QuestSchema)

export default Quest;