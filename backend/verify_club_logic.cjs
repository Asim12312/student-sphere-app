const axios = require('axios');
const mongoose = require('mongoose');

// Helper to create a user
async function createUser(username, email) {
    try {
        // Minimal user creation via direct DB or API. 
        // Let's assume we can use the signup API or just mock IDs if we were using DB directly.
        // But to test routes, we need real interactions.
        // Let's use the login/signup routes if possible, or just hack it by accessing DB directly?
        // Accessing DB directly is easier for setup if connect DB.
        // But I'll use the running server to be safe, assuming I can create users?
        // Actually, let's just use existing users if I can find them, or create dummy ones via DB.
        // Since I don't know the password for existing users, I'll create new ones via DB directly.

        const User = require('./models/user');
        const user = new User({
            username,
            userEmail: email,
            password: 'password123',
            gender: 'other'
        });
        await user.save();
        return user;
    } catch (e) {
        if (e.code === 11000) {
            const User = require('./models/user');
            return await User.findOne({ userEmail: email });
        }
        throw e;
    }
}

async function run() {
    let userA, userB;
    try {
        await mongoose.connect('mongodb://localhost:27017/universityPortal');
        console.log('Connected to DB');

        userA = await createUser('UserA_Test', 'usera_test@example.com');
        userB = await createUser('UserB_Test', 'userb_test@example.com');

        console.log(`User A: ${userA._id}`);
        console.log(`User B: ${userB._id}`);

        // 1. User A creates a PRIVATE club
        const Club = require('./models/clubModel');
        const Notification = require('./models/notificationModel');

        // Cleanup previous test data
        await Club.deleteMany({ name: 'Test Private Club' });
        await Notification.deleteMany({ recipient: { $in: [userA._id, userB._id] } });

        // Using axios for routes
        try {
            const createClubRes = await axios.post('http://localhost:3001/club/createClub', {
                name: 'Test Private Club',
                description: 'A test private club',
                createdBy: userA._id,
                privacy: 'private'
            }, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        } catch (e) {
            console.log("Expected failure for createClub without image", e.message);
        }
        // deleted catch block

        // Direct DB creation for club
        // deleted duplicate Club
        const club = new Club({
            name: 'Test Private Club',
            description: 'A test private club',
            imageURL: 'http://example.com/image.png',
            createdBy: userA._id,
            privacy: 'private'
        });
        await club.save();
        console.log(`Club Created: ${club._id} (Private)`);

        // 2. User B requests to join
        console.log("User B requesting to join...");
        const joinRes = await axios.post('http://localhost:3001/handleMember/joinClub', {
            userId: userB._id,
            clubId: club._id
        });
        console.log("Join Response:", joinRes.data);

        if (joinRes.data.message !== 'Join request sent successfully') {
            throw new Error('Failed to send join request');
        }

        // 3. Verify Notification for User A
        // deleted duplicate Notification require
        const notifA = await Notification.findOne({ recipient: userA._id, type: 'JOIN_REQUEST' });
        if (!notifA) throw new Error('Notification for User A not found');
        console.log("Notification found for User A:", notifA.message);

        // 4. User A approves request
        console.log("User A approving request...");
        const approveRes = await axios.post('http://localhost:3001/clubRequest/approveRequest', {
            clubId: club._id,
            userId: userB._id,
            adminId: userA._id
        });
        console.log("Approve Response:", approveRes.data);

        // 5. Verify User B is member
        const updatedClub = await Club.findById(club._id);
        const isMember = updatedClub.members.some(m => m.toString() === userB._id.toString());
        console.log("User B is member?", isMember);
        if (!isMember) throw new Error('User B is not a member after approval');

        // 6. Verify Notification for User B
        const notifB = await Notification.findOne({ recipient: userB._id, type: 'REQUEST_APPROVED' });
        if (!notifB) throw new Error('Notification for User B not found');
        console.log("Notification found for User B:", notifB.message);

        console.log("VERIFICATION SUCCESSFUL");
        process.exit(0);
    } catch (e) {
        console.error("Verification Runtime Error:", e);
        process.exit(1);
    }
}

run().catch(e => {
    console.error("VERIFICATION FAILED", e);
    process.exit(1);
});
