const dbConnection = require('../config/mongoConnection');
const topicsList = require('./topics.json');
const userList = require('./users.json');
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

	console.log('Done seeding database');
	await db.s.client.close();
}

main().catch(console.log);
