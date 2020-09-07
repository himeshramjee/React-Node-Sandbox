const express = require("express");
const axios = require("axios");
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

var naughtyWords  = new Map();
naughtyWords.set("0", {word: "asdf1", status: "Rejected", reason: "excessive venting"});
naughtyWords.set("1", {word: "asdf2", status: "Rejected", reason: "destructive"});
naughtyWords.set("2", {word: "asdf3", status: "Rejected", reason: "racist"});

app.post("/events", (req, res) => {
    const event = req.body;

    if (event.eventType === "NewComment") {
        handleNewCommentEvent(event);
    }

    res.status(200).send();
});

app.listen(4003, () => {
    console.log("Moderator: Listening on port 4003");
});

function handleNewCommentEvent(event) {
    // console.log("Processing new comment event with ID: " + event.eventID);
    
    const naughtyWordResult = findNaughtyWord(event.eventData.comment);
    let newEvent = {};

    // Create new comment updated event
    if(naughtyWordResult) {
        newEvent = { "eventType": "CommentUpdated", "eventData": { "postID": event.eventData.postID, "commentID": event.eventData.commentID, "comment": event.eventData.comment, "status": naughtyWordResult.status, "statusReason": naughtyWordResult.reason }};
    } else {
        newEvent = { "eventType": "CommentUpdated", "eventData": { "postID": event.eventData.postID, "commentID": event.eventData.commentID, "comment": event.eventData.comment, "status": "Approved", "statusReason": "" }};
    }

    // Publish new post event
    axios.post("http://localhost:4005/events", newEvent)
        .then(response => {
            // console.log("Published new Comment Updated event. Comment ID: " + event.eventData.commentID);
        })
        .catch((e) => {
            // Not hard failing the call. Assumes separate mechanism of dealing with entropy/bootstrapping the query service (or a other services data);
            console.log("Failed to publish new comment updated event. ID: " + event.eventData.commentID + ". Error: " + e);
        });
}

function findNaughtyWord(comment) {
    let badItem = null;

    naughtyWords.forEach((item, key) => {
        if (comment.search(item.word) != -1) {
            badItem = item;
        }
    });

    if (badItem) {
        return badItem;
    } else {
        // console.log("No bad words found.");
        return null;
    }
}