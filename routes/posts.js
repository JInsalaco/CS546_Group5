const router = require('express').Router();
const postData = require('../data/posts');

router.post('/add', async (req, res) => {
	if (!req.session.userid) {
		res.status(403).send();
		return;
	}

	try {
		const postContent = req.body;
		let title = postContent.title;
		let body = postContent.body;
		let topics = postContent.topics;
		postData.errorCheckingPost(title, body);
		let posterId = req.session.userid;
		const result = await postData.addPost(posterId, title, body, topics);
		if (result) res.status(200).send('Posted Successfully, check your feed!');
		else res.status(500).send('Internal server error, please try again after some time');
	} catch (error) {
		res.status(400).send(error);
	}
});

module.exports = router;
