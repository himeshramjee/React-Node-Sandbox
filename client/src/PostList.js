import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CommentCreate from './CommentCreate';
import CommentList from './CommentList';

export default () => {
    const [posts, setPosts] = useState({});

    const fetchPosts = async () => {
        const response = await axios.get('http://localhost:4002/posts');
        setPosts(response.data);
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const renderedPosts = Object.entries(posts).map(([postID, post]) => {

        return <div className="card"
                style={{ width: '30%', marginBottom: '20px' }}
                key={postID}>
                    <div className="card-body">
                        <h3>{post.title}</h3>
                        <CommentList postComments={post.comments}/>
                        <CommentCreate postID={postID}/>
                    </div>
                </div>
    });

    return (
        <div className="d-flex flex-row flex-wrap justify-content-between">
            {renderedPosts}
        </div>
    );
};