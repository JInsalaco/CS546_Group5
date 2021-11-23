const { ref, reactive, toRefs, computed, nextTick, onMounted } = Vue;
const { ElNotification } = ElementPlus;

const composition = {
	setup() {
		const userAuth = reactive({
			auth: false,
			userInfo: null
		});
		const showFriendsList = ref(true);
		const showDialog = reactive({
			showPostDialog: false,
			showTagDialog: false
		});
		const postsForm = ref();
		const postForm = reactive(new Posts({ title: 'This is a demo', topics: ['School'], body: 'demo demo demo' })); // CLEAR

		const article = computed(() =>
			postForm.body
				.split('\n')
				.map(item => `<p>${item}</p>`)
				.join('')
		);

		const topics = ['Public Finance', 'Accouting', 'Corporate', 'Controlling', 'Aquisition', 'Science', 'School']; // CLEAR
		const currentTopic = ref(topics[0]);

		const topicsNum = ref(5); // CLEAR
		const loadMorePost = () => {
			topicsNum.value += 2;
		};

		onMounted(() => {
			const USER_INFO = sessionStorage.getItem('USER_INFO');
			if (USER_INFO) {
				userAuth.auth = true;
				userAuth.userInfo = JSON.parse(USER_INFO);
			}
		});
		const displayName = computed(() => {
			return (
				userAuth.userInfo?.username || `${userAuth.userInfo?.firstname || '--'} ${userAuth.userInfo?.lastname || '--'}`
			);
		});

		/**
		 * add the new post
		 */
		const handlePublish = () => {
			postsForm.value.validate(valid => {
				if (valid) {
					http.post('/posts/add', postForm).then(msg => {
						ElNotification({ title: 'Success', message: msg, type: 'success' });
						postsForm.value.resetFields();
						showDialog.showPostDialog = false;
					});
				} else {
					return false;
				}
			});
		};

		return {
			...toRefs(userAuth),
			showFriendsList,
			...toRefs(showDialog),
			postsForm,
			postForm,
			article,
			time: getTime(),
			topics,
			currentTopic,
			topicsNum,
			loadMorePost,
			handlePublish,
			displayName
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
