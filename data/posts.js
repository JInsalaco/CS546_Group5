const { posts } = require('../config/mongoCollections');
const Post = require('../utils/collections/Post');

module.exports = {
	async addPost(obj) {
		const postCollection = await posts();
		const newPostInfo = await postCollection.insertOne(new Post(obj));
		if (newPostInfo.insertedCount === 0) throw 'Insert failed!';
		return 'Inserted successfully!';
	}
};
