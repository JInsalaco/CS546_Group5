const { ref, reactive, onMounted } = Vue;
const profileMenu = [
	{ text: 'Information', index: '1' },
	{ text: 'Active', index: '2' },
	{ text: 'History', index: '3' }
];

Vue.createApp({
	setup() {
		const activeMenu = ref('');
		const userForm = reactive({
			firstName: 'Shihao',
			lastName: 'Xiong',
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

		const handleImageUpload = file => {
			return false;
		};

		const onSubmit = () => {
			console.log(111);
			userFormDisable.value = true;
		};

		return {
			profileMenu,
			activeMenu,
			userForm,
			userFormDisable,
			handleImageUpload,
			onSubmit
		};
	}
})
	.use(ElementPlus)
	.mount('#app');
