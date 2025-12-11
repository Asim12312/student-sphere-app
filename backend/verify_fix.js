const mongoose = require('mongoose');
const Club = require('./models/clubModel');
const Event = require('./models/event');
const User = require('./models/user');

const clubId = '6894892734cfe3491c56bbc2'; // Using one of the existing clubs

async function verifyFix() {
    try {
        await mongoose.connect('mongodb://localhost:27017/universityPortal');
        console.log('Connected to MongoDB');

        // 1. Create a dummy user if not exists (needed for event creation)
        let user = await User.findOne({});
        if (!user) {
            console.log('No user found, creating a temp one...');
            user = await User.create({
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123',
                universityId: '123456'
            });
        }

        // 2. Create a dummy event for the club
        console.log('Creating a test event...');
        const event = new Event({
            title: 'Test Event',
            description: 'This is a test event',
            venue: 'Test Venue',
            startDate: new Date(),
            endDate: new Date(new Date().getTime() + 3600000), // 1 hour later
            capacity: 100,
            ticketPrice: 0,
            createdInClub: clubId,
            createdBy: user._id,
            status: 'approved'
        });
        await event.save();

        // 3. Add event to club
        const club = await Club.findById(clubId);
        club.events.push(event._id);
        await club.save();
        console.log(`Event created (ID: ${event._id}) and added to club ${club.name}`);

        // 4. Simulate the getEvents logic WITH POPULATE
        console.log('Fetching clubs with populate...');
        const clubs = await Club.find({ _id: { $in: [clubId] } }).populate('events');

        const fetchedEvents = clubs.flatMap(c => c.events || []);
        console.log('Fetched Events:', JSON.stringify(fetchedEvents, null, 2));

        if (fetchedEvents.length > 0 && fetchedEvents[0].title === 'Test Event') {
            console.log('SUCCESS: Event fetched and populated correctly!');
        } else {
            console.log('FAILURE: Event not found or not populated.');
        }

        mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

verifyFix();
