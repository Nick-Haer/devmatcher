const auth = require('../../middleware/auth');
const router = require('express').Router();
const { check, validationResult } = require('express-validator/check');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');

// @route api/auth
// @desc retrieves user data, given the web token is correct
// @access api/public

router
  .route('/')
  .get(auth, async (req, res) => {
    try {
      console.log(req.user);
      const user = await User.findById(req.user.id, { password: 0 });
      console.log(user);
      res.status(200).json(user);
    } catch (err) {
      console.error(err);
      res.send('server error');
    }
  })

  // @route api/auth
  // @desc logs the user in, sending a json token with the users encoded id
  // @access public
  .post(
    [
      check('email', 'Please enter a correct email').isEmail(),
      check('password', 'Password Required')
        .exists()
        .isLength({ min: 6 }),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      console.log(errors);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array() });
      }
      console.log(req.body);

      const { email, password } = req.body;

      try {
        const user = await User.findOne({ email });
        if (!user) {
          return res
            .status(400)
            .json({ errors: [{ msg: 'incorrect password or username' }] });
        }
        console.log('check');

        const matching = await bcrypt.compare(password, user.password);

        if (!matching) {
          return res
            .status(400)
            .json({ errors: [{ msg: 'incorrect password or username' }] });
        }

        const payload = {
          user: {
            id: user.id,
          },
        };
        jwt.sign(
          payload,
          config.get('jwtSecret'),
          { expiresIn: 3600000 },
          (err, token) => {
            if (err) {
              console.error(err);
            }
            res.json({ token });
          }
        );
      } catch (err) {
        console.error(err.message);
        res.status(500).send('server error');
      }
    }
  );

module.exports = router;
