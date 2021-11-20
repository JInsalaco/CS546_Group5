const { ref, reactive } = Vue;
const { ElMessage, ElLoading } = ElementPlus;

const rules = {
	email: [
		{
			required: true,
			trigger: 'change',
			message: 'Eamil is required!'
		},
		{
			pattern: /[a-z][a-z0-9]+@stevens\.edu/,    //^\S+@[a-z]+\.com|edu$
			trigger: 'change',
			message: 'Invalid email format!'
		}
	],
	hashedPwd: [
		{
			required: true,
			trigger: 'change',
			message: 'Password is required!'
		},
		{
			min: 6,
			trigger: 'change',
			message: 'The length of password is at lease 6!'
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
		const signUpForm = ref();
		const form = reactive({
			email: '',
			hashedPwd: '',
			firstname: '',
			lastname: '',
			phoneNumber: ''
		});

		const handlePhoneInput = value => {
			form.phoneNumber = value.replace(/^(\d{3})(\d{3})(\d{4})$/, '($1)$2-$3');
		};

		const handleSubmit = () => {
			signUpForm.value.validate(valid => {
				if (valid) {
					http.post('/authorize/signup', form).then(msg => {
						ElMessage.success(msg);
						setInterval(() => {
							window.location.replace('/authorize/signin');
						}, 1000);
					});
				} else {
					return false;
				}
			});
		};

		return {
			form,
			rules,
			handleSubmit,
			signUpForm,
			handlePhoneInput
		};
	}
})
	.use(ElementPlus)
	.mount('#authorize');
