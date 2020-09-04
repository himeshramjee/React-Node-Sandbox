const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

var posts = new Map();

app.get("/posts", (req, res) => {
    res.status(200).send(Object.fromEntries(posts));
});

app.get("/posts/rebuild", async (req, res) => {
    // Clear list of posts, we'll query each service and rebuild it.
    // Obviously this mechanism wouldn't work for large datasets.
    posts = new Map();

    // Fetch posts
    await axios.get("http://localhost:4000/posts")
        .then(response => {
            Object.entries(response.data).map(([postID, post]) => {
                addNewPost(postID, post.title, []);
            });
        })
        .catch(e => {
            console.log("QueryService: Failed to retrieve posts. Error: " + e);
        });
        
    // Fetch comments for each post
    Object.entries(posts).map(async ([postID, post]) => {
        await axios.get(`http://localhost:4001/posts/${postID}/comments`)
            .then(response => {
                Object.entries(response.data).map(([comment]) => {
                    addNewComment(postID, comment.commentID, comment.comment);
                });
            })
            .catch(e => {
                console.log("Failed to retrieve comments for PostID: " + postID + ". Error: " + e);
            });
    });

    res.status(200).send(posts);
});

app.post("/events", (req, res) => {
    const event = req.body;

    if (event.eventType === "NewPost") {
        console.log("Processing new post event with ID: " + event.eventID);
        addNewPost(event.eventData.postID, event.eventData.title, []);
    }

    if (event.eventType === "NewComment") {
        console.log("Processing new comment event with ID: " + event.eventID);
        addNewComment(event.eventData.postID, event.eventData.commentID, event.eventData.comment);
    }

    res.status(200).send();
});

app.listen(4002, () => {
    console.log("QueryService: Listening for blog queries on port 4002.");
});

function addNewPost(postID, postTitle, comments) {
    posts.set(postID, { title: postTitle, comments: comments });
    console.log("New Post from event: " + postTitle);
}

function addNewComment(postID, commentID, comment) {
    if (posts && posts.has(postID)) {
        const comments = posts.get(postID).comments || [];
        comments.push({ commentID: commentID, comment: comment });
    }
}