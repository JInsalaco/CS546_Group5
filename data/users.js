const { users } = require('../config/mongoCollections');
const bcrypt = require('bcrypt');
const saltRounds = 16;

function checkUserData(email, password, firstname, lastname, phoneNumber) {
	if (!email || !password || !firstname || !lastname || !phoneNumber)
		throw 'Please add data in all the required fields';
	if (email === ' ' || password === ' ' || firstname === ' ' || lastname === ' ' || phoneNumber === ' ')
		throw 'Please input valid data in the required fields';
	if (
		!(typeof email === 'string') ||
		!(typeof password === 'string') ||
		!(typeof firstname === 'string') ||
		!(typeof lastname === 'string') ||
		!(typeof phoneNumber === 'string')
	)
		throw 'Please input valid data in the required fields';
	if (email.search(/[a-z][a-z0-9]+@stevens\.edu/i) === -1) throw 'Please enter your stevens.edu id for signing up';
	if (password.length < 8 || password.length > 15) throw 'Your Password should have min 8 to maximum 15 characters';
	if (password.search(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,15}/) === -1)
		throw 'your password must contain at least one number and one uppercase and lowercase letter, and at least 8 or more characters';
	if (phoneNumber.search(/^\((\d{3})\)(\d{3})-(\d{4})$/) === -1)
		throw 'please input your phoneNumber in (xxx)xxx-xxxx format';
}

async function addUser(email, password, firstname, lastname, phoneNumber) {
	checkUserData(email, password, firstname, lastname, phoneNumber);
	const userCollection = await users();
	email = email.toLowerCase();
	const user = await userCollection.findOne({ email: email });
	if (user) {
		throw 'User exists with this email, please signup with a different email';
	}
	const hashPassword = await bcrypt.hash(password, saltRounds);

	let newUser = {
		firstname: firstname,
		lastname: lastname,
		phoneNumber: phoneNumber,
		posts: [],
		email: email,
		hashedPwd: hashPassword,
		gender: '',
		DOB: '',
		userName: '',
		bio: '',
		profilePic: '/public/img/default.png',
		posts: [],
		threads: [],
		friends: [],
		anonymous: false
	};
	const newInsertInformation = await userCollection.insertOne(newUser);
	if (newInsertInformation.insertedCount === 0) throw 'Insert failed!';
	return 'Inserted successfully!';
}
async function authenticateUser(email, password) {
	if (!email || !password) throw 'You must supply both username and password';
	if (email === ' ' || password === ' ') throw 'You must supply valid username or password';
	if (!(typeof email === 'string') || !(typeof password === 'string'))
		throw 'You must supply valid username or password';
	if (email.search(/[a-z][a-z0-9]+@stevens\.edu/i) === -1) throw 'You must supply valid username or password';
	if (password.length < 8 || password.length > 15) throw 'You must supply valid username or password';
	email = email.toLowerCase();
	const userCollection = await users();
	const user = await userCollection.findOne({ email: email });
	if (user) {
		let match = await bcrypt.compare(password, user.hashedPwd);
		if (match) {
			return { authenticated: true, user: user };
		}
	}
	throw 'Invalid Username or password';
}
module.exports = {
	addUser,
	checkUserData,
	authenticateUser
};
