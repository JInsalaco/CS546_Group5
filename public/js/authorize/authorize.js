window.onload = () => {
	if (document.getElementById('animate')) {
		const file = location.href.match(/authorize\/(\S+)$/)[1];
		import(`../../animation/${file}.json`, { assert: { type: 'json' } }).then(async animationData => {
			const params = {
				container: document.getElementById('animate'),
				renderer: 'svg',
				loop: true,
				autoplay: true,
				animationData: animationData.default
			};

			lottie.loadAnimation(params);
		});
	}
};
