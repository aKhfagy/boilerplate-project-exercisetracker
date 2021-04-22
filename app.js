require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env['MOGO_KEY'];
const errorJson = {error: "Not connected to db"};
mongoose.connect(uri, { 
                    useUnifiedTopology: true,
                    useNewUrlParser: true
                })
                .then(() => 
                console.log('success connecting database'))
                .catch(err => 
                console.log(
                    err + '\n' +
                     "fialed to connect to database"));

const isConnected = () => {
    // used for debugging
    return mongoose &&
        mongoose.connection && 
        mongoose.connection.readyState;
};

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    }
});

const logSchema = new mongoose.Schema({
    userID: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const User = mongoose.model('User', userSchema);
const Log = mongoose.model('Log', logSchema);

const createUser = async (name, done) => {
    if(isConnected()) {
        let user = new User({username: name});
        await user.save((err, data) => {
            if(err)
                return console.log(err);
            done(null, data);
        }).catch(err => console.log(err));
    }
    else {
        done(errorJson, null);
    }
};

const getUser = async (id, done) => {
    if(isConnected()) {
        await User.findById({_id: id}, (err, data) => {
            if(err)
                return console.log(err);
            done(null, data);
        }).catch(err => console.log(err));
    }
    else {
        done(errorJson, null);
    }
};

const createLog = async (log, done) => {
    if(isConnected()) {
        const entry = {
            id: log.id,
            description: log.description,
            duration: log.duration
        };
        if(log.date)
            entry.date = log.date;
        let exercise = new Log(entry);
        await exercise.save((err, data) => {
            if(err)
                return console.log(err);
            done(null, data);
        });
    }
    else {
        done(errorJson, null);
    }
};

const getLogs = async (id, done) => {

};

// Export models
exports.UserModel = User;
exports.LogModel = Log;
exports.createUser = createUser;
exports.getUser = getUser;
exports.createLog = createLog;
exports.getLogs = getLogs;