const express = require("express");
const router = new express.Router();
const User = require("../models/user");
const jwt = require("jsonwebtoken");



/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/

router.post('/login', async (req, res, next) => {
    try {
      const { username, password } = req.body;
      const user = await User.authenticate(username, password);
      if (user) {
        const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET);
        await User.updateLoginTimestamp(user.username);
        return res.json({ token });
      } else {
        return res.status(400).json({ message: 'Invalid username/password' });
      }
    } catch (err) {
      return next(err);
    }
});

/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */

router.post('/register', async (req, res, next) => {
    try {
      const { username, password, first_name, last_name, phone } = req.body;
      const user = await User.register({ username, password, first_name, last_name, phone });
      if (user) {
        const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET);
        await User.updateLoginTimestamp(user.username);
        return res.json({ token });
      } else {
        return res.status(400).json({ message: 'Registration failed' });
      }
    } catch (err) {
      return next(err);
    }
});

module.exports = router;