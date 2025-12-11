const mongoose = require('mongoose');
const Club = require('./models/clubModel');
const Event = require('./models/event');
const User = require('./models/user'); // Required for populate if user is needed, though we just need event population

const mongoURL = 'mongodb://localhost:27017/universityPortal';

async function debugEvents() {
    try {
        await mongoose.connect(mongoURL);
        console.log('Connected to DB');

        const clubs = await Club.find({});
        console.log(`Found ${clubs.length} clubs.`);

        for (const club of clubs) {
            console.log(`Club: ${club.name} (${club._id})`);
            console.log('Raw events array:', club.events);

            const populatedClub = await Club.findById(club._id).populate('events');
            console.log('Populated events array:', populatedClub.events);

            if (populatedClub.events.length > 0) {
                console.log('Sample event:', populatedClub.events[0]);
            }
            console.log('-----------------------------------');
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.connection.close();
        console.log('Connection closed');
    }
}

debugEvents();
