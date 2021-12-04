const { topics, users, posts, comments } = require('../config/mongoCollections');
const { users: usersData, topics: topicsData, posts: postsData, comments: commentsData } = require('../data');
const bcrypt = require('bcrypt');
const saltRounds = 16;
const Mock = require('mockjs');
const { toObjectId } = require('../utils/utils');

const getAllUsers = async () => await usersData.getAllUsers();
const getAllTopics = async () => await topicsData.getAllTopics();
const getAllPosts = async () => await postsData.getAllPosts();

const loadDefaultUsers = async userList => {
	const userCollection = await users();

	let _userList = [];
	for (let item of userList) {
		const hashedPwd = await bcrypt.hash(item.password, saltRounds);
		delete item.password;

		_userList.push({
			hashedPwd,
			gender: '',
			DOB: '',
			username: '',
			bio: '',
			profilePic: '/public/img/default.png',
			posts: [],
			thread: [],
			friends: [],
			anonymous: false,
			...item
		});
	}
	const insertInfo = await userCollection.insertMany(_userList);
	if (insertInfo.insertedCount === 0) throw 'Could not add default users';
};

const loadDefaultTopics = async topicList => {
	const topicsCollection = await topics();

	const insertInfo = await topicsCollection.insertMany(topicList);
	if (insertInfo.insertedCount === 0) throw 'Could not add default topics';
};

const loadDefaultPosts = async () => {
	// get all uesers and topics from DB
	const USERS = await getAllUsers();
	const TOPICS = await getAllTopics();

	const Random = Mock.Random;
	Random.extend({
		posterId(data) {
			const list = USERS.map(item => item._id);
			return this.pick(list);
		},
		topicId(data) {
			const list = TOPICS.map(item => item._id);
			return this.pick(list);
		}
	});

	let postList = [];
	for (let i = 0; i < 20; i++) {
		postList.push(
			Mock.mock({
				title: '@title',
				body: '@paragraph',
				posterId: '@POSTERID',
				'topics|1-3': ['@TOPICID'],
				thread: [],
				'popularity|0-6': ['@POSTERID'],
				metaData: {
					timeStamp: new Date().getTime(),
					archived: false,
					flag: 0
				}
			})
		);
	}

	const postCollection = await posts();
	const insertInfo = await postCollection.insertMany(postList);
	if (insertInfo.insertedCount === 0) throw 'Could not add default posts';

	// update the user
	const POSTS = await getAllPosts();
	const userCollection = await users();
	for (let post of POSTS) {
		const posterId = post.posterId;
		const { posts } = await usersData.getUser(posterId);
		posts.push(post._id);

		await userCollection.updateOne({ _id: toObjectId(posterId) }, { $set: { posts } });
	}
};

const loadDefaultComments = async () => {
	const USERS = await getAllUsers();
	const POSTS = await getAllPosts();

	const Random = Mock.Random;
	Random.extend({
		posterId(data) {
			const list = USERS.map(item => item._id);
			return this.pick(list);
		}
	});

	let lastCount = 0;
	const commentCollection = await comments();
	const postCollection = await posts();
	const userCollection = await users();
	for (let post of POSTS) {
		const commentCount = ~~(Math.random() * 9) + 1;
		let commentList = [];
		for (let i = 0; i < commentCount; i++) {
			commentList.push(
				Mock.mock({
					body: '@sentence',
					posterId: '@POSTERID',
					'popularity|0-6': ['@POSTERID'],
					metaData: {
						timeStamp: new Date().getTime(),
						archived: false,
						flag: 0
					}
				})
			);
		}

		const insertInfo = await commentCollection.insertMany(commentList);
		if (insertInfo.insertedCount === 0) throw 'Could not add default comments';

		// get all comments and update the user and post
		const COMMENTS = await commentsData.getAllComments(lastCount, commentCount);
		lastCount += commentCount;
		const thread = COMMENTS.map(item => item._id);
		// update the post
		await postCollection.updateOne({ _id: toObjectId(post._id) }, { $set: { thread } });
		// update the user
		for (let comment of COMMENTS) {
			const { thread: threads } = await usersData.getUser(comment.posterId);
			threads.push(comment._id);

			await userCollection.updateOne({ _id: toObjectId(comment.posterId) }, { $set: { thread: threads } });
		}
	}
};

module.exports = {
	loadDefaultUsers,
	loadDefaultTopics,
	loadDefaultPosts,
	loadDefaultComments
};
