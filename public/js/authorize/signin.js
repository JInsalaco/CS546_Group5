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
	]
};

Vue.createApp({
	setup() {
		const signInForm = ref();
		const form = reactive({ email: '', password: '' });

		const handleSubmit = () => {
			signInForm.value.validate(valid => {
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
			signInForm
		};
	}
})
	.use(ElementPlus)
	.mount('#authorize');
