const router = require('express').Router();
const { posts } = require('../data');
const { errorCheckingId } = require('../utils');

router.get('/getDetail', async (req, res) => {
	// MODIFY uncomment when finished
	// if (!req.session.userid) {
	// 	res.status(403).send('No permisssion');
	// 	return;
	// }

	const { id } = req.query;
	if (errorCheckingId(id)) {
		return res.status(400).send('Post does not exist');
	}

	try {
		const post = await posts.getPost(id);
		res.json(post);
	} catch (error) {
		return res.status(400).send(error?.message ?? error);
	}
});

router.get('/search', async (req, res) => {
	// MODIFY uncomment when finished
	// if (!req.session.userid) {
	// 	res.status(403).send('No permisssion');
	// 	return;
	// }

	const { title } = req.query;
	try {
		const postList = await posts.getPostsByTitle(title);
		res.status(200).json(postList);
	} catch (error) {
		return res.status(400).send(error?.message ?? error);
	}
});

router.get('/getPosts', async (req, res) => {
	// MODIFY uncomment when finished
	// if (!req.session.userid) {
	// 	res.status(403).send('No permisssion');
	// 	return;
	// }

	const { topicId, pageSize, pageNumber } = req.query;
	try {
		if (errorCheckingId(topicId)) throw 'topicId invalid';
		if (isNaN(+pageSize) || isNaN(+pageNumber)) throw 'pageSize or pageNumber invalid';
	} catch (error) {
		console.log(error);
		res.status(400).send(error?.message ?? error);
		return;
	}

	try {
		const postList = await posts.getPosts(req.query);
		res.json(postList);
	} catch (error) {
		console.log(error);
		res.status(500).send(error?.message ?? error);
	}
});
router.get('/getMyPosts', async (req, res) => {
	// MODIFY uncomment when finished
	// if (!req.session.userid) {
	// 	res.status(403).send('No permisssion');
	// 	return;
	// }

	try {
		const postList = await posts.getMyPosts(req.session.userid);
		if (postList) res.json(postList);
	} catch (error) {
		res.status(500).send(error?.message ?? error);
	}
});

router.post('/add', async (req, res) => {
	if (!req.session.userid) {
		res.status(403).send('No permission');
		return;
	}

	try {
		const { title, body, topics } = req.body;
		posts.errorCheckingPost(title, body);
		// const topicResult = await topicData.getAllTopicTitles(topics);
		const posterId = req.session.userid;
		const result = await posts.addPost(posterId, title, body, topics);
		if (result) res.status(200).send('Posted Successfully, check your feed!');
		else res.status(500).send('Internal server error, please try again after some time');
	} catch (error) {
		return res.status(400).send(error?.message ?? error);
	}
});

router.delete('/', async (req, res) => {
	// MODIFY uncomment when finished
	// if (!req.session.userid) {
	// 	res.status(403).send('No permisssion');
	// 	return;
	// }

	const idCheck = errorCheckingId(req.body.id);
	if (idCheck) {
		return res.status(400).send('Invalid Id');
	}

	try {
		const post = await posts.deletePost(req.body.id);
		if (post.deleted === true) res.status(200).send('Posted Deleted!');
		else throw 'Deleted faild!';
	} catch (error) {
		return res.status(500).send(error?.message ?? error);
	}
});

// User able to change title?
router.put('/:id', async (req, res) => {
	// MODIFY uncomment when finished
	// if (!req.session.userid) {
	// 	res.status(403).send('No permisssion');
	// 	return;
	// }

	const idCheck = errorCheckingId(req.params.id);
	if (idCheck) {
		return res.status(400).send('Invalid Id');
	}

	const { title, body, topics } = req.body;
	try {
		posts.errorCheckingPost(title, body);
		const post = await posts.getPost(req.params.id);
		const equalPost = posts.editComparison(post.body, body, post.topics, topics);
		if (!equalPost) return res.status(400).send('No updates made');
	} catch (error) {
		return res.status(500).send(error?.message ?? error);
	}

	try {
		posts.errorCheckingPost(title, body);
		let posterId = req.session.userid;
		const result = await posts.addPost(posterId, title, body, topics);
		if (!result) return res.status(500).send('Internal server error, please try again after some time');
		return res.render('post', {
			title: post.title,
			body: post.body,
			posterId: post.posterId,
			topics: post.topics,
			thread: post.thread,
			popularity: post.popularity,
			timePosted: post.metaData.timeStamp
		});
	} catch (error) {
		return res.status(400).send(error?.message ?? error);
	}
});

router.post('/like', async (req, res) => {
	try {
		if (req.session.userid) {
			const postId = req.query.id;

			if (!postId || postId === '') throw 'Could not fetch post details for this post';
			const postPopularity = await posts.updatePopularity(postId, req.session.userid, 1);
			if (postPopularity) res.json({ postPopularity });
			else res.send(400).send('Could not fetch post details for this post');
		} else throw 'Please sing in first';
	} catch (error) {
		console.log(error);
		res.status(500).send(error?.message ?? error);
	}
});

router.post('/undoLike', async (req, res) => {
	try {
		if (req.session.userid) {
			const postId = req.query.id;

			if (!postId || postId === '') throw 'Could not fetch post details for this post';
			const postPopularity = await posts.updatePopularity(postId, req.session.userid, 0);
			if (postPopularity)
				res.json({
					postPopularity
				});
			else res.send(400).send('Could not fetch post details for this post');
		} else throw 'Please sing in first';
	} catch (error) {
		console.log(error);
		res.status(500).send(error?.message ?? error);
	}
});

router.post('/history', async (req, res) => {
	// MODIFY uncomment when finished
	// if (!req.session.userid) {
	// 	res.status(403).send('No permisssion');
	// 	return;
	// }

	const { ids } = req.body;
	try {
		for (let id of ids) {
			if (errorCheckingId(id)) throw 'Invalid Id';
		}
	} catch (error) {
		res.status(400).send(error?.message ?? error);
		return;
	}

	try {
		const postList = await posts.getMultiplePosts(ids);
		res.json(postList);
	} catch (error) {
		res.status(500).send(error?.message ?? error);
	}
});

module.exports = router;
