import mongoose from 'mongoose'
mongoose.Promise = global.Promise;

try { mongoose.connect('mongodb://mongodb:27017/gamification', { useNewUrlParser: true })}
catch(err) { mongoose.createConnection('mongodb://mongodb:27017/gamification', { useNewUrlParser: true })}

mongoose.connection.once('open', () => console.log('MongoDB Running')).on('error', e => {throw e;})

//supress deprecation warning
mongoose.set('useCreateIndex',true)

export default mongoose