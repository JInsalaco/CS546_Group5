const { ref, reactive, onMounted, toRefs } = Vue;
const profileMenu = [
	{ text: 'Information', index: '1' },
	{ text: 'Active', index: '2' },
	{ text: 'History', index: '3' }
];

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

Vue.createApp({
	setup() {
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
		const userAuth = reactive({
			auth: false,
			userInfo: null
		});
		const activeMenu = ref('');
		const userForm = ref(new User());
		const userFormDisable = ref(true);

		onMounted(() => {
			const current = location.href.match(/entry=(\d)/)[1];
			activeMenu.value = current;
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

		const uploading = ref(false);
		const handleImageUpload = file => {
			uploading.value = true;
			const formData = new FormData();
			formData.append('avatar', file);
			http
				.post('/profile/upload', formData)
				.then(res => {
					userForm.value.profilePic = res.path;
					const USER_INFO = JSON.parse(sessionStorage['USER_INFO']);
					USER_INFO.profilePic = res.path;
					sessionStorage['USER_INFO'] = JSON.stringify(USER_INFO);
				})
				.finally(() => setTimeout(() => (uploading.value = false), 1000));
			return false;
		};

		const handleSubmit = () => {
			userFormDisable.value = true;
		};

		const handlePhoneInput = value => {
			userForm.value.phoneNumber = value.replace(/^(\d{3})(\d{3})(\d{4})$/, '($1)$2-$3');
		};

		const handleLogout = () => {
			sessionStorage.clear();
			location.replace('/'); // TODO: redirect to '/' in backend
		};

		return {
			...toRefs(userAuth),
			profileMenu,
			activeMenu,
			userForm,
			userFormDisable,
			handleImageUpload,
			handleSubmit,
			handlePhoneInput,
			rules,
			uploading,
			handleLogout
		};
	}
})
	.use(ElementPlus)
	.mount('#app');
