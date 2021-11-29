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

		// Create Post
		const postsForm = ref();
		const postForm = ref(null);
		const createTime = ref(null);
		const selectedTopics = computed(() => TOPICS.filter(item => postForm.value.topics.includes(item.name)));
		const openPostDialog = () => {
			postForm.value = new Posts();
			createTime.value = dayjs().format('MM/DD/YYYY');
		};
		const handlePublish = () => {
			postsForm.value.validate(valid => {
				if (valid) {
					http.post('/posts/add', postForm.value).then(msg => {
						ElNotification({ title: 'Success', message: msg, type: 'success' });
						postsForm.value.resetFields();
						showDialog.showPostDialog = false;
					});
				} else {
					return false;
				}
			});
		};

		const currentTopic = ref(TOPICS[0].name);

		const topicsNum = ref(5); // CLEAR
		const loadMorePost = () => {
			topicsNum.value += 2;
		};

		onMounted(() => {
			const USER_INFO = sessionStorage.getItem('USER_INFO');
			if (USER_INFO) {
				userAuth.auth = true;
				userAuth.userInfo = JSON.parse(USER_INFO);
			} else {
				userAuth.auth = false;
				userAuth.userInfo = null;
			}
		});
		const displayName = computed(() => {
			return (
				userAuth.userInfo?.username || `${userAuth.userInfo?.firstname || '--'} ${userAuth.userInfo?.lastname || '--'}`
			);
		});

		// Comment Part
		const show = reactive({
			showMoreDetailIndex: null,
			showComment: null
		});
		const comment = reactive(new Comment());
		const handleSubmitComment = () => {}; // TODO: submit comment

		return {
			...toRefs(userAuth),
			showFriendsList,
			...toRefs(showDialog),
			postsForm,
			postForm,
			createTime,
			selectedTopics,
			currentTopic,
			topicsNum,
			loadMorePost,
			handlePublish,
			openPostDialog,
			displayName,
			handleLogout,
			...toRefs(show),
			comment,
			handleSubmitComment,
			TOPICS
		};
	}
};

Vue.createApp(composition).use(ElementPlus).mount('#app');
