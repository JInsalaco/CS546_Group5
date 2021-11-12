const router = require('express').Router();
const data = require('../data');
const userData =  data.users;

router.get('/:type', (req, res) => {
	const { type } = req.params;
	const actions = `Sign ${type.match(/^sign(\S+)$/)[1]}`;
	res.render('authorize', { title: actions, isSignIn: type === 'signin' });
});
router.post('/signup', (req, res)=> {

	let userInfo = req.body;
	let firstname= userInfo.firstname;
	let lastname= userInfo.lastname;
	let email= userInfo.email;
	let phoneNumber= userInfo.phoneNumber;
	let hashedPwd= userInfo.hashedPwd;

	let userObj = {
		firstname,
		lastname,
		email,
		phoneNumber,
		hashedPwd
	}
	try{
		const newUser = userData.addUser(userObj);
		res.json(userObj);
	}
	catch(e){
		res.sendStatus(500).json({error: e});
	}
});

module.exports = router;
