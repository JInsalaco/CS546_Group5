const { ref } = Vue;

const composition = {
	setup() {
		const showFriendsList = ref(true);
		return {
			showFriendsList
		};
	}
};

Vue.createApp(composition).use(ElementPlus).mount('#app');
