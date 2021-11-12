const { ref, reactive } = Vue;

const rules = {
	email: [
		{
			required: true,
			trigger: 'change',
			message: 'Eamil is required!'
		}
	],
	password: [
		{
			required: true,
			trigger: 'change',
			message: 'Password is required!'
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
		}
	]
};

Vue.createApp({
	setup() {
		const signUpForm = ref();
		const form = reactive({
			email: '',
			password: '',
			firstname: '',
			lastname: '',
			phoneNumber: ''
		});

		const handleSubmit = () => {
			signUpForm.value.validate(valid => {
				if (valid) {
					alert('submit!');
				} else {
					console.log('error submit!!');
					return false;
				}
			});
		};

		return {
			form,
			rules,
			handleSubmit,
			signUpForm
		};
	}
})
	.use(ElementPlus)
	.mount('#authorize');
