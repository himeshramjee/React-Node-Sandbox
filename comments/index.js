const express = require('express');
const { randomBytes } = require('crypto');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(express.json());        // Parse JSON bodies
app.use(cors());

var comments = new Map();

app.get('/posts/:id/comments', (req, res) => {
    const postID  = req.params.id;

    res.send(comments.get(postID));
});

app.post('/posts/:id/comments', (req, res) => {
    const postID  = req.params.id;
    const { comment } = req.body;

    if (postID === undefined || comment === undefined) {
        res.status(400).send({"error" : "Bad request. Comment must be provided."});
    } else {
        // Create new comment
        const newCommentID = addNewComment(postID, comment);
        // Create new comment event
        const event = { "eventType": "NewComment", "eventData": { "postID": postID, "commentID" : newCommentID, "comment": comment }};
        // Publish new post event
        axios.post("http://localhost:4005/events", event)
            .then(response => {
                console.log("Published new Comment event. Post ID: " + postID + ". Comment ID: " + newCommentID);
            })
            .catch((e) => {
                // Not hard failing the call. Assumes separate mechanism of dealing with entropy/bootstrapping the query service (or a other services data);
                console.log("Failed to publish new comment event. ID: " + newCommentID + ". Error: " + e);
            });

        res.status(201).send(Object.fromEntries(comments));
    }
});

app.post("/events", (req, res) => {
    const event = req.body;

    if (event.eventType == "NewPost") {
        // Register new Post with no initial comments
        comments.set(event.eventData.postID, []);
    } else {
        console.log("Ignoring events of type: " + event.eventType);
        // res.status(400).send("Unsupported event type: " + event.eventType);
    }

    res.status(200).send();
});

app.listen(4001, () => {
    console.log("Comments: Listening for Blog Comments on 4001");
});

function addNewComment(postID, comment) {
    const commentID = randomBytes(4).toString("hex");

    if (comments && comments.has(postID)) {
        // Get to current comments
        var comments = comments.get(postID);
        // Append new comment
        comments.push({id: commentID, comment});
        // Update post
        comments.set(postID, comments);
    } else {
        // Create first post comment
        if (!comments) {
            comments = new Map();
        }
        comments.set(postID, [{id: commentID, comment}]);
    }

    return commentID;
}