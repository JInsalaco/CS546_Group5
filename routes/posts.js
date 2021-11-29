const router = require('express').Router();
const postData = require('../data/posts');

router.post('/add', async (req, res) => {
	
	
	try {
		const postContent = req.body;
		let title = postContent.title;
		let body = postContent.body;
		let topics = postContent.topics;
		postData.errorCheckingPost(title,body);
		let posterId = req.session.userid;
		const result = await postData.addPost(posterId, title, body, topics);
		res.status(200).send("Posted Successfully, check your feed!")
	} catch (error) {
		res.status(500).send(error);
	}
});

module.exports = router;
