const home = require('./home');
const authorize = require('./authorize');

module.exports = app => {
	app.use('/', home);
	app.use('/authorize', authorize);

	app.use('*', (_, res) => {
		res.status(404).json({ error: 'No APIs' });
	});
};
