const router = require('express').Router();
const { check, validationResult } = require('express-validator/check');
const User = require('../../models/User');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');

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
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ error: errors.array() });
    }
    console.log(req.body);

    const { name, email, password } = req.body;

    try {
      const user = await User.findOne({ email });
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'User already exists in database' }] });
      }

      const avatar = gravatar.url(email, {
        s: '200',
        r: 'pg',
        d: 'mm',
      });

      console.log(avatar);

      // user = new User({
      //   name,
      //   email,
      //   avatar,
      //   password,
      // });

      console.log(password);

      const encryptedPass = await bcrypt.hash(password, 10);

      console.log(encryptedPass);

      const currentUser = await User.create({
        name,
        email,
        avatar,
        password: encryptedPass,
      });

      console.log(currentUser.id);

      const payload = {
        user: {
          id: currentUser.id,
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
