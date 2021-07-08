const path = require('path');
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const app = express();
var bodyParser = require("body-parser");
const accessTokenSecret = 'youraccesstokensecret';
const users = [
    {
        username: 'john',
        password: 'password123admin',
        role: 'admin'
    }, {
        username: 'anna',
        password: 'password123member',
        role: 'member'
    }
];
const cockpitRoutes = express.Router();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
});

app.use(express.static(__dirname + '/public'));
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/login.html'));
});

/** post JWT token*/
app.post('/postToken', function (req, res) {    
    console.log(req.body);
    app.set('token', req.body.jwt); 
    app.set('studies', req.body.studies);
    var servResp = {};
    servResp.success = true;
    servResp.redirect = true;
    // servResp.redirectURL = "http://localhost:89/?token="+req.body.jwt;
    res.send(servResp); 
});

/** User Login JWT generation code */
app.post('/login', (req, res) => {
    // Read username and password from request body
    const { username, password } = req.body;

    // Filter user from the users array by username and password
    const user = users.find(u => { return u.username === 'john' && u.password === 'password123admin' });
    if (user) {
        // Generate an access token
        const accessToken = jwt.sign({ username: user.username,  role: user.role }, accessTokenSecret);
        
        res.json({
            accessToken
        });
    } else {
        res.send('Username or password incorrect');
    }
});

// Authenticate JWT on node layer
const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, accessTokenSecret, (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }
            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401);
    }
};


/** UI Routing Code */
cockpitRoutes.route("/worklist").get((req, res) => {
    res.sendFile(path.join(__dirname + '/worklist.html'));
});

cockpitRoutes.route("/viewer").get((req, res) => {
    res.sendFile(path.join(__dirname + '/viewer.html'));
});

app.use('/', cockpitRoutes);

app.listen(8000);
console.log('Now the server is running');

