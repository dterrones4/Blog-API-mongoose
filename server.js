'use strict';

const bodyParser = require('body-parser');
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise; 

const {DATABASE_URL} = require('./config')
const {BlogPosts} = require('./models');

const app = express();

app.use(bodyParser.json());
app.use(morgan('common'));

app.get('/posts', (req, res) => {
    BlogPosts
    .find()
    .then(posts => {
        res.json(posts.map(post => post.serialize()));
    })
    .catch(err => {
        console.error(err);
        rest.status(500).json({ message: 'Internal server error'});
    })
});

app.get('/posts/:id', (req, res) => {
    BlogPosts
    .findById(req.params.id)
    .then(post => res.json(post.serialize()))
    .catch(err => {
        console.error(err);
        res.status(500).json({ message: 'Internal server error'});
    });
});

app.post('/posts', (req, res) => {
    const requiredFields = ['title', 'content', 'author']
    for(let i = 0; i < requiredFields.length; i++) {
        const field = requiredFields[i];
        if(!(field in request.body)) {
            const message = `Missing \'${field}\' in request body`;
            console.error(message);
            return resizeBy.status(400).send(message);
        }
    }

    BlogPosts
    .create({
        title: req.body.title,
        content: req.body.content,
        author: req.body.author
    })
    .then(post => res.status(201).json(post.serialize()))
    .catch(err => {
        console.error(err);
        res.status(500).json({ message: 'Internal server error'})
    });
});

app.put('/posts/:id', (req, res) => {
    if(!(req.params.id && req.body.id && req.params.id === req.body.id)) {
        const message = (`Request path id (${req.params.id}) and 
                        request body id (${req.body.id}) must match`);
        console.error(message);
        res.status(400).json({ message: message});       
    }

    const toUpdate = {};
    const updateableFields = ['title', 'content', 'author'];

    updateableFields.forEach(field => {
        if(field in request.body) {
            toUpdate[field] = req.body[field];
        }
    });

    BlogPosts
    .findByIdAndUpdate(req.params.id, { $set: toUpdate })
    .then(post => res.status(204).end())
    .catch(err => res.status(500).json({ message: 'Internal server error'}));
});

app.delete('/posts/:id', (req, res) => {
    BlogPosts
    .findByIdAndRemove(req.params.id)
    .then(post => res.status(204).end)
    .catch(err => res.status(500).json({ message: 'Internal server error'}));
});

app.use('*', function (req, res) {
    res.status(404).json({ message: 'Not Found'});
});

let server;

function runServer(databaseUrl, port = PORT) {
    return new Promise((resolve, reject) => {
      mongoose.connect(databaseUrl, err => {
        if (err) {
          return reject(err);
        }
        server = app.listen(port, () => {
          console.log(`Your app is listening on port ${port}`);
          resolve();
        })
          .on('error', err => {
            mongoose.disconnect();
            reject(err);
          });
      });
    });
}

function closeServer() {
    return mongoose.disconnect().then(() => {
        return new Promise((resolve, reject) => {
            console.log('closing server');
            server.close(err => {
                if (err) {
                    return reject(err);                
            }
            resole();
            });
        });
    });
}

if (require.main === module) {
    runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = {app, runServer, closeServer};