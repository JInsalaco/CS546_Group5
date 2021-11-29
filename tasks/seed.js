const dbConnection = require('../config/mongoConnection');
const utils = require('../data/utils');
const data = require('../data/');
const users = data.users;
const posts = data.posts;
const topics = data.topics;

async function main() {
    const db = await dbConnection();
    await db.dropDatabase();

    // Load Default Topics
    // try {
    //     await topics.loadDefaultTopics();
    // } catch(e) {
    //     console.log(e);
    // }
    try{
        const topicList = [
            {
                title: "School Life",
                description: "Students express how they feel being a college student at Stevens"
            },
            {
                title: "Courses",
                description: "Posts based on different courses"
            },
            {
                title: "Events",
                description: "Posts based on different events held by Stevens"
            },
            {
                title: "Activities",
                description: "Posts based on activites set up by the Stevens Community"
            },
            {
                title: "Announcement",
                description: "Posts based on important announcements made the university"
            },
            {
                title: "Social",
                description: "Posts for Stevens students to interact with one another"
            },
            {
                title: "Career",
                description: "Posts based on career development"
            }
        ];
        
    
        for(let i=0;i<topicList.length; i++){
            let topic = await topics.addTopic(topicList[i].title,topicList[i].description);
        }        
      
       }
       catch(e){
           console.log(e);
       }
    // Add user 1
    try {
        const user = await users.addUser('jdiaz6@stevens.edu', 'Baseball123', 'Javier', 'Diaz', '(201)790-0190');
        const post1 = await posts.addPost(user._id, "My First Post", "This pond application is amazing");
        const post2 = await posts.addPost(user._id, "My Second Post", "I have a topic", ["School Life"]);
        const newUser = await users.editUser(user._id, 'jdiaz6@stevens.edu', 'Baseball123', 'Javier', 'Diaz', '(201)790-0190', 'Male', '08/27/2000', 'javierdiaz13', "I love empanadas");
        // const deletedPost = await posts.deletePost(post1._id);
        // const editedPost = await posts.editPost(user._id ,post2._id, post2.title, "New body", ['Courses'])
    } catch(e) {
        console.log(e);
    }

    // Add user 2
    try {
        const user = await users.addUser('mscott5@stevens.edu', '098234mS', 'Michael', 'Scott', '(973)865-9942')
    } catch(e) {
        console.log(e);
    }

    // Add user 3
    try {
        const user = await users.addUser('dshrute21@stevens.edu', 'beets85Beets', 'Dwight', 'Shrute', '(973)865-9942')
    } catch(e) {
        console.log(e);
    }

    // Add user 4
    try {
        const user = await users.addUser('hhutty7@stevens.edu', 'Ps2000HH', 'Ha-mil', 'Hutty', '(201)509-1386')
        const deletedUser = await users.deleteUser(user._id);
    } catch(e) {
        console.log(e);
    }

    // Add user 5
    try {
        const user = await users.addUser('gwashi999@stevens.edu', 'USArocks101', 'George', 'Washington', '(001)000-0001')
    } catch(e) {
        console.log(e);
    }

    // Add user 5
    // try {
    //     const users = await users.getAllUsers();
    // } catch(e) {
    //     console.log(e);
    // }

    console.log('Done seeding database');
    await db.serverConfig.close();   
}

main().catch(console.log);