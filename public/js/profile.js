const { ref, reactive, onMounted } = Vue;
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
		const activeMenu = ref('');
		const userForm = reactive({
			firstname: 'Shihao',
			lastname: 'Xiong',
			phoneNumber: '(551)556-4100',
			email: 'shihao.xiong@stevens.edu',
			gender: 'Male',
			age: 0,
			userName: 'TSXFP',
			bio: '',
			profilePicture: '/public/static/avatar.png'
		});
		const userFormDisable = ref(true);

		onMounted(() => {
			const current = location.href.match(/\/(\w+)$/)[1];
			activeMenu.value = profileMenu.find(item => item.text.toLocaleLowerCase() === current).index;
		});

		const uploading = ref(false);
		const handleImageUpload = file => {
			uploading.value = true;
			const formData = new FormData();
			formData.append('avatar', file);
			http
				.post('/profile/upload', formData)
				.then(res => (userForm.profilePicture = res.path))
				.finally(() => setTimeout(() => (uploading.value = false), 1000));
			return false;
		};

		const handleSubmit = () => {
			userFormDisable.value = true;
		};

		const handlePhoneInput = value => {
			userForm.phoneNumber = value.replace(/^(\d{3})(\d{3})(\d{4})$/, '($1)$2-$3');
		};

		return {
			profileMenu,
			activeMenu,
			userForm,
			userFormDisable,
			handleImageUpload,
			handleSubmit,
			handlePhoneInput,
			rules,
			uploading
		};
	}
})
	.use(ElementPlus)
	.mount('#app');
