const home = require('./home');
const authorize = require('./authorize');
const posts = require('./posts');

module.exports = app => {
	app.use('/', home);
	app.use('/authorize', authorize);
	app.use('/posts', posts);

	app.use('*', (_, res) => {
		res.status(404).json({ error: 'No APIs' });
	});
};
