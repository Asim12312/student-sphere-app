const mongoose = require('mongoose');
const User = require('./models/user');

const mongoURL = 'mongodb://localhost:27017/universityPortal';

async function debugUser() {
    try {
        await mongoose.connect(mongoURL);
        console.log('Connected to DB');

        const users = await User.find({});
        console.log(`Found ${users.length} users.`);

        for (const user of users) {
            console.log(`User: ${user.username} (${user._id})`);
            console.log('joinedClubs:', user.joinedClubs);
            console.log('-----------------------------------');
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.connection.close();
        console.log('Connection closed');
    }
}

debugUser();
