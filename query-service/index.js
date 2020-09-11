const express = require("express");
const axios = require("axios");
const cors = require("cors");
const { static } = require("express");

const app = express();
app.use(express.json());
app.use(cors());

var cache = new Map();

app.get("/cache/posts", (req, res) => {
    res.status(200).send(Object.fromEntries(cache));
});

app.post('/cache/reset-data', (req, res) => {
    cache.clear();
    res.status(200).send();
});

app.post("/cache/rebuild", async (req, res) => {
    // Clear list of cache, we'll query each service and rebuild it.
    // Obviously this mechanism wouldn't work for large datasets.
    cache.clear();

    // Fetch cache
    await axios.get("http://posts-clusterip-srv:4000/posts")
        .then(response => {
            Object.entries(response.data).map(([postID, post]) => {
                addNewPost(postID, post.title, []);
            });
        })
        .catch(e => {
            console.log("QueryService: Failed to retrieve cache. Error: " + e);
        });

    // Fetch comments for each post
    cache.forEach(async (item, postID) => {
        await axios.get(`http://comments-clusterip-srv:4001/posts/${postID}/comments`)
            .then(response => {
                response.data.map(commentItem => {
                    addNewComment(
                        postID, 
                        commentItem.id, 
                        commentItem.comment, 
                        commentItem.status, 
                        commentItem.statusReason
                    );
                });
            })
            .catch(e => {
                console.log("Failed to retrieve comments for PostID: " + postID + ". Error: " + e);
            });
    });

    res.status(200).send(cache);
});

app.post("/events", (req, res) => {
    const event = req.body;

    handleBusEvent(event.eventType, event.eventData);

    res.status(200).send();
});

app.listen(4002, async () => {
    console.log("QueryService: Listening for blog queries on port 4002.");

    const response = await axios.get("http://event-bus-srv:4005/events")
                        .catch(error => {
                            console.log("Failed to get historical events to initialize query cache. Error: " + error);
                        });

    console.log("Processing historical events. Count of events is " + response.data.length);
    for (let event of response.data) {
        handleBusEvent(event.eventType, event.eventData);
    }
    console.log("Done processing historical events.");
});

function handleBusEvent(eventType, eventData) {
    if (eventType === "NewPost") {
        addNewPost(eventData.postID, eventData.title, []);
    }

    if (eventType === "NewComment") {
        addNewComment(eventData.postID, eventData.commentID,  eventData.comment,  eventData.status,  eventData.statusReason);
    }

    if (eventType === "CommentUpdated") {
        updateComment(eventData.postID, eventData.commentID, eventData.comment, eventData.status, eventData.statusReason);
    }
}

function addNewPost(postID, postTitle, comments) {
    cache.set(postID, { title: postTitle, comments: comments });
}

function addNewComment(postID, commentID, commentText, approvalStatus, statusReason) {
    if (cache && cache.has(postID)) {
        const comments = cache.get(postID).comments;
        
        comments.push({ 
            commentID: commentID, 
            comment: commentText, 
            status: approvalStatus, 
            statusReason: statusReason 
        });
        cache.get(postID).comments = comments;
    }
}

function updateComment(postID, commentID, comment, status, statusReason) {
    if (cache && cache.has(postID)) {
        const comments = cache.get(postID).comments;
        comments.map(commentItem => {
            if (commentItem.commentID === commentID) {
                commentItem.status = status;
                commentItem.statusReason = statusReason;
            }
        });
    } else {
        console.log("Invalid PostID received for updateComment request. PostID: " + postID + ". CommentID: " + commentID);
    }
}