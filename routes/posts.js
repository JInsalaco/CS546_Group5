const router = require('express').Router();
const { posts, users, comments } = require('../data');
const { errorCheckingId } = require('../utils');
/**
 * DONE
 */
router.get('/getDetail', async (req, res) => {
	const { id } = req.query;
	try {
		errorCheckingId(id);
	} catch (error) {
		res.status(400).send(error?.message ?? error);
		return;
	}

	try {
		const post = await posts.getPost(id);
		res.json(post);
	} catch (error) {
		return res.status(400).send(error?.message ?? error);
	}
});

/**
 * DONE
 */
router.get('/search', async (req, res) => {
	const { title } = req.query;
	try {
		const postList = await posts.getPostsByTitle(title);
		res.status(200).json(postList);
	} catch (error) {
		return res.status(400).send(error?.message ?? error);
	}
});

/**
 * DONE
 */
router.get('/getPosts', async (req, res) => {
	const { topicId, pageSize, pageNumber } = req.query;
	try {
		errorCheckingId(topicId);
		if (isNaN(+pageSize) || isNaN(+pageNumber)) throw 'pageSize or pageNumber invalid';
	} catch (error) {
		res.status(400).send(error?.message ?? error);
		return;
	}

	try {
		const postList = await posts.getPosts(req.query, req.session.userid);
		res.json(postList);
	} catch (error) {
		res.status(500).send(error?.message ?? error);
	}
});

/**
 * DONE
 */
router.get('/getMyPosts', async (req, res) => {
	if (!req.session.userid) {
		res.status(403).send('No permisssion');
		return;
	}

	try {
		const postList = await posts.getMyPosts(req.session.userid);
		res.json(postList);
	} catch (error) {
		res.status(500).send(error?.message ?? error);
	}
});

/**
 * DONE
 */
router.post('/add', async (req, res) => {
	if (!req.session.userid) {
		res.status(403).send('No permission');
		return;
	}

	const { title, body, topics } = req.body;
	try {
		posts.errorCheckingPost(title, body);
	} catch (error) {
		res.status(400).send(error?.message ?? error);
	}

	try {
		const result = await posts.addPost(req.session.userid, title, body, topics);
		if (result) res.status(200).send('Posted Successfully, check your feed!');
		else res.status(500).send('Internal server error, please try again after some time');
	} catch (error) {
		return res.status(400).send(error?.message ?? error);
	}
});

/**
 * DONE
 */
router.delete('/', async (req, res) => {
	if (!req.session.userid) {
		res.status(403).send('No permisssion');
		return;
	}

	try {
		errorCheckingId(req.body.id);
	} catch (error) {
		res.status(400).send(error?.message ?? error);
		return;
	}

	try {
		const post = await posts.deletePost(req.body.id);
		if (post.deleted === true) res.status(200).send('Posted Deleted!');
		else throw 'Deleted faild!';
	} catch (error) {
		return res.status(500).send(error?.message ?? error);
	}
});

router.put('/:id', async (req, res) => {
	if (!req.session.userid) {
		res.status(403).send('No permisssion');
		return;
	}

	try {
		errorCheckingId(req.params.id);
	} catch (error) {
		res.status(400).send(error?.message ?? error);
		return;
	}

	const { title, body, topics } = req.body;
	try {
		posts.errorCheckingPost(title, body);
		const post = await posts.getPost(req.params.id.toString());
		const equalPost = posts.editComparison(post.body, body, post.topics, topics);
		if (!equalPost) return res.status(400).send('No updates made');
	} catch (error) {
		return res.status(500).send(error?.message ?? error);
	}

	try {
		posts.errorCheckingPost(title, body);
		let posterId = req.session.userid;
		const result = await posts.editPost(posterId, title, body, topics);
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

/**
 * DONE
 */
router.post('/like', async (req, res) => {
	if (!req.session.userid) {
		res.status(403).send('No permisssion');
		return;
	}

	const { id } = req.body;
	try {
		errorCheckingId(id);
	} catch (error) {
		res.status(400).send(error?.message ?? error);
		return;
	}

	try {
		const result = await posts.updatePopularity(id, req.session.userid);
		res.json(result);
	} catch (error) {
		res.status(500).send(error?.message ?? error);
	}
});

/**
 * DONE
 */
router.post('/history', async (req, res) => {
	if (!req.session.userid) {
		res.status(403).send('No permisssion');
		return;
	}

	const { ids } = req.body;
	try {
		for (let id of ids) {
			errorCheckingId(id);
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

//TODO: Finish Testing
router.get('/getComments', async (req, res) => {
	if (!req.session.userid) {
		res.status(403).send('No permisssion');
		return;
	}

	const { id: postId } = req.query;
	try {
		errorCheckingId(postId);
	} catch (error) {
		res.status(400).send(error?.message ?? error);
	}

	const uid = req.session.userid;
	try {
		const commentList = await comments.getComments(postId, uid);
		res.json(commentList);
	} catch (error) {
		res.status(500).send(error?.message ?? error);
	}
});

/**
 * DONE
 */
router.post('/addComment', async (req, res) => {
	if (!req.session.userid) {
		res.status(403).send('No permisssion');
		return;
	}

	let uid = req.session.userid;
	const { body, postId } = req.body;
	try {
		const { update } = await comments.createComment(uid, body, postId);
		if (!update) throw 'Comment add faild';

		res.status(200).send('Comment add successfully');
	} catch (error) {
		res.status(500).send(error?.message ?? error);
	}
});

module.exports = router;
