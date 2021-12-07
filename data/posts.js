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
	if (updateInfo.modifiedCount === 0) throw 'Error: could not update popularity';

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
	if (utils.errorCheckingId(topicId)) throw 'topicId invalid';
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
			post = await getUserInfoToPost(post);
			userid && (post.popularity = post.popularity.includes(userid));
			res.push(post);
		}
	} else {
		res = await getUserInfoToPost(inputPost);
	}

	return res;
};

const getUserInfoToPost = async post => {
	post.timeStamp = post.metaData.timeStamp;
	const poster = await userData.getUser(post.posterId);
	poster && ['firstname', 'lastname', 'username', 'profilePic'].forEach(item => (post[item] = poster[item]));
	delete post.thread;
	delete post.posterId;
	delete post.metaData;

	return post;
};

async function addPost(posterId, title, body, topics) {
	errorCheckingPost(title, body, topics);

	// Check for user
	const sid = utils.objectIdToString(posterId);
	const user = await userData.getUser(sid);

	// Check for topic
	const allTopics = await topicData.getAllTopics();
	const allTopicsIds = allTopics.map(item => item._id);
	for (let topicId of topics) {
		if (!allTopicsIds.includes(topicId)) throw 'Topic does not exist';
	}

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

// Trying to make git work

async function getPost(id) {
	// Get the id as an ObjectId, will return if valid
	let oid = utils.stringToObjectID(id);

	// Look for post in the database
	const postCollection = await posts();
	let post = await postCollection.findOne({ _id: oid });

	// Check if the post was found
	if (post === null) throw 'Post not found';
	post = await handlePost(post);

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
	//if (user === null) throw 'User does not exist';

	// Check if post exist
	const sidPost = utils.objectIdToString(postId);
	const post = await this.getPost(sidPost);
	//if (post === null) throw 'Post does not exist';

	// Check for topic
	if (topics) {
		if (topics.length > 0 && topics.length < 4) {
			const topicListDB = await topicData.getAllTopics();
			// Iterate and check that each topic is valid
			for (let i = 0; i < topics.length; topics++) {
				let userTopic = topics[i];
				let topicFlag = true;
				for (let j = 0; j < topicListDB.length && topicFlag; j++) {
					if (topicListDB[j].title === userTopic) {
						topicFlag = false;
					}
				}
				if (topicFlag) {
					throw 'Topic does not exist';
				}
			}
		}
	}

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
		if (utils.errorCheckingId(id)) throw 'Invalid Id';
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

function errorCheckingPost(title, body, topics) {
	// Input not provided
	if (!title) throw 'No title provided';
	if (!body) throw 'No post content provided';
	if (!topics) throw 'No topics provided';

	// Input not of type string or empty
	if (typeof title !== 'string') throw 'Title is not a string';
	else if (title.trim() === '') throw 'Title is an empty string';

	if (typeof body !== 'string') throw 'Body is not a string';
	else if (body.trim() === '') throw 'Body is an empty string';

	// Max character 3000
	if (body.length > 3000) throw 'Maximum characters reached';

	if (!Array.isArray(topics)) throw 'Topics should be an array';
	if (topics.length < 1 || topics.length > 3) throw 'Topics should be at least 1 and at most 3';
	for (let topicId of topics) {
		if (utils.errorCheckingId(topicId)) throw 'Invalid topic id';
	}
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
	getPostPopularity
};
