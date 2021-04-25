const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const db = require("./app.js");
require('dotenv').config();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

const createUser = db.createUser;
const getUser = db.getUser;
const createLog = db.createLog;
const getLogs = db.getLogs;

app.post('/api/users', async (req, res) => {
    const {username} = req.body;
    await createUser(username, (err, data) => {
        if(err)
            return res.json(err);
        res.json(data);
    });
});

app.get('/api/users', async (req, res) => {
    const {id} = req.body;
    await getUser((err, data) => {
        if(err)
            return res.json(err);
        res.json(data);
    });
});

app.post('/api/users/:_id/exercises', async (req, res) => {
    const log = {
        id: req.params._id,
        description: req.body.description,
        duration: req.body.duration,
        date: req.body.date
    };
    if(!log.id)
        return res.json('Invalid id');
    await createLog(log, (err, data) => {
        if(err)
            return res.json(err);
        res.json(data);
    });
});

app.get('/api/users/:_id/logs', async (req, res) => {
    const entry = {
        id: req.params._id,
        from: req.query.from,
        to: req.query.to,
        limit: req.query.limit
    };
    await getLogs(entry, (err, data) => {
        if(err)
            return res.json(err);
        res.json(data);
    });
});


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
});
