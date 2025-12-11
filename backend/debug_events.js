const mongoose = require('mongoose');
const Club = require('./models/clubModel');
const Event = require('./models/event');

const clubIds = [
    '6894892734cfe3491c56bbc2',
    '6894897b34cfe3491c56bbd0',
    '68948a8bf877eb3ca738ec80',
    '6894895a34cfe3491c56bbc4',
    '6894891434cfe3491c56bbbc'
];

async function checkClubs() {
    try {
        await mongoose.connect('mongodb://localhost:27017/universityPortal');
        console.log('Connected to MongoDB');

        const clubs = await Club.find({ _id: { $in: clubIds } });
        console.log(`Found ${clubs.length} clubs.`);

        for (const club of clubs) {
            console.log(`Club ID: ${club._id}, Name: ${club.name}`);
            console.log(`Events count: ${club.events.length}`);
            console.log(`Events content:`, club.events);
        }

        mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

checkClubs();
