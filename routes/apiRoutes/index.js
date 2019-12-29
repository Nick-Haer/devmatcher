const router = require('express').Router();
const authRoutes = require('./auth');
const postsroutes = require('./posts');
const profileRoutes = require('./posts');
const usersRoutes = require('./users');

router.use('/api/auth', authRoutes);
router.use('/api/posts', postsroutes);
router.use('/api/profile', profileRoutes);
router.use('/api/users', usersRoutes);

module.exports = router;
