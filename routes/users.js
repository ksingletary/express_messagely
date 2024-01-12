const express = require('express');
const router = express.Router();
const User = require('../models/user');
const { ensureLoggedIn, ensureCorrectUser } = require('../middleware/auth');

// GET / - get list of users.
router.get('/', ensureLoggedIn, async (req, res, next) => {
  try {
    const users = await User.all();
    return res.json({ users });
  } catch (err) {
    return next(err);
  }
});

// GET /:username - get detail of users.
router.get('/:username', ensureLoggedIn, ensureCorrectUser, async (req, res, next) => {
  try {
    const user = await User.get(req.params.username);
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});

// GET /:username/to - get messages to user
router.get('/:username/to', ensureLoggedIn, ensureCorrectUser, async (req, res, next) => {
  try {
    const messages = await User.messagesTo(req.params.username);
    return res.json({ messages });
  } catch (err) {
    return next(err);
  }
});

// GET /:username/from - get messages from user
router.get('/:username/from', ensureLoggedIn, ensureCorrectUser, async (req, res, next) => {
  try {
    const messages = await User.messagesFrom(req.params.username);
    return res.json({ messages });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;