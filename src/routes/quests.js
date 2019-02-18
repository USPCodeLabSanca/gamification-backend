import express from 'express';
import Quest from '../models/quest';
import User from '../models/user';
import AuthMiddleware from '../middlewares/auth'
import AdminAuthMiddleware from '../middlewares/admin'

let router = express.Router()

// basic crud stuff
router.get('/', [AuthMiddleware, AdminAuthMiddleware, listQuests]) //get all quests (requires admin)
router.post('/', [AuthMiddleware, AdminAuthMiddleware, createQuest]) //creates a new quest (requires admin)
router.delete('/', [AuthMiddleware, AdminAuthMiddleware, dropQuests]) //deletes all quests (requires admin)
router.delete('/:quest_id', [AuthMiddleware, AdminAuthMiddleware, dropQuest]) //deletes the quest with quest_id (requires admin)

// special routes
router.post('/validate', [AuthMiddleware, validateQuest]) // checks if quest password is valid
router.get('/past',  pastQuests) // gets all inactive quests
router.get('/active',  activeQuests) // gets all active quests


// ==== CRUD ==== //


async function listQuests(req, res) {
    let quests = await Quest.find({})
    
    let i;
    for(i = 0; i < quests.length; i++) {
        quests[i].startDate.setHours( quests[i].startDate.getHours() - 3 )
        quests[i].endDate.setHours( quests[i].endDate.getHours() - 3 )
    }

    return res.send(quests)
}


async function createQuest(req, res) {

    let questId = req.body.questId
    try {
        //if questId taken
        let quest = await Quest.findOne({ questId: questId })
        if(quest)
            return res.status(409).send({ error: 'Quest already exists (duplicate questId)'})

        //creates a new quest and stores it in database
        quest = await Quest.create(req.body);
        return res.status(201).send(quest)

    } catch(err) {
        console.log(err)
        return res.status(400).send({error: 'Registration Failed'})
    }
}


async function dropQuests(req, res) {
    try{
        await Quest.collection.drop();
        return res.send(quests)
    } catch(err) {
        console.log(err)
        return res.status(404).send({error: 'Error deleting quest collection'})
    }
}


async function dropQuest(req, res) {
    try {
        await Quest.deleteOne({questId: req.params.quest_id})
        return res.send({result: 'Ok'})
    } catch (err) {
        console.log(err)
        return res.status(404).send({error: 'Error deleting quest'})
    }
}


// ==== OTHER STUFF ===


async function validateQuest(req, res) {
    let questId = req.body.questId
    let code = req.body.code;
    code = code.trim().toLowerCase();

    // valida a missão
    let quest = await Quest.findOne({ questId }).select('+code')

    if(!quest) {
        return res.status(400).send({ error: 'Quest not found.' })
    }

    if(quest.code != code)
        return res.status(400).send({ error: 'Invalid Code.' })
    else {
        // correct code!
        let user = await User.findById(req.userId);

        if(!user){
            return res.status(400).send({ error: 'User not found' })
        }

        // checks if user already completed this quest
        if (user.questsCompleted.includes(questId)){
            return res.status(400).send({ error: 'Quest already completed.' })
        }

        // set quest as completed 
        user.questsCompleted.push(quest.questId);
        //give rewards to player
        if( quest.rewardPoints > 0 ) {
            user.points += quest.rewardPoints;
        }
        if( quest.rewardPacks > 0){
            user.packs += quest.rewardPacks;
        }


        while(user.points >= 100){
            user.points -= 100;
            user.packs += 1;
        }

        //saves changes
        await user.save()
        // returns user data with code 200 to client
        return res.send(user)
    }
}

async function pastQuests(req, res) {
    let current_date = new Date();
    current_date = current_date.setHours(current_date.getHours() - 3)

    let quests_return = [];
    try {
        let quests = await Quest.find(Quest.find({}))

        let i;
        for(i = 0; i < quests.length; i++) {
            quests[i].startDate.setHours( quests[i].startDate.getHours() - 3 )
            quests[i].endDate.setHours( quests[i].endDate.getHours() - 3 )
            if(quests[i].endDate <= current_date){
                quests_return.push(quests[i])
            }
        }

        return res.send(quests_return)
    } catch (e) {
        console.log(e)
        return res.status(400).send({error: "failed to search quests"})
    }
}

async function activeQuests(req, res) {
    let current_date = new Date(Date.now());
    current_date = current_date.setHours(current_date.getHours() - 3)

    let quests_return = []

    try {
        let quests = await Quest.find(Quest.find({}))

        let i;
        for(i = 0; i < quests.length; i++) {
            quests[i].startDate.setHours( quests[i].startDate.getHours() - 3 )
            quests[i].endDate.setHours( quests[i].endDate.getHours() - 3 )
            if(quests[i].startDate <= current_date && quests[i].endDate >= current_date){
                quests_return.push(quests[i])
            }
        }

        return res.send(quests_return)
    } catch (e) {
        console.log(e)
        return res.status(400).send({error: "failed to search quests"})
    }

}


export default router