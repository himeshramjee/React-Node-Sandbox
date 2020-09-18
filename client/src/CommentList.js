import React, { useState, useEffect } from 'react';

export default ({ postComments }) => {
    const [commentItems, setComments] = useState([]);
    const loadData = () => { setComments(postComments) };
    useEffect(loadData, []);

    const renderedComments = commentItems.map(commentItem => {
        if (commentItem.status === "Approved") {
            return <div key={commentItem.commentID}>
                <li title={"by Anonymous"}>{commentItem.comment}</li>
               </div>    
        } else {
            return <div key={commentItem.commentID}>
                    <li>{commentItem.status}: {commentItem.statusReason}</li>
                </div>
        }
    });

    return (
        <div className="">
            <i>{commentItems.length} comments</i>
            <ul>
                {renderedComments}
            </ul>
        </div>
    );
};