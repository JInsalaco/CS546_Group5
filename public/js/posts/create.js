const { ref, reactive } = Vue;

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

const getTime = () => {
	const date = new Date();
	const year = date.getFullYear();
	const month = date.getMonth() + 1;
	const day = date.getDate();
	return `${year}-${month < 10 ? `0${month}` : month}-${day < 10 ? `0${day}` : day}`;
};

Vue.createApp({
	setup() {
		const form = reactive(new Posts());
		const content = ref('');

		const handleInputBody = value => {
			content.value = value
				.split('\n')
				.map(item => `<p>${item}</p>`)
				.join('');
		};
		return {
			form,
			handleInputBody,
			content,
			time: getTime()
		};
	}
})
	.use(ElementPlus)
	.mount('#post-create');
