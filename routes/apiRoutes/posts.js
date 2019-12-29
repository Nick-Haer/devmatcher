const router = require('express').Router();

// @route api/posts
// @desc retrieves posts
// @access api/public

router.route('/').get((req, res) => res.send('posts route hit'));

module.exports = router;
