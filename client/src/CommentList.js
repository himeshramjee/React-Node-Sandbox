import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default ({ postID }) => {
    const [comments, setComments] = useState([]);

    const fetchComments = async () => {
        const response = await axios.get(`http://localhost:4001/posts/${postID}/comments`);
        setComments(response.data);
    };

    useEffect(() => {
        fetchComments();
    }, []);

    const renderedComments = comments.map(comment => {
        return <div key={comment.id}>
                <li>{comment.comment}</li>
               </div>
    });

    return (
        <div className="">
            <i>{comments.length} comments</i>
            <ul>
                {renderedComments}
            </ul>
        </div>
    );
};