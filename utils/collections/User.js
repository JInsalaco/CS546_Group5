const md5 = require('blueimp-md5');

class User {
	constructor(obj = {}) {
		const {
			firstname,
			lastname,
			email,
			phoneNumber,
			hashedPwd,
			gender,
			DOB,
			userName,
			bio,
			profilePic,
			posts,
			threads,
			friends,
			anonymous
		} = obj;
		this.firstname = firstname ?? '';
		this.lastname = lastname ?? '';
		this.phoneNumber = phoneNumber ?? '';
		this.email = email ?? '';
		this.hashedPwd = md5(hashedPwd) ?? '';
		this.gender = gender ?? '';
		this.DOB = DOB ?? '';
		this.userName = userName ?? '';
		this.bio = bio ?? '';
		this.profilePic = profilePic ?? '';
		this.posts = posts ?? [];
		this.threads = threads ?? [];
		this.friends = friends ?? [];
		this.anonymous = anonymous ?? false;
	}
}

module.exports = User;
