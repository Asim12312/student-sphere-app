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
app.use('/debug', debugRoutes);

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
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
