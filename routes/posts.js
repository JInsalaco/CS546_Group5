const router = require('express').Router();
const { posts } = require('../data');
const { errorCheckingId } = require('../utils/utils');

router.get('/getDetail', async (req, res) => {
	try {
		if (req.session.userid) {
			const postId = req.query.id;
		
			if(!postId || postId === "")
				throw "Could not fetch post details for this post";
		const post = await posts.getPost(postId);
		if(post)
			res.json( {
			title: post.title,
			body: post.body,
			posterId: post.posterId,
			topics: post.topics,
			thread: post.thread,
			popularity: post.popularity,
			timeStamp: post.metaData.timeStamp });
		else
			res.send(400).send("Could not fetch post details for this post");
		}
		else
			throw "Please sing in first";
	} catch (error) {
		console.log(error);
		res.status(500).send(error);
	}
});

router.get('/getPostByTitle', async (req, res) => {
	// MODIFY uncomment when finished
	// if (!req.session.userid) {
	// 	res.status(403).send('No permisssion');
	// 	return;
	// }

	const { title } = req.query;
	try {
		const postList = await posts.getPostsByTitle(title);
		res.status(200).json(postList);
	} catch (e) {
		return res.status(400).send(e);
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
		res.status(400).send(error);
		return;
	}

	try {
		const postList = await posts.getPosts(req.query);
		res.json(postList);
	} catch (error) {
		console.log(error);
		res.status(500).send(error);
	}
});
router.get('/getMyPosts', async (req, res) => {
	// MODIFY uncomment when finished
	// if (!req.session.userid) {
	// 	res.status(403).send('No permisssion');
	// 	return;
	// }

	try {
		if (req.session.userid) {
		const postList = await posts.getMyPosts(req.session.userid);
		if(postList)
			res.json(postList);
		else
			res.send(400).send("No Posts");
		}
	} catch (error) {
		console.log(error);
		res.status(500).send(error);
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
	} catch (e) {
		return res.status(400).send(e);
	}
});

router.delete('/:id', async (req, res) => {
	const idCheck = errorCheckingId(req.params.id);
	if (!idCheck) {
		return res.status(400).send('Post does not exist');
	}

	try {
		if (!req.session.userid) {
			return res.redirect('/partials/authorize/SignInForm');
		} else {
			const post = await posts.deletePost(req.params.id);
			if (post.deleted === true) res.status(200).send('Posted Deleted!');
			else res.status(500).send('Internal server error, please try again after some time');
		}
	} catch (e) {
		return res.status(400).send(e);
	}
});

// User able to change title?
router.put('/:id', async (req, res) => {
	const idCheck = errorCheckingId(req.params.id);
	if (!idCheck) {
		return res.status(400).send('Post does not exist');
	}

	const { title, body, topics } = req.body;
	try {
		if (!req.session.userid) {
			return res.redirect('/partials/authorize/SignInForm');
		} else {
			posts.errorCheckingPost(title, body);
			const post = await posts.getPost(req.params.id);
			const equalPost = posts.editComparison(post.body, body, post.topics, topics);
			if (!equalPost) return res.status(404).send('No updates made');
		}
	} catch (e) {
		return res.status(400).send(e);
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
	} catch (e) {
		return res.status(400).send(e);
	}
});

router.post('/like', async (req, res) => {
	try {
		if (req.session.userid) {
			const postId = req.query.id;
		
			if(!postId || postId === "")
				throw "Could not fetch post details for this post";
		const postPopularity = await posts.updatePopularity(postId,req.session.userid,1);
		if(postPopularity)
			res.json( {
				postPopularity
			 });
		else
			res.send(400).send("Could not fetch post details for this post");
		}
		else
			throw "Please sing in first";
	} catch (error) {
		console.log(error);
		res.status(500).send(error);
	}
});
router.post('/undoLike', async (req, res) => {
	try {
		if (req.session.userid) {
			const postId = req.query.id;
		
			if(!postId || postId === "")
				throw "Could not fetch post details for this post";
		const postPopularity = await posts.updatePopularity(postId,req.session.userid,0);
		if(postPopularity)
			res.json( {
				postPopularity
			 });
		else
			res.send(400).send("Could not fetch post details for this post");
		}
		else
			throw "Please sing in first";
	} catch (error) {
		console.log(error);
		res.status(500).send(error);
	}
});
module.exports = router;
