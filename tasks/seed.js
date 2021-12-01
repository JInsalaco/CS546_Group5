const dbConnection = require('../config/mongoConnection');
const { users, posts, topics } = require('../data/');
const topicsList = require('./topics.json');
const userList = require('./users.json');
const utils = require('../data/utils');

async function main() {
	const db = await dbConnection();
	await db.dropDatabase();

	// // Load Default Topics
	// try {
	// 	await topics.loadDefaultTopics(topicsList);
	// } catch (e) {
	// 	console.log(e);
	// }

	// // Add user 1
	// try {
	// 	const user = await users.addUser('jdiaz6@stevens.edu', 'Baseball123', 'Javier', 'Diaz', '(201)790-0190');
	// 	const post1 = await posts.addPost(user._id, 'My First Post', 'This pond application is amazing');
	// 	const post2 = await posts.addPost(user._id, 'My Second Post', 'I have a topic', ['School Life']);
	// 	const newUser = await users.editUser(
	// 		user._id,
	// 		'jdiaz6@stevens.edu',
	// 		'Baseball123',
	// 		'Javier',
	// 		'Diaz',
	// 		'(201)790-0190',
	// 		'Male',
	// 		'08/27/2000',
	// 		'javierdiaz13',
	// 		'I love empanadas'
	// 	);
	// 	const deletedPost = await posts.deletePost(post1._id);
	// 	const editedPost = await posts.editPost(user._id, post2._id, post2.title, 'New body', ['Courses']);
	// } catch (e) {
	// 	console.log(e);
	// }

	// // Add the rest users from users.json
	// try {
	// 	for (const item of userList) {
	// 		const { email, password, firstname, lastname, phoneNumber } = item;
	// 		await users.addUser(email, password, firstname, lastname, phoneNumber);
	// 	}
	// } catch (error) {
	// 	console.log(error);
	// }

	// try {
	// 	const allUsers = await users.getAllUsers();
	// 	console.log(allUsers)
	// } catch (e) {
	// 	console.log(e);
	// }

	// try {
	// 	const topic = await topics.addTopic("Greek Life", "Posts related to anything greek life");
	// 	const retrieve = await topics.getTopic(topic._id);
	// 	const allTopic = await topics.getAllTopics();
	// 	const allTopicTitles = await topics.getAllTopicTitles();
	// 	const deleteTopic = await topics.deleteTopic(topic._id);
	// } catch(e) {
	// 	console.log(e);
	// }

	try {
		const topic = utils.stringToObjectID(["61a6d9c7107d395d50b15be6", "61a6d9c7107d395d50b15be7"]);
		const result = await topics.getTopicTitles(topic);
		console.log(result);
	} catch(e) {
		console.log(e);
	}

	console.log('Done seeding database');

	await db.s.client.close();
}

main().catch(console.log);