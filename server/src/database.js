/**
 * For executing SQL queries (prepared statements)
 * @Author James Zhang 
 * @Since October 31, 2023
 */

const { group } = require('console');
const pool = require('./pool.js');
const fs = require('fs/promises');


/**
 * Checks whether user already exists in database 
 * @param {*} credentials : json object {username, email}
 * @param {*} callback    : callback to return result 
 */
const validate_registration = (credentials, callback) => {
    const {username} = credentials; 

    let query = 'SELECT COUNT(*) FROM users WHERE username=(?)';

    pool.query(query, [username], (err,res) => {
        callback(err, res)
    })
} 

/**
 * Adds a user to database 
 * @param {*} credentials : json object {username, email, password hash}
 * @param {*} callback    : callback to return result 
 */
const add_user = (credentials, callback) => {
    const {username, password, salt, public_key, private_key} = credentials; 

    let query = "INSERT INTO users (username, password, salt, public_key, private_key) VALUES (?,?,?,?,?)";

    pool.query(query, [username, password, salt, public_key, private_key], (err,res) => {
        callback(err,res)
    })
}

/**
 * Returns list of all usernames in database 
 * @param {*} callback : callback to return result 
 */
const get_all_usernames = (callback) => {
    let query = 'SELECT username FROM users';

    pool.query(query, (err, res) => {
        callback(err,res)
    })
}

/**
 * Returns user data for a given username 
 * @param {*} username : username (String)
 * @param {*} callback : callback to return result
 */
const get_user = (username, callback) => {
    let query = 'SELECT * FROM users WHERE username=(?)';

    pool.query(query, [username], (err, res) => {
        callback(err, res)
    })
}

/**
 * Retrieves the salt value for a username
 * @param {*} username : username (string)
 */
const get_salt = (username, callback) => {
    let query = 'SELECT salt FROM users WHERE username=(?)';

    pool.query(query, [username], (err,res) => {
        callback(err,res);
    })
}


/**
 * Retrieves all groups 
 */
const get_all_groups = (callback) => {
    let query = 'SELECT * FROM groups';

    pool.query(query, [], (err,res) => {
        callback(err,res)
    })
}

/**
 * Returns group information for all groups that username is a member of 
 * @param {*} username : string username id 
 * @param {*} callback : callback to returns list of group information 
 */
const get_user_groups = (username, callback) => {
    let query = 'SELECT groups.* FROM groups WHERE groups.id IN (SELECT group_id FROM membership WHERE username=(?))';

    pool.query(query, [username], (err,res) => {
        callback(err,res)
    })
}

/**
 * Returns all message objects belonging to particular group, hashed for a specific user 
 * @param {*} id       : group id 
 * @param {*} username : username of user 
 * @param {*} callback 
 */
const get_messages = (id, username, callback) => {
    let query = 'SELECT * FROM messages WHERE key_user=(?) and group_id=(?) ORDER BY datetime ASC';

    pool.query(query, [username, id], (err,res) => {
        callback(err,res)
    })
}

/**
 * Retrieves public keys for all users belonging to particular group 
 * @param {*} id        : id of group 
 * @param {*} callback 
 */
const get_group_keys = (id, callback) => {
    let query = 'SELECT users.public_key, users.username FROM users ' + 
                'INNER JOIN membership ON membership.username=users.username ' + 
                'WHERE membership.group_id=(?)';

    pool.query(query, [id], (err,res) => {
        callback(err,res)
    })
}


/**
 * Stores encrypted messages into database
 * @param {} messages : list of messages object values [[author, content, group_id, key_user, datetime]]
 * @param {*} callback 
 */
const store_message = (messages, callback) => {
    let query = 'INSERT INTO messages (author, content, group_id, key_user, datetime, type, id) VALUES ?';

    pool.query(query, [messages], (err, res) => {
        callback(err,res);
    })
}

/**
 * Stores a new group in database
 * @param {*} data : [id, created, name,]
 * @param {*} callback 
 */
const add_group = (data, callback) => {
    let query = 'INSERT INTO groups (id, created, name) VALUES (?,?,?)';

    pool.query(query, data, (err,res) => {
        callback(err,res)
    })
} 

/**
 * Adds user to group (membership)
 * @param {*} username 
 * @param {*} group_id 
 * @param {*} callback 
 */
const add_user_to_group = (username, group_id, callback) => {
    let query = 'INSERT INTO membership (group_id, username) VALUES (?,?)';

    pool.query(query, [group_id, username], (err,res) => {
        callback(err,res)
    })
}

/**
 * Removes a user from memberships for a particular group
 * @param {*} username 
 * @param {*} group_id 
 * @param {*} callback 
 */
const remove_user_from_group = (username, group_id, callback) => {
    let query = 'DELETE FROM membership WHERE username=(?) AND group_id=(?)';

    pool.query(query, [username, group_id], (err,res) => {
        callback(err,res);
    })
}

/**
 * Removes user account form database
 * @param {*} username 
 * @param {*} callback 
 */
const delete_user = (username, callback) => {
    let query = 'DELETE FROM users WHERE username=(?)';

    pool.query(query, [username], (err,res) => {
        callback(err,res)
    })
}

const delete_message_from_group = (author, type, group_id, callback) => {
    let query = 'DELETE FROM messages WHERE author=(?) AND type=(?) AND group_id=(?)';

    pool.query(query, [author, type, group_id], (err,res) => {
        callback(err,res)
    })
}

const delete_message = (author, callback) => {
    let query = 'DELETE FROM messages WHERE author=(?)';

    pool.query(query, [author], (err,res) => {
        callback(err,res);
    })
}

const get_group_members = (group_id, callback) => {
    let query = 'SELECT username FROM membership WHERE group_id=(?)';

    pool.query(query,[group_id], (err,res) => {
        callback(err,res)
    })
}


module.exports = {
    validate_registration,
    add_user,
    get_all_usernames,
    get_user,
    get_salt,
    get_all_groups,
    get_user_groups,
    get_messages,
    get_group_keys,
    store_message,
    add_group,
    add_user_to_group,
    remove_user_from_group,
    delete_user,
    delete_message,
    get_group_members,
    delete_message_from_group
}