const mongoCollections = require('../config/mongoCollections');
const utils = require('../utils');
const userData = require('./users');
const topicData = require('./topics');
const posts = mongoCollections.posts;
const { ObjectId } = require('mongodb');

async function updatePopularity(postId, userId) {
	const pid = utils.stringToObjectID(postId);
	const postCollection = await posts();
	const { popularity } = await postCollection.findOne({ _id: pid });

	let likeStatus;
	if (popularity.includes(userId)) {
		const index = popularity.findIndex(item => item === userId);
		popularity.splice(1, index);
		likeStatus = false;
	} else {
		popularity.push(userId);
		likeStatus = true;
	}

	const updateInfo = await postCollection.updateOne({ _id: pid }, { $set: { popularity } });
	if (updateInfo.modifiedCount === 0) throw 'Could not update popularity';

	return likeStatus;
}

async function getMyPosts(id) {
	//get myposts using req.session.userid as posterID
	if (!id) throw 'No Permissipn, please sign in';

	const postCollection = await posts();
	let postList = await postCollection.find({ posterId: id }, { projection: { _id: 1, title: 1 } }).toArray();

	const res = postList.map(item => {
		const { _id, title } = item;
		return { _id: utils.objectIdToString(_id), title };
	});
	return utils.objectIdToString(res);
}

// Add a post to the Pond
async function getPostsByTitle(title) {
	const postCollection = await posts();
	let postList = await postCollection.find({ title: RegExp(title) }).toArray();
	postList = await handlePost(postList);
	return postList.map(item => ({ _id: item._id, title: item.title }));
}

const getPosts = async ({ topicId, pageSize, pageNumber }, userid) => {
	utils.errorCheckingId(topicId);
	if (isNaN(+pageSize) || isNaN(+pageNumber)) throw 'pageSize or pageNumber invalid';

	const postCollection = await posts();
	let postList = await postCollection
		.find({ topics: { $elemMatch: { $eq: topicId } } })
		.sort({ 'metaData.timeStamp': -1 })
		.skip(+pageNumber - 1)
		.limit(+pageSize)
		.toArray();

	postList = await handlePost(postList, userid);
	return postList;
};

const handlePost = async (inputPost, userid) => {
	let res;
	if (Array.isArray(inputPost)) {
		res = [];
		for (let post of inputPost) {
			post = await getUserInfoToPost(post, userid);
			res.push(post);
		}
	} else {
		res = await getUserInfoToPost(inputPost);
	}

	return res;
};

const getUserInfoToPost = async (post, userid) => {
	post.timeStamp = post.metaData.timeStamp;
	const poster = await userData.getUser(post.posterId);
	poster && ['firstname', 'lastname', 'username', 'profilePic'].forEach(item => (post[item] = poster[item]));
	userid && (post.popularity = post.popularity.includes(userid));
	delete post.thread;
	delete post.posterId;
	delete post.metaData;

	return post;
};

async function addPost(posterId, title, body, topics) {
	errorCheckingPost(title, body);

	// Check for user
	const sid = utils.objectIdToString(posterId);
	const user = await userData.getUser(sid);

	// Check for topic
	let allTopicsNames = await topicData.getAllTopicNames();
	
	topics.forEach((topic) => {
		if (!allTopicsNames.includes(topic)) throw "Topic not found";
	})

	// New Post
	const postCollection = await posts();
	const post = {
		title,
		body,
		posterId: sid,
		topics,
		thread: [],
		popularity: [],
		metaData: {
			timeStamp: new Date().getTime(),
			archived: false,
			flags: 0
		}
	};

	// Check that post was inserted
	const newPostInfo = await postCollection.insertOne(post);
	if (newPostInfo.insertedCount === 0) throw 'Insert failed!';

	let postId = utils.objectIdToString(post._id);
	user.posts.push(postId);

	const userWithPost = await userData.updateUser(user, sid);
	if (!userWithPost) throw 'Post not created for user';

	return post;
}

async function getPost(id, needHandle = true) {
	// Get the id as an ObjectId, will return if valid
	let oid = utils.stringToObjectID(id);

	// Look for post in the database
	const postCollection = await posts();
	let post = await postCollection.findOne({ _id: oid });

	// Check if the post was found
	if (post === null) throw 'Post not found';
	needHandle && (post = await handlePost(post));

	return post;
}

async function getPostInternal(id) {
	// Get the id as an ObjectId, will return if valid
	let oid = utils.stringToObjectID(id);

	// Look for post in the database
	const postCollection = await posts();
	let post = await postCollection.findOne({ _id: oid });

	// Check if the post was found
	if (post === null) throw 'Post not found';

	return post;
}

