const { ref, reactive, toRefs } = Vue;

const composition = {
	setup() {
		const showFriendsList = ref(true);
		const showDialog = reactive({
			showPostDialog: false,
			showTagDialog: false
		});
		const form = reactive(new Posts());
		const content = ref('');

		const handleInputBody = value => {
			content.value = value
				.split('\n')
				.map(item => `<p>${item}</p>`)
				.join('');
		};
		const topics = ['Public Finance', 'Accouting', 'Corporate', 'Controlling', 'Aquisition', 'Science', 'School']; // CLEAR
		const currentTopic = ref(topics[0]);

		const topicsNum = ref(5); // CLEAR
		const loadMorePost = () => {
			topicsNum.value += 2;
			console.log(1111);
		};

		return {
			showFriendsList,
			...toRefs(showDialog),
			form,
			handleInputBody,
			content,
			time: getTime(),
			topics,
			currentTopic,
			topicsNum,
			loadMorePost
		};
	}
};

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

Vue.createApp(composition).use(ElementPlus).mount('#app');
