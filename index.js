'use strict';

const path = require('path');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const validator = require('validator');
const API = require('./lib/API');
const { sessionName, sessionKeys } = require('./config');


app.disable('x-powered-by');

app.set('view engine', 'ejs');

app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true}));
app.use(cookieSession({
    name: sessionName,
    keys: sessionKeys
}));

app.get('/', async (req, res) => {
    const isAuthorized = (req.session.authorized);
    if(!isAuthorized) {
        res.render('index', { isAuthorized, id: '' });
    } else {
        try {
            const id = await API.getLinkedinId(req);
            res.render('index', { isAuthorized, id });
        } catch(err) {
            res.send(err);
        }
    }    
});

app.get('/auth', (req, res) => {
    res.redirect(API.getAuthorizationUrl());
});

app.get('/callback', async (req, res) => {
    if(!req.query.code) {
        res.redirect('/');
        return;
    }
    try {
        const data = await API.getAccessToken(req);
        if(data.access_token) {
            req.session.token = data.access_token;
            req.session.authorized = true;
        }
        res.redirect('/');
    } catch(err) {
        res.json(err);
    }
});

app.post('/publish', async (req, res) => {
    const { title, text, url, thumb, id } = req.body;
    const errors = [];

    if(validator.isEmpty(title)) {
        errors.push({ param: 'title', msg: 'Invalid value.'});
    }
    if(validator.isEmpty(text)) {
        errors.push({ param: 'text', msg: 'Invalid value.'});
    }
    if(!validator.isURL(url)) {
        errors.push({ param: 'url', msg: 'Invalid value.'});
    }
    if(!validator.isURL(thumb)) {
        errors.push({ param: 'thumb', msg: 'Invalid value.'});
    }

    if(errors.length > 0) {
        res.json({ errors });
    } else {
        const content = {
            title: title,
            text: text,
            shareUrl: url,
            shareThumbnailUrl: thumb
        };

        try {
            const response = await API.publishContent(req, id, content);
            res.json({ success: 'Post published successfully.' });
        } catch(err) {
            res.json({ error: 'Unable to publish your post.' });
        }
    }
});

app.listen(port);