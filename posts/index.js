const express = require('express');
const { randomBytes } = require('crypto');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(express.json());        // Parse JSON bodies
app.use(cors());

const posts = new Map();

app.get('/posts', (req, res) => {
    res.send(Object.fromEntries(posts));
});

app.post('/posts', (req, res) => {
    const { title } = req.body;

    if (title === undefined) {
        res.status(400).send({"error" : "Bad request. Title must be provided."});
    } else {
        // Create new post
        const newPostID = randomBytes(4).toString("hex");
        posts.set(newPostID, { title: title, comments: [] }); 
        // Create new post event
        const event = { "eventType": "NewPost", "eventData": { "postID": newPostID, "title": title }};
        // Publish new post event
        axios.post("http://localhost:4005/events", event)
            .then(response => {
                // console.log("Published new Post event. Post ID: " + newPostID);
            })
            .catch((e) => {
                // Not hard failing the call. Assumes separate mechanism of dealing with entropy/bootstrapping the query service (or a other services data);
                console.log("Failed to publish new post event. Post ID: " + newPostID + ". Error: " + e);
            });

        res.status(201).send(newPostID);
    }
});

app.post('/posts/reset-data', (req, res) => {
    posts.clear();
    res.status(200).send();
});

app.listen(4000, () => {
    console.log("Posts: Listening for Blog Posts on 4000");
});