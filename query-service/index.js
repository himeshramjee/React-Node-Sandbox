const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

app.get("/posts", async (req, res) => {
    // Get list of posts
    var posts = {};
    const comments = {};

    // Fetch posts
    await axios.get("http://localhost:4000/posts")
        .then(response => {
            posts = response.data;
            console.log(posts);
        })
        .catch(e => {
            console.log("QueryService: Failed to retrieve posts. Error: " + e);
            console.log(e);
        });
        
    // Fetch comments for each post
    Object.entries(posts).map(async ([postID, post]) => {
        await axios.get(`http://localhost:4001/posts/${postID}/comments`)
            .then(response => {
                comments[postID] = response.data;
                console.log("Posts count: " + Object.keys(comments[postID]).length);
            })
            .catch(e => {
                console.log("Failed to retrieve comments for PostID: " + postID + ". Error: " + e);
            });
    });

    // Compile data by adding comments to each post object
    Object.entries(comments).map(comment => {
        if (posts[comment.postID]) {
            posts[comment.postID].comments.push(comment);
        } else {
            console.log("Unable to match comments to PostID: " + comment.postID);
        }
    });


    res.status(200).send(posts);
});

app.listen(4003, () => {
    console.log("QueryService: Listening for blog queries on port 4003.");
});