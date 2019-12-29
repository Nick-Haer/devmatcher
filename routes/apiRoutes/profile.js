const router = require('express').Router();

// @route api/profile
// @desc retrieves profile info
// @access api/private

router.route('/').get((req, res) => res.send('profile route hit'));

module.exports = router;
