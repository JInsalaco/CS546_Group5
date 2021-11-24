const { ref, reactive, toRefs, computed, nextTick, onMounted } = Vue;
const { ElLoading, ElMessage, ElNotification } = ElementPlus;

class Posts {
	constructor(obj = {}) {
		const { title, body, posterId, topics, thread, popularity, createTime, metaData } = obj;
		this.title = title ?? '';
		this.body = body ?? '';
		this.posterId = posterId ?? '';
		this.topics = topics ?? [];
		this.thread = thread ?? [];
		this.popularity = popularity ?? {};
		this.createTime = createTime ?? dayjs().format('MM/DD/YYYY');
		this.metaData = metaData ?? { timeStamp: new Date().getTime(), archived: false, flags: 0 };
	}
}

class Comment {
	constructor(obj = {}) {
		const { body, posterId, threads, popularity, metaData } = obj;
		this.body = body ?? '';
		this.posterId = posterId ?? '';
		this.threads = threads ?? [];
		this.popularity = popularity ?? {};
		this.metaData = metaData ?? { timeStamp: new Date().getTime(), archived: false, flags: 0 };
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
	sessionStorage.clear();
	location.replace('/'); // TODO: redirect to '/' in backend
};

const TOPICS = [
	{ name: 'School Life', color: '' },
	{ name: 'Courses', color: '' },
	{ name: '', color: '' },
	{ name: '', color: '' },
	{ name: '', color: '' },
	{ name: '', color: '' },
	{ name: '', color: '' }
];
