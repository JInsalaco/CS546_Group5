const { users } = require('../config/mongoCollections');
const User = require('../utils/collections/User');
const bcrypt = require('bcrypt');
const saltRounds = 16;

 function checkUserData(email,password,firstname,lastname,phoneNumber){
    if(!email || !password || !firstname || !lastname || !phoneNumber)
        throw "Please add data in all the required fields";
    if(email===" " || password===" " || firstname=== " " || lastname=== " " || phoneNumber === " ")
        throw "Please input valid data in the required fields";
    if(email.search(/[a-z][a-z0-9]+@stevens.edu/i) === -1)
        throw "Please enter your stevens.edu id for signing up";
    if(password.length < 8 || password.length > 15)
        throw "Your Password should have min 8 to maximum 15 characters";
    if(password.search(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/) === -1)
        throw "your password must contain at least one number and one uppercase and lowercase letter, and at least 8 or more characters"
}

    async function addUser(email,password,firstname,lastname,phoneNumber){
        try{
        checkUserData(email,password,firstname,lastname,phoneNumber);
        const userCollection = await users();
        email = email.toLowerCase();
        const user = await userCollection.findOne({ email: email });  
        if(user){
              throw "User exists with this email, please signup with a different email";
            }
        const hashPassword = await bcrypt.hash(password, saltRounds);
        
            let newUser = {
                firstname: firstname,
                lastname: lastname,
                phoneNumber: phoneNumber,
                posts: [],
                email : email,
                hashedPwd :hashPassword,
                gender : "",
                DOB : "",
                userName : "",
                bio : "",
                profilePic :"",
                posts : [],
                threads : [],
                friends : [],
                anonymous : false
            }; 
        // const userCollection = await users();
        const newInsertInformation = await userCollection.insertOne(newUser);
        // const newInsertInformation = await userCollection.insertOne(newUser);
        if (newInsertInformation.insertedCount === 0) throw 'Insert failed!';
        return "inserted successfully";
        }
        catch(e){
            // console.log(e);
            throw e;
        }
}
module.exports = {
    addUser,
    checkUserData
}
