class Posts {
	constructor(obj = {}) {
		const { title, body, posterId, topics, thread, popularity, metaData } = obj;
		this.title = title ?? '';
		this.body = body ?? '';
		this.posterId = posterId ?? '';
		this.topics = topics ?? [];
		this.thread = thread ?? [];
		this.popularity = popularity ?? {};
		this.metaData = metaData ?? { timeStamp: new Date().getTime(), archived: false, flags: 0 };
	}
}

module.exports = Posts;
