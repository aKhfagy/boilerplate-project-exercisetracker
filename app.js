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
    },
    logs: [{
        description: {
                type: String,
                required: true
            },
        duration: {
                type: Number,
                required: true
            },
        date: {
                type: String,
                required: false
            }
    }]
});

const User = mongoose.model('User', userSchema);

const createUser = async (name, done) => {
    if(isConnected()) {
        let user = new User({username: name});
        await user.save((err, data) => {
            if(err)
                return done(err, null);
            done(null, data);
        });
    }
    else {
        done(errorJson, null);
    }
};

const getUser = async (done) => {
    if(isConnected()) {
        await User.find({}, (err, data) => {
            if(err)
                return done(err, null);
            const array = data.map(user => {
                            return { 
                                    'username': user.username, '_id': user._id 
                                } 
                            });
            done(null, array);
        });
    }
    else {
        done(errorJson, null);
    }
};

const createLog = async (log, done) => {
    if(isConnected()) {
        const entry = {
            description: log.description,
            duration: log.duration
        };
        if(log.date) {
            if(/\d{4}-\d{2}-\d{2}/.test(log.date))
                entry.date = new Date(log.date).toDateString();
            else 
                done({error: 'Invalid Date Format'}, null);
        }
        else 
            entry.date = new Date().toDateString();
        const id = log.id;
        await User.findById(id, (err, user) => {
            if(err)
                return done(err, null);
            user.logs.push(entry);
            user.save((err, data) => {
                if(err) 
                    return done(err, null);
                let here = data.logs[data.logs.length -1];
                done(null, {
                    _id: data._id,
                    username: data.username,
                    description: here.description,
                    duration: here.duration,
                    date: here.date
                });
            })
        })
    }
    else {
        done(errorJson, null);
    }
};

const getLogs = async (entry, done) => {
    if(isConnected()) {
        const {id, from, to, limit} = entry;
        await User.findById(id, (err, user) => {
            if(err)
                return done(err, null);
            let result = user.logs.map(
                item => {
                    return {
                        description: item.description,
                        duration: item.duration, 
                        date: item.date 
                    };
            });
            if (from)
                result = result.filter(
                    log => 
                    new Date(log.date).getTime() 
                    >= new Date(from).getTime()); 
            if (to)
                result = result.filter(
                    log => 
                    new Date(log.date).getTime() 
                    <= new Date(to).getTime());
            if (limit)
                result = result.slice(0, limit);
            done(null, {
                _id: user._id,
                username: user.username,
                count: result.length,
                log: result
            });
        });
    }
    else {
        done(errorJson, null);
    }
};

// Export models
exports.createUser = createUser;
exports.getUser = getUser;
exports.createLog = createLog;
exports.getLogs = getLogs;
