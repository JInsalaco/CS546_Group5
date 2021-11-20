const { posts } = require('../config/mongoCollections');

module.exports = {
	async addPost(title, body, topics) {
		const postCollection = await posts();
		const post = {
			title,
			body,
			posterId: '', // TODO: add poster id
			topics,
			thread: [],
			popularity: {},
			metaData: { timeStamp: new Date().getTime(), archived: false, flags: 0 }
		};
		const newPostInfo = await postCollection.insertOne(post);
		if (newPostInfo.insertedCount === 0) throw 'Insert failed!';
		return 'Inserted successfully!';
	}
};
