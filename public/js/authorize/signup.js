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
			pattern: /[a-z0-9]+@stevens\.edu$/,
			trigger: 'change',
			message: 'Invalid email format!'
		}
	],
	password: [
		{
			required: true,
			trigger: 'change',
			message: 'Password is required!'
		},
		{
			min: 8,
			max: 15,
			trigger: 'change',
			message: 'The length of password is at lease 8 and no more than 15!'
		},
		{
			pattern: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,15}$/,
			trigger: 'change',
			message: 'The password must contain at least one number, one uppercase and one lowercase letter!'
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
			password: '',
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
					const loadingInstance = ElLoading.service();
					http
						.post('/authorize/signup', form)
						.then(msg => {
							ElMessage.success(msg);
							setTimeout(() => location.replace('/authorize/signin'), 1000);
						})
						.finally(() => loadingInstance.close());
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
