const { ref, reactive, toRefs, computed, nextTick, onMounted, watch } = Vue;
const { ElLoading, ElMessage, ElNotification } = ElementPlus;

class Posts {
	constructor(obj = {}) {
		const { title, body, topics } = obj;
		this.title = title ?? '';
		this.body = body ?? '';
		this.topics = topics ?? [];
	}
}

class User {
	constructor() {
		this.firstname = '';
		this.lastname = '';
		this.phoneNumber = '';
		this.email = '';
		this.gender = '';
		this.DOB = '';
		this.username = '';
		this.bio = '';
		this.profilePic = '';
	}
}

const handleLogout = () => {
	http.get('/logout').then(res => {
		location.replace('/');
		sessionStorage.clear();
		ElMessage.success(res);
	});
};

const setUserInfo = (key, value) => {
	const userInfo = JSON.parse(sessionStorage['USER_INFO']);
	userInfo[key] = value;
	sessionStorage['USER_INFO'] = JSON.stringify(userInfo);
};

const updateUserInfo = newUserInfo => {
	sessionStorage['USER_INFO'] = JSON.stringify(newUserInfo);
};

const showSearchInput = ref(true);

const postRules = {
	topics: [{ required: true, message: 'You must select at least 1 topics', trigger: 'change' }],
	title: [{ required: true, message: 'Title is required', trigger: 'change' }],
	body: [{ required: true, message: 'Content is required', trigger: 'change' }]
};

const showAddFriendsDialog = ref(false);
const friendConfig = reactive({
	firendEmail: '',
	friendInfo: null
});
const myFriendsList = ref([]);

const getMyFriendsList = () => {
	http.get('/profile/friends').then(res => {
		myFriendsList.value = res.map(item => {
			const { username, firstname, lastname, profilePic, email } = item;
			return {
				name: username || `${firstname} ${lastname}`,
				url: profilePic,
				email
			};
		});
	});
};

const querySearchFriend = (searchTerm, cb) => {
	http.get('/profile/searchFriend', { email: searchTerm }).then(res => {
		const infoList = res.map(item => {
			const { _id, username, firstname, lastname, email } = item;
			const info = `${username || `${firstname} ${lastname}`} (${email})`;

			return { info, _id };
		});
		cb(infoList);
	});
};
const handleFriendsSelected = item => {
	const { _id: id } = item;
	http.get('/profile/userInfo', { id }).then(res => {
		friendConfig.friendInfo = res;
	});
};
const onBrforeFriendDialogClose = () => {
	showAddFriendsDialog.value = false;
	setTimeout(() => {
		friendConfig.friendInfo = null;
		friendConfig.firendEmail = '';
	}, 500);
};
const handleConfirmAddFriend = () => {
	if (!friendConfig.friendInfo) {
		ElMessage.warning('Please select a user first');
		return;
	}

	const { _id: id, username, firstname, lastname } = friendConfig.friendInfo;
	http.post('/profile/addFriend', { id }).then(res => {
		if (res) {
			sysAlert(`You hace add ${username || `${firstname} ${lastname}`} as your friend`);
			onBrforeFriendDialogClose();
			getMyFriendsList();
		}
	});
};

const sysAlert = (msg, noTitle, type = 'success') => {
	const title = noTitle ?? type.charAt(0).toUpperCase() + type.slice(1);
	ElNotification({ title, message: msg, type });
};

let TOPICS = ref([]);
const getTopics = () => {
	return http.get('/topics/getAll').then(res => {
		TOPICS.value = res;
		return res;
	});
};

/**
 * save history to session
 * @param {string} id the id of post
 */
const saveHistory = id => {
	let history = JSON.parse(sessionStorage['HISTORY'] ?? '[]');
	history.push(id);
	history = [...new Set(history)];

	sessionStorage['HISTORY'] = JSON.stringify(history);
};

const formatPostDetail = postData => {
	const { _id, body, title, username, firstname, lastname, timeStamp, topics, popularity, profilePic } = postData;
	const topicsList = TOPICS.value.filter(item => topics.includes(item._id));
	const content = body
		.split('\n')
		.map(item => `<p>${item}</p>`)
		.join('');
	return {
		_id,
		title,
		content,
		name: username || `${firstname} ${lastname}`,
		createTime: dayjs(timeStamp).format('MM/DD/YYYY HH:mm'),
		topicsList,
		popularity,
		profilePic,
		comment: '',
		commentList: []
	};
};
