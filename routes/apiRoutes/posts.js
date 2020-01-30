const router = require('express').Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const Post = require('../../models/Posts');

// @route api/posts
// @desc retrieves posts
// @access private

router.post(
  '/',
  auth,
  [
    check('text', 'Text is required')
      .not()
      .isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id, { password: 0 });

      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      });

      const post = await newPost.save();

      res.json(post);
    } catch (error) {
      res.status(500).send('server error');
    }
  }
);

// @route GET api/posts
// @desc Gets all posts
// @access Private

router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find({}).sort({ date: -1 });
    res.json(posts);
  } catch (error) {
    console.log(error.message);
    res.status(500).send('server error!');
  }
});

// @route GET api/posts/:id
// @desc Gets one post by id
// @access Private

router.get('/:id', auth, async (req, res) => {
  try {
    const post = await Post.find({ _id: req.params.id });
    if (!post) {
      return res.status(404).json('post not found');
    }

    res.json(post);
  } catch (error) {
    if (error.kind === 'ObjectId') {
      res.status(404).send('Post not found');
    }
    console.log(error.message);
    res.status(500).send('server error!');
  }
});

// @route DELETE api/posts/:id
// @desc Deletes one post by id
// @access Private

router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    console.log(post);
    console.log(Object.keys(post));
    //check user
    if (post.user.toString() !== req.user.id) {
      return res
        .status(401)
        .json({ msg: 'not authorized to remove this post' });
    }
    if (!post) {
      return res.status(404).json('post not found');
    }

    await post.remove();

    res.json({ msg: 'post removed' });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      res.status(404).send('Post not found');
    }
    console.log(error.message);
    res.status(500).send('server error!');
  }
});

// @route PUT api/posts/like/:id
// @desc Likes one post by id
// @access Private

router.put('/like/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    console.log(post);

    //check if post has already been liked

    if (
      post.likes.filter(like => like.user.toString() === req.user.id).length > 0
    ) {
      return res.status(400).json({ msg: 'Post already liked' });
    }

    post.likes.unshift({ user: req.user.id });

    await post.save();

    res.json(post.likes);
  } catch (error) {
    console.error(error);
    res.status(400).json('Server error');
  }
});

// @route PUT api/posts/unLike/:id
// @desc Removes one like from one post by id
// @access Private

router.put('/unLike/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    console.log(post);

    //check if post has already been liked

    if (
      post.likes.filter(like => like.user.toString() === req.user.id).length ===
      0
    ) {
      return res.status(400).json({ msg: "Haven't liked post yet" });
    }

    const removedIndex = post.likes
      .map(like => like.user.toString())
      .indexOf(req.user.id);

    post.likes.splice(removedIndex, 1);

    await post.save();

    res.json(post.likes);
  } catch (error) {
    console.error(error);
    res.status(400).json('Server error');
  }
});

// @route POST api/posts/comment/:id
// @desc adds a comment to a post
// @access private

router.post(
  '/comment/:id',
  auth,
  [
    check('text', 'Text is required')
      .not()
      .isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id, { password: 0 });

      const post = await Post.findById(req.params.id);

      console.log('hullo');

      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      };

      await post.comments.unshift(newComment);

      await post.save();

      res.json(post);
    } catch (error) {
      res.status(500).send('server error');
    }
  }
);

// @route DELETE api/posts/comment/:id/:comment_id
// @desc Delete a comment from a post
// @access private

router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    console.log(post);

    const comment = post.comments.find(
      comment => comment.id.toString() === req.params.comment_id
    );

    //make sure comment exists

    if (!comment) {
      return res.status(404).json({ msg: 'comment does not exist' });
    }

    if (comment.user !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    const removedIndex = post.comments
      .map(comment => comment.id.toString())
      .indexOf(req.params.comment_id);

    post.comments.splice(removedIndex, 1);

    await post.save();

    return res.status(200).json(post.comments);
  } catch (error) {
    console.error(error);
    res.status(400).send('server error');
  }
});

module.exports = router;
