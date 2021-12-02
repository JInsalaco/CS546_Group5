const rules = {
	email: [
		{
			required: true,
			trigger: 'change',
			message: 'Eamil is required!'
		},
		{
			pattern: /^\S+@[a-z]+\.com|edu$/,
			trigger: 'change',
			message: 'Invalid email format!'
		}
	],
	firstname: [
		{
			required: true,
			trigger: 'change',
			message: 'Firstname is required!'
		}
	],
	lastname: [
		{
			required: true,
			trigger: 'change',
			message: 'Lastname is required!'
		}
	],
	phoneNumber: [
		{
			required: true,
			trigger: 'change',
			message: 'PhoneNumber is required!'
		},
		{
			len: 13,
			trigger: 'change',
			message: 'The phone number should be 10 digits!'
		},
		{
			pattern: /[\(\)\-0-9]{10}/,
			trigger: 'change',
			message: 'The phone number should be number!'
		}
	]
};

// CLEAR
const tableData = [
	{
		title: 'Lecture Rescheduling',
		author: { url: '/public/static/avatar.png', name: 'Shihao' },
		createTime: '11/30/2021 13:00'
	},
	{
		title: 'Lecture Rescheduling',
		author: { url: '/public/static/avatar.png', name: 'Shihao' },
		createTime: '11/30/2021 13:00'
	},
	{
		title: 'Lecture Rescheduling',
		author: { url: '/public/static/avatar.png', name: 'Shihao' },
		createTime: '11/30/2021 13:00'
	},
	{
		title: 'Lecture Rescheduling',
		author: { url: '/public/static/avatar.png', name: 'Shihao' },
		createTime: '11/30/2021 13:00'
	}
];
const friendsData = [
	{ name: 'Shihao', url: '/public/static/avatar.png', email: 'example@stevens.edu' },
	{ name: 'Riya', url: '/public/static/avatar.png', email: 'example@stevens.edu' },
	{ name: 'Joseph', url: '/public/static/avatar.png', email: 'example@stevens.edu' },
	{ name: 'Javier', url: '/public/static/avatar.png', email: 'example@stevens.edu' }
];

Vue.createApp({
	setup() {
		const userAuth = reactive({
			auth: false,
			userInfo: null
		});
		const userForm = ref(new User());
		const userFormRef = ref();
		const userFormDisable = ref(true);

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
		});

		/************************************************************* Information *************************************************************/
		const uploading = ref(false);
		const handleImageUpload = file => {
			uploading.value = true;
			const formData = new FormData();
			formData.append('avatar', file);
			http
				.post('/profile/upload', formData)
				.then(res => {
					userForm.value.profilePic = res.path;
					setSession('profilePic', res.path);
				})
				.finally(() => setTimeout(() => (uploading.value = false), 1000));
			return false;
		};

		const handleSubmit = () => {
			userFormDisable.value = true;
			userFormRef.value.validate(valid => {
				if (valid) {
					http.post('/profile/edit', userForm.value).then(msg => {
						ElMessage.success(msg);
						['email', 'firstname', 'lastname', 'phoneNumber', 'username'].forEach(item =>
							setSession(item, userForm.value[item])
						);
					});
				} else {
					return false;
				}
			});
		};

		const handlePhoneInput = value => {
			userForm.value.phoneNumber = value.replace(/^(\d{3})(\d{3})(\d{4})$/, '($1)$2-$3');
		};

		/************************************************************* My Post *************************************************************/
		const postDialogControl = reactive({
			showDialog: false,
			edit: false
		});
		const postsForm = ref();
		const postForm = ref(null);
		const createTime = computed(() => dayjs(postForm.value?.metaData?.timeStamp).format('MM/DD/YYYY HH:mm'));

		const handleGetPostdetail = id => {
			getPostDetail(id);
			postDialogControl.showDialog = true;
		};
		const handlePostEdit = id => {
			getPostDetail(id);
			postDialogControl.edit = true;
			postDialogControl.showDialog = true;
		};
		const getPostDetail = id => {
			// TODO get detail data from DB
			postForm.value = { ...new Posts(), topics: [], metaData: { timeStamp: new Date().getTime() } };
		};
		const beforeClosePostDialog = () => {
			postDialogControl.showDialog = false;
			setTimeout(() => (postDialogControl.edit = false), 500);
		};
		// TODO
		const handleEditConfirm = () => {};
		const displayName = computed(() => {
			return (
				userAuth.userInfo?.username || `${userAuth.userInfo?.firstname || '--'} ${userAuth.userInfo?.lastname || '--'}`
			);
		});

		return {
			...toRefs(userAuth),
			userForm,
			userFormRef,
			userFormDisable,
			handleImageUpload,
			handleSubmit,
			handlePhoneInput,
			rules,
			postRules,
			uploading,
			handleLogout,
			postsForm,
			postForm,
			createTime,
			postDialogControl,
			handleGetPostdetail,
			handlePostEdit,
			displayName,
			TOPICS,
			beforeClosePostDialog,
			handleEditConfirm,
			showAddFriendsDialog,
			...toRefs(addFriendsConfig),
			tableData, // CLEAR
			friendsData // CLEAR
		};
	}
})
	.use(ElementPlus)
	.mount('#app');
