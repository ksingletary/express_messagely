const db = require("../db");
const ExpressError = require("../expressError");
const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR } = require("../config");

/** User class for message.ly */



/** User of the site. */

class User {
 
  static async register({username, password, first_name, last_name, phone}) {
    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
    const result = await db.query(
      `INSERT INTO users (
        username,
        password,
        first_name,
        last_name,
        phone,
        join_at,
        last_login_at)
      VALUES ($1, $2, $3, $4, $5, current_timestamp, current_timestamp)
      RETURNING username, password, first_name, last_name, phone`,
      [username, hashedPassword, first_name, last_name, phone]
    );
    return result.rows[0];
  }


  /** Authenticate: is this username/password valid? Returns user object*/

  static async authenticate(username, password) {
    const result = await db.query(
      `SELECT username, password
       FROM users
       WHERE username = $1`,
      [username]
    );
    const user = result.rows[0];
 
    if (user && await bcrypt.compare(password, user.password)) {
      return user; // Return the user object on successful authentication
    }
    return null; // Return null if authentication fails
  }
 

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    const result = await db.query(
      `UPDATE users
       SET last_login_at = current_timestamp
       WHERE username = $1
       RETURNING username`,
      [username]
    );
    if (!result.rows[0]) {
      throw new ExpressError(`No such user: ${username}`, 404);
    }
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() {
    const result = await db.query(
      `SELECT username, first_name, last_name, phone
       FROM users`
    );
    return result.rows;
  }

  static async get(username) {
    const result = await db.query(
      `SELECT username, first_name, last_name, phone, join_at, last_login_at
       FROM users
       WHERE username = $1`,
      [username]
    );
    const user = result.rows[0];

    if (!user) {
      throw new ExpressError(`No such user: ${username}`, 404);
    }
    return user;
  }

  static async messagesFrom(username) {
    const result = await db.query(
      `SELECT m.id,
              m.to_username,
              u.first_name AS to_first_name,
              u.last_name AS to_last_name,
              u.phone AS to_phone,
              m.body,
              m.sent_at,
              m.read_at
       FROM messages AS m
       JOIN users AS u ON m.to_username = u.username
       WHERE m.from_username = $1`,
      [username]
    );
    return result.rows.map(m => ({
      id: m.id,
      to_user: {
        username: m.to_username,
        first_name: m.to_first_name,
        last_name: m.to_last_name,
        phone: m.to_phone,
      },
      body: m.body,
      sent_at: m.sent_at,
      read_at: m.read_at,
    }));
  }

  static async messagesTo(username) {
    const result = await db.query(
      `SELECT m.id,
              m.from_username,
              u.first_name AS from_first_name,
              u.last_name AS from_last_name,
              u.phone AS from_phone,
              m.body,
              m.sent_at,
              m.read_at
       FROM messages AS m
       JOIN users AS u ON m.from_username = u.username
       WHERE m.to_username = $1`,
      [username]
    );
    return result.rows.map(m => ({
      id: m.id,
      from_user: {
        username: m.from_username,
        first_name: m.from_first_name,
        last_name: m.from_last_name,
        phone: m.from_phone,
      },
      body: m.body,
      sent_at: m.sent_at,
      read_at: m.read_at,
    }));
  }
}


module.exports = User;
