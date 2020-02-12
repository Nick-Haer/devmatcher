const router = require('express').Router();
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const express = require('express');
const { check, validationResult } = require('express-validator/check');

// @route GET api/profile/me
// @desc retrieves profile info
// @access api/private

router.route('/me').get(auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate('user', ['name', 'avatar']);
    if (!profile) {
      return res.status(400).json({ msg: 'no profile found' });
    }
    console.log(profile);
    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).send('server error');
  }
});

// @route GET api/profile
// @desc Retrieves all profiles
// @access public

router.route('/').get(async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', ['name', 'avatar']);
    console.log(profiles);
    res.status(200).json(profiles);
  } catch (error) {
    console.error(error);
    res.status(400).json('Server Error');
  }
});

// @route GET api/profile/user/:user_id
// @desc Retrieves all profiles
// @access public

router.route('/user/:user_id').get(async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate('user', ['name', 'avatar']);

    if (!profile) {
      return res.status(400).json({ msg: 'no profile found' });
    }
    console.log(profile);
    res.status(200).json(profile);
  } catch (error) {
    console.log(error.kind);
    if (error.kind == 'ObjectId') {
      return res.status(400).json({ msg: 'no profile found' });
    }
    console.error(error);
    res.status(400).json('Server Error');
  }
});

// @route POST api/profile
// @desc Creates or updates user profile
// @access private

router.route('/').post(
  [
    auth,
    [
      check('status', 'Status is required')
        .not()
        .isEmpty(),
      check('skills', 'Skills required')
        .not()
        .isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = await validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      handle,
      company,
      website,
      location,
      status,
      skills,
      bio,
      githubusername,
      youtube,
      twitter,
      facebook,
      linkedin,
      instagram,
    } = req.body;

    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;

    console.log(req.body);
    if (skills) {
      profileFields.skills = skills.split(',').map(skill => skill.trim());
    }

    profileFields.social = {};

    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;

    try {
      let profile = await Profile.findOne({ user: req.user.id });

      if (profile) {
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );

        return res.status(200).json(profile);
      }

      profile = await Profile.create({
        user: req.user.id,
        ...profileFields,
      });

      res.json(profile);
    } catch (error) {
      console.error(error);
      res.status(500).send('server error');
    }
  }
);

// @route Delete api/profile
// @desc Deletes user, profile, and posts
// @access private

router.route('/').delete(auth, async (req, res) => {
  try {
    await Profile.findOneAndRemove({
      user: req.user.id,
    });
    await User.findOneAndRemove({ _id: req.user.id });

    res.status(200).json({ msg: 'user and profile deleted' });
  } catch (error) {
    console.log(error.kind);
    if (error.kind == 'ObjectId') {
      return res.status(400).json({ msg: 'no profile found' });
    }
    console.error(error);
    res.status(400).json('Server Error');
  }
});

// @route PUT api/profile/experience
// @desc Add profile experience
// @access private

router.route('/experience').put(
  [
    auth,
    [
      check('title', 'title is required')
        .not()
        .isEmpty(),
      check('company', 'company is required')
        .not()
        .isEmpty(),
      check('from', 'From date is required')
        .not()
        .isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    } = req.body;

    const newExperience = {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });

      console.log(req.user.id);
      profile.experience.unshift(newExperience);

      await profile.save();

      res.status(200).json(profile);
    } catch (error) {
      console.error(error.message);
      res.status(500).send('server Error');
    }
  }
);

// @route DELETE api/profile/experience/:exp_id
// @desc RAdd profile experience
// @access private

router.route('/experience/:exp_id').delete(auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    console.log(profile);
    const removeAtIndex = profile.experience
      .map(exp => exp.id)
      .indexOf(req.params.exp_id);
    const removedExp = profile.experience.splice(removeAtIndex, 1);
    console.log(removedExp);
    await profile.save();
    res.status(200).json(profile);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});
// @route PUT api/profile/education
// @desc Add profile education element
// @access private

router.route('/education').put(
  [
    auth,
    [
      check('school', 'School is required')
        .not()
        .isEmpty(),
      check('degree', 'Degree is required')
        .not()
        .isEmpty(),
      check('fieldofstudy', 'Field of study is required')
        .not()
        .isEmpty(),
      check('from', 'From date is required')
        .not()
        .isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    } = req.body;

    const newEducation = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });

      console.log(req.user.id);
      profile.education.unshift(newEducation);

      await profile.save();

      res.status(200).json(profile);
    } catch (error) {
      console.error(error.message);
      res.status(500).send('server Error');
    }
  }
);

// @route DELETE api/profile/education/:edu_id
// @desc Remove an array element of education
// @access private

router.route('/education/:exp_id').delete(auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    console.log(profile);
    const removeAtIndex = profile.education
      .map(exp => exp.id)
      .indexOf(req.params.edu_id);
    const removedExp = profile.education.splice(removeAtIndex, 1);
    console.log(removedExp);
    await profile.save();
    res.status(200).json(profile);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
