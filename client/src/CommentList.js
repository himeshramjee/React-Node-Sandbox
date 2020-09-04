import React, { useState, useEffect } from 'react';

export default ({ postComments }) => {
    const [comments, setComments] = useState([]);
    
    const loadData = () => { setComments(postComments) };

    useEffect(() => {
        loadData();
    }, []);

    const renderedComments = comments.map(comment => {
        return <div key={comment.commentID}>
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