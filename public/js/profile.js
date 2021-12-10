Vue.createApp({
	setup() {
		const userAuth = reactive({
			auth: false,
			userInfo: null
		});
		const userForm = ref(new User());
		const userFormRef = ref();

		onMounted(() => {
			const USER_INFO = sessionStorage['USER_INFO'];
			if (USER_INFO) {
				userAuth.auth = true;
				userAuth.userInfo = JSON.parse(USER_INFO);
				userForm.value = { ...userForm.value, ...userAuth.userInfo };
			} else {
				userAuth.auth = false;
				userAuth.userInfo = null;
				userForm.value = new User();
			}
			getTopics();
		});

		/************************************************************* My Post *************************************************************/
		const postsForm = ref();
		const postForm = ref(new Posts());
		const createTime = computed(() => dayjs(postForm.value?.metaData?.timeStamp).format('MM/DD/YYYY HH:mm'));
		const myPostList = ref([]);
		const showPostDialog = ref(false);

		onMounted(() => getMyPosts());
		const getMyPosts = () => {
			http.get('/posts/getMyPosts').then(res => {
				myPostList.value = res;
			});
		};

		const selectedTopics = computed(() => TOPICS.value.filter(item => postForm.value.topics.includes(item._id)));
		const handlePostEdit = id => {
			showPostDialog.value = true;
			http.get('/posts/getDetail', { id }).then(res => {
				postForm.value = res;
			});
		};

		const handleEditConfirm = () => {
			const { _id, title, body, topics } = postForm.value;
			http.put(`/posts/${_id}`, { title, body, topics }).then(msg => {
				sysAlert(msg);
				showPostDialog.value = false;
				// refresh my post list
				getMyPosts();
			});
		};
		const displayName = computed(() => {
			return (
				userAuth.userInfo?.username || `${userAuth.userInfo?.firstname || '--'} ${userAuth.userInfo?.lastname || '--'}`
			);
		});
		const handleDeletePost = id => {
			http.delete('/posts', { id }).then(msg => {
				sysAlert(msg);
				const index = myPostList.value.findIndex(item => item._id === id);
				myPostList.value.splice(1, index);
			});
		};
		const handlePostArchive = id => {
			// TODO
			http.post('/posts/archive', { id }).then(res => {
				res ? sysAlert('Archive Successfully') : sysAlert('Cancel Archive', 'Success', 'warning');
				// refresh list
				getMyPosts();
			});
		};

		/************************************************************* History *************************************************************/
		const historyList = ref([]);
		const postDetailDialog = ref(false);
		const postDetail = ref({});
		const formatPostList = list => {
			return list.map(item => {
				const { _id, profilePic, username, firstname, lastname, timeStamp, title } = item;
				return {
					_id,
					title,
					author: {
						url: profilePic,
						name: username || `${firstname} ${lastname}`
					},
					createTime: dayjs(timeStamp).format('MM/DD/YYYY HH:mm')
				};
			});
		};
		const getHisory = () => {
			const ids = JSON.parse(sessionStorage['HISTORY'] ?? '[]');
			if (!ids.length) return;

			http.post('/posts/history', { ids }).then(res => {
				historyList.value = formatPostList(res);
			});
		};
		onMounted(() => getHisory());
		const onPostDetail = id => {
			http.get('/posts/getDetail', { id }).then(res => {
				postDetail.value = formatPostDetail(res);
				postDetailDialog.value = true;
			});
		};

		/************************************************************* My Like *************************************************************/
		const myLikeList = ref([]);
		onMounted(() => getMyLike());

		const getMyLike = () => {
			http.get('/posts/getMyLike').then(res => {
				myLikeList.value = formatPostList(res);
			});
		};

		/************************************************************* Friends List *************************************************************/
		onMounted(() => getMyFriendsList());

		/************************************************************* Information *************************************************************/
		const uploading = ref(false);
		const profileDialog = ref(false);
		const profileBg = ref('');
		onMounted(() => {
			const hour = dayjs().hour();
			if (hour >= 8 && hour <= 17) {
				profileBg.value = '/public/static/USA0.png';
			} else if (hour > 17 && hour <= 20) {
				profileBg.value = '/public/static/USA1.png';
			} else {
				profileBg.value = '/public/static/USA2.png';
			}
		});

		const profileSummary = computed(() => ({
			posts: myPostList.value.length,
			likes: myLikeList.value.length,
			friends: myFriendsList.value.length
		}));
		const profileDetail = computed(() => {
			const { bio, DOB, email, phoneNumber } = userForm.value;
			return [
				{ title: 'About Me', content: bio.replaceAll('\n', '<br />') },
				{ title: 'Date of Birth', content: DOB },
				{ title: 'Email', content: email },
				{ title: 'Phone', content: phoneNumber }
			];
		});

		const handleImageUpload = file => {
			uploading.value = true;
			const formData = new FormData();
			formData.append('avatar', file);
			http
				.post('/profile/upload', formData)
				.then(res => {
					userForm.value.profilePic = res.path;
					setUserInfo('profilePic', res.path);
				})
				.finally(() => setTimeout(() => (uploading.value = false), 1000));
			return false;
		};

		const handleSubmit = () => {
			userFormRef.value.validate(valid => {
				if (valid) {
					http.post('/profile/edit', userForm.value).then(res => {
						const { msg, user } = res;
						sysAlert(msg);
						updateUserInfo(user);
						userForm.value = { ...userForm.value, ...user };
						profileDialog.value = false;
					});
				} else {
					return false;
				}
			});
		};
		const handleProfileCancel = () => {
			profileDialog.value = false;
			userForm.value = JSON.parse(sessionStorage['USER_INFO']);
		};

		const handlePhoneInput = value => {
			userForm.value.phoneNumber = value.replace(/^(\d{3})(\d{3})(\d{4})$/, '($1)$2-$3');
		};

		return {
			...toRefs(userAuth),
			userForm,
			userFormRef,
			handleImageUpload,
			handleSubmit,
			handleProfileCancel,
			handlePhoneInput,
			postRules,
			postRules,
			uploading,
			handleLogout,
			postsForm,
			postForm,
			createTime,
			displayName,
			TOPICS,
			handleEditConfirm,
			showAddFriendsDialog,
			profileDialog,
			profileBg,
			profileSummary,
			profileDetail,
			historyList,
			postDetailDialog,
			onPostDetail,
			postDetail,
			handleDeletePost,
			myPostList,
			myLikeList,
			...toRefs(friendConfig),
			querySearchFriend,
			handleFriendsSelected,
			onBrforeFriendDialogClose,
			handleConfirmAddFriend,
			myFriendsList,
			showPostDialog,
			handlePostEdit,
			selectedTopics,
			handlePostArchive
		};
	}
})
	.use(ElementPlus)
	.mount('#app');
