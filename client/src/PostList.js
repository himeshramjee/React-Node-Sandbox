import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CommentCreate from './CommentCreate';
import CommentList from './CommentList';

export default () => {
    const [posts, setPosts] = useState({});

    const fetchPosts = async () => {
        const response = await axios.get('http://localhost:4003/posts');
        setPosts(response.data);
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const renderedPosts = Object.entries(posts).map(([postID, post]) => {
        const renderedComments = post.comments.map(comment => {
            return <div key={comment.commentID}>
                    <li>{comment.comment}</li>
                   </div>
        });

        return <div className="card"
                style={{ width: '30%', marginBottom: '20px' }}
                key={postID}>
                    <div className="card-body">
                        <h3>{post.title}</h3>
                        {/* <CommentList postID={postID}/> */}
                        <div className="">
                            <i>{post.comments.length} comments</i>
                            <ul>
                                {renderedComments}
                            </ul>
                        </div>
                        <CommentCreate postID={postID}/>
                    </div>
                </div>
    });

    /*
    const renderedPosts = Object.keys(posts).map((key) => {
        return <div className="card"
                style={{ width: '30%', marginBottom: '20px' }}
                key={key}>
                    <div className="card-body">
                        <h3>{posts[key].title}</h3>
                        <CommentList postID={key}/>
                        <CommentCreate postID={key}/>
                    </div>
                </div>
    });
    */

    return (
        <div className="d-flex flex-row flex-wrap justify-content-between">
            {renderedPosts}
        </div>
    );
};