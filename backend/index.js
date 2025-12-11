require('dotenv').config();
const express = require('express')
const app = express();
const db = require('./db');
const cors = require('cors');
const bodyParser = require('body-parser');

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
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
