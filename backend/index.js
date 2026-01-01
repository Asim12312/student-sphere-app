require('dotenv').config();
const express = require('express')
const app = express();
const db = require('./db');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const { Server } = require('socket.io');

// Middleware configuration
app.use(bodyParser.json());
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// Handle trailing slashes - remove them to prevent 301 redirects
app.use((req, res, next) => {
  if (req.path.endsWith('/') && req.path.length > 1) {
    const query = req.url.slice(req.path.length);
    res.redirect(301, req.path.slice(0, -1) + query);
  } else {
    next();
  }
});
const uploadRoutes = require('./routes/admin/adminNotes');
const userRoutes = require('./routes/userRoutes')
const categoryRoutes = require('./routes/admin/categories');
const sellProduct = require('./routes/user/sellProduct')
const getProducts = require('./routes/user/getProducts');
const review = require('./routes/user/Review');
const cart = require('./routes/user/handleCart');
const stripeRoutes = require('./routes/user/stripeRoutes');
const checkoutRoutes = require('./routes/user/checkoutRoutes');
const handleClubRoutes = require('./routes/user/club_routes/handleClubRoutes');
const handleClubMembers = require('./routes/user/club_routes/handleClubMembers')
const handleClubPosts = require('./routes/user/club_routes/handleClubPosts')
const eventFunctions = require('./routes/user/event_routes/handleEventFunctions')
const notificationRoutes = require('./routes/user/notificationRoutes');
const handleClubRequests = require('./routes/user/club_routes/handleClubRequests');
const debugRoutes = require('./routes/user/debugRoutes');
const blogRoutes = require('./routes/user/blogRoutes');
const forumRoutes = require('./routes/user/forumRoutes');

const chatRoutes = require('./routes/user/club_routes/chatRoutes');
const trendRoutes = require('./routes/user/trendRoutes');
const socialRoutes = require('./routes/user/socialRoutes');
const profilePostRoutes = require('./routes/user/profilePostRoutes');

app.use('/file', uploadRoutes);
app.use('/user', userRoutes);
app.use('/category', categoryRoutes);
app.use('/sell', sellProduct);
app.use('/products', getProducts);
app.use('/products', review);
app.use('/cart', cart);
app.use('/stripe', stripeRoutes);
app.use('/checkout', checkoutRoutes);
app.use('/club', handleClubRoutes);
app.use('/handleMember', handleClubMembers)
app.use('/post', handleClubPosts);
app.use('/eventFunctions', eventFunctions);
app.use('/notifications', notificationRoutes);
app.use('/clubRequest', handleClubRequests);
app.use('/debug', debugRoutes);
app.use('/blogs', blogRoutes);
app.use('/trends', trendRoutes);
app.use('/social', socialRoutes);
app.use('/profile-posts', profilePostRoutes);
app.use('/forum', forumRoutes);
app.use('/chat', chatRoutes);

// Create HTTP server and attach Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*'
  }
});

// Expose io and a user->sockets map globally so route handlers can emit events
global.io = io;
global.userSockets = new Map();

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);
  // Expect the client to send the userId as a query param
  const userId = socket.handshake.query?.userId;
  if (userId) {
    const idStr = userId.toString();
    const existing = global.userSockets.get(idStr) || [];
    existing.push(socket.id);
    global.userSockets.set(idStr, existing);
    console.log(`User ${idStr} associated with socket ${socket.id}`);
  }

  socket.on('disconnect', () => {
    // Remove socket from any user mapping
    for (const [uid, arr] of global.userSockets.entries()) {
      const filtered = arr.filter(sid => sid !== socket.id);
      if (filtered.length === 0) global.userSockets.delete(uid);
      else global.userSockets.set(uid, filtered);
    }
    console.log('Socket disconnected:', socket.id);
  });

  // --- Club Chat Events ---
  const Message = require('./models/messageModel');

  socket.on('join_club_room', (clubId) => {
    socket.join(clubId);
    console.log(`Socket ${socket.id} joined club room: ${clubId}`);
  });

  socket.on('leave_club_room', (clubId) => {
    socket.leave(clubId);
    console.log(`Socket ${socket.id} left club room: ${clubId}`);
  });

  socket.on('send_club_message', async (data) => {
    // data: { clubId, senderId, content, senderName, senderPic }
    try {
      const { clubId, senderId, content } = data;

      // Save to DB
      const newMessage = new Message({
        clubId,
        sender: senderId,
        content
      });
      await newMessage.save();

      // Broadcast to room (including sender)
      // We attach sender info for immediate display
      const messageToEmit = {
        _id: newMessage._id,
        clubId,
        sender: { _id: senderId, username: data.senderName, profilePicture: data.senderPic },
        content,
        createdAt: newMessage.createdAt
      };

      io.to(clubId).emit('receive_club_message', messageToEmit);

    } catch (err) {
      console.error('Error sending message:', err);
    }
  });

});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
