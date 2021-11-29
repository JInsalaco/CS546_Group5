const mongoCollections = require('../config/mongoCollections');
const utils = require('./utils');
const topics = mongoCollections.topics;

async function loadDefaultTopics(topicList) {
	const topicsCollection = await topics();

	const insertInfo = await topicsCollection.insertMany(topicList);
	if (insertInfo.insertedCount === 0) throw 'Could not add default topics';

	return;
}

async function addTopic(topic) {
	// error checking
	const topicsCollection = await topics();

	const insertInfo = await topicsCollection.insertOne(topic);
	if (insertInfo.insertedCount === 0) throw 'Could not add topic';

	return topic;
}

async function getTopic(id) {
	// Error Checking
	let oid = utils.stringToObjectID(id);
	const topicCollection = await topics();
	const topic = topicCollection.findOne({ _id: oid });
	if (topic === null) throw 'Topic does not exist';
	utils.objectIdToString(id);

	return topic;
}

async function getAllTopics() {
	const topicCollection = await topics();
	const topicList = await topicCollection.find({}).toArray();

	return topicList.map(item => {
		item._id = utils.objectIdToString(item._id);
		return item;
	});
}

async function deleteTopic(id) {
	let oid = utils.stringToObjectID(id);
	const topicCollection = await topics();
	let topic = await this.getTopic(id);

	if (!topic) throw 'Post not found';

	const deletionInfo = await topicCollection.deleteOne({ _id: oid });

	if (deletionInfo.deletedCount === 0) {
		throw `Could not delete topic`;
	}
	return { deleted: true };
}

module.exports = {
	addTopic,
	loadDefaultTopics,
	getTopic,
	getAllTopics,
	deleteTopic
};
