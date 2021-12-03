const router = require('express').Router();
const postData = require('../data/posts');
const topicData = require('../data/topics');
const userData = require('../data/users')

router.get('/:id', async (req, res) => {
	const idCheck = errorCheckingId(req.params.id);
	if (!idCheck) {
		return res.status(400).send("Post does not exist");
	}

	try {
		if (!req.session.userid) {
			return res.redirect('/partials/authorize/SignInForm');
		} else {
			const post = await postData.getPost(req.params.id);
			return res.render('post', { title: post.title, body: post.body, posterId: post.posterId, topics: post.topics, thread: post.thread, popularity: post.popularity, timePosted: post.metaData.timeStamp });
		}
	} catch (e) {
		return res.status(400).send(e);
	}
});

router.get('/', async (req, res) => {
	
	try {
		if (!req.session.userid) {
			// return res.redirect('/partials/authorize/SignInForm');
			res.status(403).send('Please Sign in');
		} else {
			const { topicId, pageSize, pageNumber, title } = req.query;
			const post = await postData.getAllPosts();
			res.status(200).json({post});
		}
	} catch (e) {
		return res.status(400).send(e);
	}
});
router.post('/add', async (req, res) => {
	try {
		if (!req.session.userid) {
			return res.render('/partials/authorize/SignInForm');
		}

		const { title, body, topics } = req.body;
		postData.errorCheckingPost(title, body);
		// const topicResult = await topicData.getAllTopicTitles(topics);
		const posterId = req.session.userid;
		const result = await postData.addPost(posterId, title, body, topics);
		if (result) res.status(200).send('Posted Successfully, check your feed!');
		else res.status(500).send('Internal server error, please try again after some time');
	} catch (e) {
		return res.status(400).send(e);
	}
});

router.delete('/:id', async (req, res) => {
	const idCheck = errorCheckingId(req.params.id);
	if (!idCheck) {
		return res.status(400).send("Post does not exist");
	}

	try {
		if (!req.session.userid) {
			return res.redirect('/partials/authorize/SignInForm');
		} else {
			const post = await postData.deletePost(req.params.id);
			if (post.deleted === true) res.status(200).send('Posted Deleted!');
			else res.status(500).send('Internal server error, please try again after some time');
		}
	} catch(e) {
		return res.status(400).send(e);
	}
})

// User able to change title?
router.put('/:id', async (req, res) => {
	const idCheck = errorCheckingId(req.params.id);
	if (!idCheck) {
		return res.status(400).send("Post does not exist");
	}

	const { title, body, topics } = req.body;
	try {
		if (!req.session.userid) {
			return res.redirect('/partials/authorize/SignInForm');
		} else {
			postData.errorCheckingPost(title, body);
			const post = await postData.getPost(req.params.id);
			const equalPost = postData.editComparison(post.body, body, post.topics, topics)
			if (!equalPost) return res.status(404).send("No updates made");
		}
	} catch(e) {
		return res.status(400).send(e);
	}

	try {
		postData.errorCheckingPost(title, body);
		let posterId = req.session.userid;
		const result = await postData.addPost(posterId, title, body, topics);
		if (!result) return res.status(500).send('Internal server error, please try again after some time');
		return res.render('post', { title: post.title, body: post.body, posterId: post.posterId, topics: post.topics, thread: post.thread, popularity: post.popularity, timePosted: post.metaData.timeStamp });
	} catch(e) {
		return res.status(400).send(e);
	}
})

function errorCheckingId(id) {
	if (!id) return true;
	if (typeof id !== 'string') return true;
	if (id.trim() === "") return true;
	if (!(ObjectId.isValid(id))) return true;
	return false;
};

module.exports = router;
