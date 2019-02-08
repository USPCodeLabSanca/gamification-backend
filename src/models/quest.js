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
    missionId: {
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

});

const Quest = mongoose.model('Quest', QuestSchema)

export default Quest;