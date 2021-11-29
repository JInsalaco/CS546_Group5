const home = require('./home');
const authorize = require('./authorize');
const posts = require('./posts');
const profile = require('./profile');
const topics = require('./topics');

const constructorMethod = app => {
	app.use('/', home);
	app.use('/authorize', authorize);
	app.use('/posts', posts);
	app.use('/profile', profile);
	app.use('/topics', topics);

	app.use('*', (_, res) => {
		return res.redirect('/');
	});
};

module.exports = constructorMethod;
