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
	]
};

Vue.createApp({
	setup() {
		const signInForm = ref();
		const form = reactive({ email: 'sxiong5@stevens.edu', password: 'Xsh031023' });

		const handleSubmit = () => {
			signInForm.value.validate(valid => {
				if (valid) {
					const loadingInstance = ElLoading.service();
					http
						.post('/authorize/signin', form)
						.then(res => {
							sessionStorage['USER_INFO'] = JSON.stringify(res);
							location.replace('/'), 1000;
						})
						.finally(() => loadingInstance.close());
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
			signInForm
		};
	}
})
	.use(ElementPlus)
	.mount('#authorize');
