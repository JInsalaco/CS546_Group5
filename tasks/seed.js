const dbConnection = require('../config/mongoConnection');
const topicsList = require('./topics.json');
const userList = require('./users.json');
const userData = require('../data/users');
const postData = require('../data/posts');
const { loadDefaultTopics, loadDefaultUsers, loadDefaultPosts, loadDefaultComments } = require('./func');

async function main() {
	const db = await dbConnection();
	await db.dropDatabase();

	/**
	 * add users to DB
	 */
	await loadDefaultUsers(userList);

	/**
	 * add topics to DB
	 */
	await loadDefaultTopics(topicsList);

	/**
	 * add post to DB
	 */
	await loadDefaultPosts();

	/**
	 * add comment to DB
	 */
	await loadDefaultComments();

	// const user = await userData.addUser("test123@stevens.edu", "UArocks101", "Test", "Test", "(201)020-0001")
	// const post = await postData.addPost(user._id, "New Post", "Javi is here", ['Courses']);
	// const epost = await postData.editPost(user._id, post._id, "Upadted Post", "Javi is now gone", ['School Life', 'Events', 'Activities]);
	// console.log(epost);

	console.log('Done seeding database');
	await db.s.client.close();
}

main().catch(console.log);
