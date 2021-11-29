const mongoCollections = require('../config/mongoCollections');
const utils = require('./utils');
const topics = mongoCollections.topics;

async function loadDefaultTopics () {
    const topicsCollection = await topics();
    const topicList = [
        {
            title: "School Life",
            description: "Students express how they feel being a college student at Stevens"
        },
        {
            title: "Courses",
            description: "Posts based on different courses"
        },
        {
            title: "Events",
            description: "Posts based on different events held by Stevens"
        },
        {
            title: "Activities",
            description: "Posts based on activites set up by the Stevens Community"
        },
        {
            title: "Announcement",
            description: "Posts based on important announcements made the university"
        },
        {
            title: "Social",
            description: "Posts for Stevens students to interact with one another"
        },
        {
            title: "Career",
            description: "Posts based on career development"
        }
    ];

    const insertInfo = await topicsCollection.insertMany(topicList);
    if (insertInfo.insertedCount === 0) throw "Could not add default topics";

    return;
}

async function addTopic(title, description) {
    // error checking
    const topicsCollection = await topics();

    let topic = {
        title: title,
        description: description
    };

    const insertInfo = await topicsCollection.insertOne(topic);
    if (insertInfo.insertedCount === 0) throw "Could not add topic";

    return topic;
}

async function getTopic(id) {
    // Error Checking
    let oid = utils.stringToObjectID(id);
    const topicCollection = await topics();
    const topic = topicCollection.findOne({ _id: oid });
    if (topic === null) throw "Topic does not exist";
    utils.objectIdToString(id);

    return topic;
}

async function getAllTopicTitles() {
    const topicCollection = await topics();
    const topicList = await topicCollection.find({}, {
		projection: {
			_id: 0, 
			title: 1
		}}).toArray();
    
    return topicList;
}

async function deleteTopic(id) {
	let oid = utils.stringToObjectID(id);
	const topicCollection = await topics();
	let topic = await this.getTopic(id);

	if (!topic) throw "Post not found";

	const deletionInfo = await topicCollection.deleteOne({ _id: oid });

	if (deletionInfo.deletedCount === 0) { throw `Could not delete topic`; }
    return { deleted: true };
}

module.exports = {
    addTopic,
    loadDefaultTopics,
    getTopic,
    getAllTopicTitles,
    deleteTopic
}