async function deletePost(id) {
	// Check that post exist
	const sid = utils.objectIdToString(id);
	const postCollection = await posts();
	let post = await this.getPost(sid);

	if (!post) throw 'Post not found';

	// Delete
	const deletionInfo = await postCollection.deleteOne({ _id: utils.stringToObjectID(id) });

	// Check deletion worked
	if (deletionInfo.deletedCount === 0) {
		throw `Could not delete post`;
	}
	return { deleted: true };
}

async function editPost(posterId, postId, title, body, topics) {
	errorCheckingPost(title, body);
	const topicInput = topics;
	// Check for user
	const sidUser = utils.objectIdToString(posterId);
	const user = await userData.getUser(sidUser);

	// Check if post exist
	const sidPost = utils.objectIdToString(postId);
	const post = await this.getPostInternal(sidPost);

	// Check for topic
	let allTopicsNames = await topicData.getAllTopicNames();
	
	topics.forEach((topic) => {
		if (!allTopicsNames.includes(topic)) throw "Topic not found";
	})

	// Get the old post and make the edited Post
	// Add the lastEdit field in metaData to
	// show post was modified and when
	const newPost = {
		title: post.title,
		body: body,
		posterId: user._id,
		topics: topics,
		thread: post.thread,
		popularity: post.popularity,
		metaData: {
			timeStamp: post.metaData.timeStamp,
			lastEdit: new Date().getTime(),
			archived: post.metaData.archived,
			flags: post.metaData.flags
		}
	};

	// Check that the content of the posts are not the same
	let equalPost = editComparison(post.body, body, post.topics, topicInput);
	if (!equalPost) throw 'No changes made to the post';

	// Update the pre-existing post
	if (!ObjectId.isValid(postId)) throw 'Id is not a valid ObjectID';
	const postCollection = await posts();
	const updateInfo = await postCollection.updateOne({ _id: postId }, { $set: newPost });

	// Ensure the update was successful
	if (!updateInfo.matchedCount && !updateInfo.modifiedCount) throw 'Update failed';

	return { updated: true };
}

const getMultiplePosts = async ids => {
	for (let id of ids) {
		utils.errorCheckingId(id);
	}

	ids = ids.map(item => utils.stringToObjectID(item));
	const postCollection = await posts();
	let postList = await postCollection.find({ _id: { $in: ids } }).toArray();

	postList = await handlePost(postList);
	const res = postList.map(item => {
		const { _id, profilePic, username, firstname, lastname, timeStamp, title } = item;
		return { _id, profilePic, username, firstname, lastname, timeStamp, title };
	});
	return utils.objectIdToString(res);
};

function errorCheckingPost(title, body) {
	// Input not provided
	if (!title) throw 'No title provided';
	if (!body) throw 'No post content provided';

	// Input not of type string or empty
	if (typeof title !== 'string') throw 'Title is not a string';
	else if (title.trim() === '') throw 'Title is an empty string';

	if (typeof body !== 'string') throw 'Body is not a string';
	else if (body.trim() === '') throw 'Body is an empty string';

	// Max character 3000
	if (body.length > 3000) throw 'Maximum characters reached';

	return;
}

function editComparison(oldBody, newBody, oldTopics, newTopics) {
	oldTopics.sort();
	newTopics.sort();

	if (oldBody === newBody) {
		for (let i = 0; i < oldTopics.length; i++) {
			if (oldTopics[i] !== newTopics[i]) {
				return false;
			}
		}
	}
	return true;
}

const getAllPosts = async () => {
	const postCollection = await posts();
	const postList = await postCollection.find({}).toArray();

	return utils.objectIdToString(postList);
};

async function getPostPopularity(id) {
	const sid = utils.objectIdToString(id);
	let post = await this.getPost(sid);

	if (!post) throw 'Post not found';
	let popularityCount = post.popularity;
	return popularityCount.length;
}

const updateThread = async (postId, threadId) => {
	const { thread } = getPost(postId, false);
	thread.push(utils.objectIdToString(threadId));
	const updateInfo = postCollection.updateOne({ _id: postId }, { $set: { thread } });
	if (updateInfo.modifiedCount === 0) throw 'Could not update popularity';

	return { update: true };
};

const getMyLike = async userId => {
	utils.errorCheckingId(userId);

	const postCollection = await posts();
	const postList = await postCollection.find({ popularity: { $elemMatch: { $eq: userId } } }).toArray();
	const likeList = await handlePost(postList, userId);

	return utils.objectIdToString(likeList);
};

module.exports = {
	addPost,
	getPost,
	deletePost,
	editPost,
	updatePopularity,
	errorCheckingPost,
	editComparison,
	getPostsByTitle,
	getPosts,
	getAllPosts,
	getMyPosts,
	getMultiplePosts,
	getPostPopularity,
	updateThread,
	getPostInternal,
	getMyLike
};
