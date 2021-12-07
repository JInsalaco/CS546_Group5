const posts = require('./posts');
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

async function getCommentById(id) {
	const commentCollection = await comments();
	const comment = commentCollection.findOne({ _id: id });
	if (comment) return comment;
	else return false;
}

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
	getCommentById,
	getAllComments
};
