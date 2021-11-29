const { ref, reactive, toRefs, computed, nextTick, onMounted } = Vue;
const { ElLoading, ElMessage, ElNotification } = ElementPlus;

class Posts {
	constructor(obj = {}) {
		const { title, body, topics } = obj;
		this.title = title ?? '';
		this.body = body ?? '';
		this.topics = topics ?? [];
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
	http.get('/logout').then(res => {
		location.replace('/');
		sessionStorage.clear();
		ElMessage.success(res);
	});
};

const TOPICS = [
	{ name: 'School Life', color: '86,71,197' },
	{ name: 'Courses', color: '131,88,255' },
	{ name: 'Events', color: '12,197,209' },
	{ name: 'Activites', color: '202,71,173' },
	{ name: 'Announcement', color: '202,71,71' },
	{ name: 'Social', color: '255,132,153' },
	{ name: 'Career', color: '124,166,250' }
];
