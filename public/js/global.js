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
const addFriendsConfig = reactive({
	friendId: '',
	querySearchAsync: () => {},
	handleFriendsSelected: item => {
		console.log(item);
	}
});

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
