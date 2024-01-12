const express = require('express');
const router = express.Router();
const Message = require('../models/message');
const { ensureLoggedIn, ensureCorrectUser } = require('../middleware/auth');

// GET /:id - get detail of message.
router.get('/:id', ensureLoggedIn, async (req, res, next) => {
  try {
    const message = await Message.get(req.params.id);
    return res.json({ message });
  } catch (err) {
    return next(err);
  }
});

// POST / - post message.
router.post('/', ensureLoggedIn, async (req, res, next) => {
  try {
    const { from_username, to_username, body } = req.body;
    const message = await Message.create({ from_username, to_username, body });
    return res.json({ message });
  } catch (err) {
    return next(err);
  }
});

// POST/:id/read - mark message as read
router.post('/:id/read', ensureLoggedIn, async (req, res, next) => {
  try {
    const message = await Message.markRead(req.params.id);
    return res.json({ message });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;