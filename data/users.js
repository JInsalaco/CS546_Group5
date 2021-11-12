const mongoCollections = require('../config/mongoCollections');
const users = mongoCollections.users;
// const uuid = require('uuid/v4');
let { ObjectId } = require('mongodb');
const User = require('../utils/collections/User');


module.exports = {
    async addUser(obj){
    const userCollection = await users();
    const newInsertInformation = await userCollection.insertOne(new User(obj));
    // const newInsertInformation = await userCollection.insertOne(newUser);
    if (newInsertInformation.insertedCount === 0) throw 'Insert failed!';
    return "inserted successfully";
}
};