const { topics, users, posts } = require('../config/mongoCollections');
const { users: userData, topics: topicsData } = require('../data');
const bcrypt = require('bcrypt');
const saltRounds = 16;
const Mock = require('mockjs');

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
			threads: [],
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
	const USER = await userData.getAllUsers();
	const TOPICS = await topicsData.getAllTopics();

	const Random = Mock.Random;
	Random.extend({
		posterId(data) {
			const list = USER.map(item => item._id);
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
				'popularity|1-6': ['@POSTERID'],
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
};

module.exports = {
	loadDefaultUsers,
	loadDefaultTopics,
	loadDefaultPosts
};
