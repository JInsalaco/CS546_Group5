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
		const postForm = ref(new Posts());

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

		const handleCancel = () => {
			postForm.value = new Posts();
			showDialog.showPostDialog = false;
		};

		// Comment Part
		const showMoreDetailIndex = ref(null);
		const handleShowMoreDetail = index => {
			showMoreDetailIndex.value = showMoreDetailIndex.value === index ? null : index;
		};
		const comment = reactive(new Comment());
		const handleSubmitComment = () => {}; // TODO: submit comment

		return {
			...toRefs(userAuth),
			showFriendsList,
			...toRefs(showDialog),
			postsForm,
			postForm,
			topics,
			currentTopic,
			topicsNum,
			loadMorePost,
			handlePublish,
			handleCancel,
			displayName,
			handleLogout,
			showMoreDetailIndex,
			comment,
			handleSubmitComment,
			handleShowMoreDetail
		};
	}
};

Vue.createApp(composition).use(ElementPlus).mount('#app');
