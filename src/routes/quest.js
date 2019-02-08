import express from 'express';
import Quest from '../models/quest';
import User from '../models/user';
import Autentication from '../middlewares/auth'

let router = express.Router()

router.use(Autentication)

// basic crud stuff
router.get('/', listQuests); //get all quests (requires admin)
router.post('/', createQuest) //creates a new quest (requires admin)
router.delete('/', dropQuests) //deletes all quests (requires admin)
router.delete('/:quest_id', dropQuest) //deletes the quest with quest_id (requires admin)

// special routes
router.post('/validate', validateQuest) // checks if quest password is valid


async function listQuests(req, res) {
    let admin=req.admin
    if(!admin){
        return res.status(403).send({ error: 'User is not admin'})
    }
    let quests = await Quest.find({})
    return res.send(quests)
}

async function createQuest(req, res) {
    // checking if user is admin
    let admin = req.admin
    if(!admin){
        return res.status(403).send({ error: 'User is not admin'})
    }

    let { questId } = req.body
    try {
        //if questId taken
        if(await Quest.findOne({ questId })) {
            return res.status(409).send({ error: 'Quest already exists (duplicate questId)'})
        }

        //creates a new quest and stores it in database
        let quest = await Quest.create(req.body);

        return res.status(201).send(quest)
    } catch(err) {
        console.log(err)
        return res.status(400).send({error: 'Registration Failed'})
    }
}

async function dropQuests(req, res) {
    let admin=req.admin
    if(!admin){
        return res.status(403).send({ error: 'User is not admin'})
    }
    await Quest.collection.drop();
    return res.send(quests)
}

async function dropQuest(req, res) {
    let admin=req.admin
    if(!admin){
        return res.status(403).send({ error: 'User is not admin'})
    }

    try {
        let result = await Quest.deleteOne({questId: req.params.quest_id})
        return res.send({result: 'Ok'})
    } catch (err) {
        console.log(err)
        return res.status(404).send({error: 'Error deleting quest'})
    }
}

async function validateQuest(req, res) {
    missionId = req.body.missionId
    code = req.body.code;

    // valida a missão
    let quest = await Quest.findOne({ missionId }).select('+password')

    if(!quest) {
        return res.status(400).send({ error: 'Quest not found.' })
    }

    if(quest.code != code)
        return res.status(400).send({ error: 'Invalid Code.' })
    else {
        // correct code!
        let user = await User.findOne(req.UserId);
        // set quest as completed 
        user.questsCompleted.push();
        //give rewards to player
        if( quest.rewardPoints > 0 ) {
            user.points += quest.rewardPoints;
        }
        if( quest.rewardPacks > 0){
            user.packs += quest.rewardPacks;
        }
        //saves changes
        await user.save()
        // returns user data with code 200 to client
        return res.send(user)
    }
}

export default router