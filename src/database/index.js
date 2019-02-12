import mongoose from 'mongoose'
mongoose.Promise = global.Promise;

let mongo_uri = 'mongodb://localhost:27017/gamification'
if(process.env.MONGO_URI)
    mongo_uri = 'mongodb://' + process.env.MONGO_URI + ':27017/gamification'

try { mongoose.connect(mongo_uri, { useNewUrlParser: true })}
catch(err) { mongoose.createConnection(mongo_uri, { useNewUrlParser: true })}

mongoose.connection.once('open', () => console.log('MongoDB Running')).on('error', e => {throw e;})

//supress deprecation warning
mongoose.set('useCreateIndex',true)

export default mongoose