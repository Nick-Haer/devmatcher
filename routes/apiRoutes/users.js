const router = require('express').Router();
const { check, validationResult } = require('express-validator/check');

// @route api/users
// @desc registers users
// @access public

router.route('/').post(
  [
    check('name', 'Please enter your name')
      .not()
      .isEmpty(),
    check('email', 'Please enter a correct email').isEmail(),
    check('password', 'passwords must be at least 6 characters long').isLength({
      min: 6,
    }),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ error: errors.array() });
    }
    console.log(req.body);

    const { password } = req.body;
    console.log(password);
    res.send('users route hit');
  }
);

module.exports = router;
