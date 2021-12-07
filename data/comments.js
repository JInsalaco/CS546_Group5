const posts = require('./posts');
const users = require('./users');
const { comments } = require('../config/mongoCollections');
const utils = require('../utils');

async function createComment(posterId, body, postId) {
	const commentCollection = await comments();
	const newComment = {
		body,
		posterId,
		popularity: [],
		metaData: {
			timeStamp: new Date().getTime(),
			archived: false,
			flags: 0
		}
	};
	const insertInfo = await commentCollection.insertOne(newComment);
	if (insertInfo.insertedCount === 0) throw 'Could not add topic';

	// update the post
	const { update } = await posts.updateThread(postId, insertInfo.insertedId);
	if (!update) throw 'Can not update thread in post';

	return { update };
}

async function commentPopularity(commentId, userId, val) {
	const cid = utils.stringToObjectID(commentId);
	const commentCollection = await comments();
	const comment = commentCollection.findOne({ _id: cid });
	let popularityObj = comment.popularity;
	popularityObj[userId] = val;
	const updateInfo = commentCollection.updateOne({ _id: cid }, { $set: { popularity: popularityObj } });
	if (updateInfo.modifiedCount === 0) throw 'could not update popularity';
	const overallPopularity = popularityObj => Object.values(popularityObj).reduce((a, b) => a + b);
	return overallPopularity(popularityObj);
}

async function deleteComment(commentId) {
	const cid = utils.stringToObjectID(commentId);
	const commentCollection = await comments();
	const deletionInfo = commentCollection.deleteOne({ _id: cid });
	if (deletionInfo.deletedCount === 0) {
		throw `Could not delete topic`;
	}
	return { deleted: true };
}

async function getComments(postId, userId) {
	const { thread } = await posts.getPost(postId, false);
	const threadIds = thread.map(item => utils.stringToObjectID(item));
	const commentCollection = await comments();
	const commentsInPost = await commentCollection
		.find({ _id: { $in: threadIds } })
		.sort({ 'metaData.timeStamp': -1 })
		.toArray();

	const commentList = await handleComments(commentsInPost, userId);
	return commentList;
}

const handleComments = async (comments, userId) => {
	const res = [];
	for (let comment of comments) {
		comment = await getUserInfoToComment(comment, userId);
		res.push(comment);
	}

	return res;
};

const getUserInfoToComment = async (comment, userId) => {
	comment._id = utils.objectIdToString(comment._id);
	comment.timeStamp = comment.metaData.timeStamp;
	const poster = await users.getUser(comment.posterId);
	comment.poster = {};
	poster && ['firstname', 'lastname', 'username', 'profilePic'].forEach(item => (comment.poster[item] = poster[item]));
	userId && (comment.popularity = comment.popularity.includes(userId));
	delete comment.metaData;

	return comment;
};

const getAllComments = async (skip, count) => {
	const commentCollection = await comments();
	const commentList = await commentCollection
		.find({})
		.sort({ 'metaData.timeStamp': 1 })
		.skip(skip)
		.limit(count)
		.toArray();

	return utils.objectIdToString(commentList);
};

module.exports = {
	createComment,
	commentPopularity,
	deleteComment,
	getComments,
	getAllComments
};
