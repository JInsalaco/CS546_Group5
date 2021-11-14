const { reactive } = Vue;

class Comment {
	constructor(obj = {}) {
		const { body, posterId, threads, popularity, metaData } = obj;
		this.body = body ?? '';
		this.posterId = posterId ?? '';
		this.threads = threads ?? [];
		this.popularity = popularity ?? {};
		this.metaData = metaData ?? { timeStamp: new Date().getTime(), archived: false, flags: 0 };
	}
}

Vue.createApp({
	setup() {
		const comment = reactive(new Comment());
		const handleSubmitComment = () => {}; // TODO: the submition of comment

		return {
			comment,
			handleSubmitComment
		};
	}
})
	.use(ElementPlus)
	.mount('#app');
