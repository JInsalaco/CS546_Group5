const mongoCollections = require('../config/mongoCollections');
const utils = require('./utils');
const topics = mongoCollections.topics;
const { ObjectId } = require('mongodb');

async function addTopic(title, description) {
	errorChecking(title, description);
	const topicsCollection = await topics();

	const topic = {
		title: title,
		description: description
	};

	const insertInfo = await topicsCollection.insertOne(topic);
	if (insertInfo.insertedCount === 0) throw 'Could not add topic';

	return topic;
}

async function getTopic(id) {
	if (!ObjectId.isValid(id)) throw 'Not a valid id';

	const topicCollection = await topics();
	const topic = await topicCollection.findOne({ _id: id });
	// if (topic === null) throw 'Topic does not exist';

	return topic;
}

async function getAllTopics() {
	const topicCollection = await topics();
	const topicList = await topicCollection.find({}).toArray();
	return utils.objectIdToString(topicList);
}

async function getTopicTitles(topic) {
	const topicCollection = await topics();
	const topicList = await topicCollection.find({
		_id: { $in: [ObjectId('61a6d9c7107d395d50b15be5'), ObjectId('61a6d9c7107d395d50b15be6')] }
	});
	return utils.objectIdToString(topicList);
}
async function getTopicbyId(id) {
	const topicCollection = await topics();
	let oid = ObjectId(id);
	const topic = await topicCollection.findOne({ _id: oid });
	return topic.title;
}
async function deleteTopic(id) {
	if (!ObjectId.isValid(id)) throw 'Not a valid id';

	const topicCollection = await topics();
	let topic = await this.getTopic(id);

	if (!topic) throw 'Post not found';

	const deletionInfo = await topicCollection.deleteOne({ _id: id });

	if (deletionInfo.deletedCount === 0) {
		throw `Could not delete topic`;
	}
	return { deleted: true };
}

function errorChecking(topic, description) {
	if (!topic) throw 'No topic provided';
	if (!description) throw 'No description provided';

	if (typeof topic !== 'string') throw 'Topic is not a string';
	else if (topic.trim() === '') throw 'Topic is empty string';
	if (typeof description !== 'string') throw 'Description is not a string';
	else if (description.trim() === '') throw 'Description is empty string';

	if (description.length > 150) throw 'Maximum characters exceeded';

	return;
}

module.exports = {
	addTopic,
	getTopic,
	getAllTopics,
	getTopicTitles,
	deleteTopic,
	getTopicbyId
};
