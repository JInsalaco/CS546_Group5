const { comments } = require('../config/mongoCollections');
const utils = require('./utils');

async function createComment(body,posterId,thread){
    const commentCollection = await comments();
    const d = new Date();
    const newComment = {
        body: body,
        posterId: posterId,
        thread: thread,
        popularity: {},
        metaData: {
            timeStamp: d,
            archived: false,
            flags: 0
        }
    }
    const insertInfo = await commentCollection.insertOne(newComment);
    if (insertInfo.insertedCount === 0) throw "Error: Could not add topic";

    return insertInfo;
}
async function commentPopularity(commentId,userId,val){
    const cid = utils.stringToObjectID(commentId);
    const commentCollection = await comments();
    const comment = commentCollection.findOne({_id: cid})
    let popularityObj = comment.popularity;
    popularityObj[userId] = val;
    const updateInfo = commentCollection.updateOne({_id:cid},
        {$set: 
            {popularity: popularityObj}
        });
    if(updateInfo.modifiedCount === 0) throw "Error: could not update popularity";
    const overallPopularity = popularityObj => Object.values(popularityObj).reduce((a, b) => a + b);
    return overallPopularity(popularityObj);
}

async function deleteComment(commentId){
    const cid = utils.stringToObjectID(commentId);
    const commentCollection = await comments();
    const deletionInfo = commentCollection.deleteOne({_id: cid});
    if (deletionInfo.deletedCount === 0) { throw `Could not delete topic`; }
    return { deleted: true };
}

module.exports = {
    createComment,
    commentPopularity,
    deleteComment
}