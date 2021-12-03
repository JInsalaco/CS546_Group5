const dbConnection = require('../config/mongoConnection');
const topicsList = require('./topics.json');
const userList = require('./users.json');
const { loadDefaultTopics, loadDefaultUsers, loadDefaultPosts } = require('./func');

async function main() {
	const db = await dbConnection();
	await db.dropDatabase();

	// try {
	// 	const topic = utils.stringToObjectID(['61a6d9c7107d395d50b15be6', '61a6d9c7107d395d50b15be7']);
	// 	const result = await topics.getTopicTitles(topic);
	// 	console.log(result);
	// } catch (error) {
	// 	console.log(error);
	// }

	/**
	 * add users to DB
	 */
	await loadDefaultUsers(userList);

	/**
	 * add topics to DB and get the topics from DB (with id)
	 */
	await loadDefaultTopics(topicsList);

	// add post to DB
	await loadDefaultPosts();

	console.log('Done seeding database');

	await db.s.client.close();
}

main().catch(console.log);
