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
    await axios.get("http://localhost:4000/posts")
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
        await axios.get(`http://localhost:4001/posts/${postID}/comments`)
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

    if (event.eventType === "NewPost") {
        addNewPost(event.eventData.postID, event.eventData.title, []);
    }

    if (event.eventType === "NewComment") {
        addNewComment(event.eventData.postID, event.eventData.commentID, event.eventData.comment, event.eventData.status, event.eventData.statusReason);
    }

    if (event.eventType === "CommentUpdated") {
        updateComment(event.eventData.postID, event.eventData.commentID, event.eventData.comment, event.eventData.status, event.eventData.statusReason);
    }

    res.status(200).send();
});

app.listen(4002, () => {
    console.log("QueryService: Listening for blog queries on port 4002.");
});

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