const router = require('express').Router();

// @route api/auth
// @desc retrieves auth data
// @access api/public

router.route('/').get((req, res) => res.send('auth route hit'));

module.exports = router;
