const express = require('express');
const { ExplainVerbosity } = require('mongodb');
const router = express.Router();
const mongoCollections = require('../config/mongoCollections');
const users = mongoCollections.users;
const data = require('../data');
const userData =  require('../data/users');

router.get('/:type', (req, res) => {
	const { type } = req.params;
	const actions = `Sign ${type.match(/^sign(\S+)$/)[1]}`;
	res.render('authorize', { title: actions, isSignIn: type === 'signin' });
});
router.post('/signup', (req, res)=> {

	try{
	let userInfo = req.body;
	let firstname= userInfo.firstname;
	let lastname= userInfo.lastname;
	let email= userInfo.email;
	let phoneNumber= userInfo.phoneNumber;
	let password= userInfo.password;

	try{
	userData.checkUserData(email,password,firstname,lastname,phoneNumber);
	}
	catch(e){
		res.status(400).send(e);
		return;
	  }

  	(async function() {
		  try{
		var newUser = await userData.addUser(email,password,firstname,lastname,phoneNumber);
		if(newUser)
			res.status(200).send('Signed up successfully');	
		else 
			throw "Error signing up";
		  }
		  catch(e){
			res.status(400).send(e);
		  }
	})();  
	
	}
	catch(e){
		res.status(500).json({error:e});
	}
});

module.exports = router;
