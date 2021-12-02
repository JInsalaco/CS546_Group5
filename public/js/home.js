const composition = {
	setup() {
		/************************************************************* Auth *************************************************************/
		const userAuth = reactive({
			auth: false,
			userInfo: null
		});
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

		/************************************************************* Topics *************************************************************/
		const currentTopic = ref(null);
		onMounted(() => {
			http.get('/topics/getAll').then(res => {
				TOPICS.value = res;
				currentTopic.value = res[0]._id;
			});
		});

		/************************************************************* Create Post *************************************************************/
		const showDialog = reactive({ showPostDialog: false });
		const postsForm = ref();
		const postForm = ref(null);
		const createTime = ref(null);
		const selectedTopics = computed(() => TOPICS.value.filter(item => postForm.value.topics.includes(item._id)));
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

		/************************************************************* Post List *************************************************************/
		const topicsNum = ref(5); // CLEAR
		const loadMorePost = () => {
			topicsNum.value += 2;
		};

		/************************************************************* Comment *************************************************************/
		const show = reactive({
			showMoreDetailIndex: null,
			showComment: null
		});
		const comment = reactive(new Comment());
		const handleSubmitComment = () => {}; // TODO: submit comment

		/************************************************************* Profile *************************************************************/
		const showFriendsList = ref(true);
		const displayName = computed(() => {
			return (
				userAuth.userInfo?.username || `${userAuth.userInfo?.firstname || '--'} ${userAuth.userInfo?.lastname || '--'}`
			);
		});

		return {
			...toRefs(userAuth),
			showFriendsList,
			...toRefs(showDialog),
			postsForm,
			postForm,
			postRules,
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
			TOPICS,
			showAddFriendsDialog,
			...toRefs(addFriendsConfig)
		};
	}
};

Vue.createApp(composition).use(ElementPlus).mount('#app');
