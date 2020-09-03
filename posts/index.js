const express = require('express');
const { randomBytes } = require('crypto');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(express.json());        // Parse JSON bodies
app.use(cors());

const posts = new Map();

app.get('/posts', (req, res) => {
    console.log("Posts: Processing GET to /posts...");
    res.send(Object.fromEntries(posts));
});

app.post('/posts', (req, res) => {
    console.log("Posts: Processing POST to /posts...");
    const { title } = req.body;

    if (title === undefined) {
        res.status(400).send({"error" : "Bad request. Title must be provided."});
    } else {
        // Create new post
        const newPostID = randomBytes(4).toString("hex");
        posts.set(newPostID, { title: title, comments: [] }); 
        // Create new post event
        const event = { "eventType": "NewPost", "eventData": { "postID": newPostID, "postTitle": title }};
        // Publish new post event
        axios.post("http://localhost:4005/events", event)
            .then(response => {
                console.log("Published new Post event. Post ID: " + newPostID);
            })
            .catch((e) => {
                // Not hard failing the call. Assumes separate mechanism of dealing with entropy/bootstrapping the query service (or a other services data);
                console.log("Failed to publish new post event. Post ID: " + newPostID + ". Error: " + e);
            });

        res.status(201).send(newPostID);
    }
});

app.post("/events", (req, res) => {
    console.log("Posts: Processing POST to /events...");
    const event = req.body;

    if (event.eventType == "NewComment") {
        addNewComment(event.eventData.postID, event.eventData.postComment);
    } else {
        console.log("Ignoring events of type: " + event.eventType);    
        // res.status(400).send("Unsupported event type: " + event.eventType);
    }
    
    res.status(200).send();
});

app.listen(4000, () => {
    console.log("Posts: Listening for Blog Posts on 4000");
});

function addNewComment(postID, comment) {
    if (posts.has(postID)) {
       const postComments = posts.get(postID).comments || [];
       postComments.push(comment);
    } else {
        console.log("Invalid post id: " + postID);
    }
}