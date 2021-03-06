import React, { useState } from 'react';
import axios from 'axios';

export default ({ postID }) => {
    const [comment, setComment] = useState('');

    const onSubmit = async (event) => {
        event.preventDefault();

        await axios.post(`http://posts.com/posts/${postID}/comments`, {
            comment
        })
        .catch(error => {
            console.log("Failed to create comment. Error: " + error);
            console.log(error);
        });

        setComment('');
    };

    return (
        <div>
            <form onSubmit={onSubmit}>
                <div className="form-group">
                    <label>Leave a comment</label>
                    <input 
                        value={comment} 
                        onChange={e => setComment(e.target.value)}
                        className="form-control"/>
                </div>
                <button className="btn btn-primary">Submit</button>
            </form>
        </div>
    );
};