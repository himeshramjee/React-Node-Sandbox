import React from 'react';
import PostCreate from './PostCreate'
import PostList from './PostList'
import AdminActions from './AdminActions'

export default () => {
    return <div className="container">
        <h1>Admin actions</h1>
        <AdminActions/>
        <hr/>
        <h1>Create Post</h1>
        <PostCreate/>
        <hr/>
        <h1>Post List</h1>
        <PostList/>
    </div>
};