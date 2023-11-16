/**
 * Contains routes for handling <>
 * 
 * @Author James Zhang
 * @Since November 1, 2023
 */


const express = require("express");
var router = express.Router();

const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const { v1: uuidv1 } = require("uuid");

const db = require('./../database');
const jwtTokens = require('./../authentication/token');
const authentication = require('./../authentication/authentication');

const {client_port, client_url, full_url} = require('./../config')

//####################################
// Middleware
//####################################
const origins = [
    "http://localhost:" + client_port,
    "http://127.0.0.1:" + client_port
];

router.use(
    cors({
        origin: origins,
        credentials: true,
    })
);


//####################################
// Helper Functions 
//####################################

/**
 * For decoding token 
 * @param {*} token 
 * @returns 
 */
const parseJwt = (token) => {
    try {
        return JSON.parse(atob(token.split(".")[1]));
    } catch (e) {
        return null;
    }
};

/**
 * Checks whether a given username is a member of a given group
 * @param {*} group_id 
 * @param {*} user_id 
 * @returns 
 */
const check_group_membership = (group_id, user_id) => {
    return new Promise((resolve, reject) => {
        try {
            db.get_group_members(group_id, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    for (let i = 0; i < result.length; i++) {
                        if (result[i].username == user_id) {
                            resolve(true);
                        }
                    }
                    resolve(false);
                }
            });
        } catch (err) {
            reject(err);
        }
    });
};

//###################################
// Router Handlers 
//###################################

/**
 * Handles registering new user : 
 * 1) Checks if username/email already exists 
 * 2) Stores user credentials with hashed password in database 
 * 3) Creates access token based on user credentials and sends tokens back to user 
 * 
 * Arguments:
 *      req.body = {username, email, password}
 */
router.post('/register', async (req,res) => {
    console.log('POST : /register')

    const {email, username, password, salt, public_key, private_key} = req.body;

    try {
        db.validate_registration(req.body, async (err, res1) => {
            if (err) {
                res.status(500).send('Error : please try again')
            } else if (!res1) {
                res.status(500).send('Error : username or email already taken');
            } else {
                // Hash password
                const password_hash = await bcrypt.hash(password, 16)

                const credentials = {
                    username : username,
                    email : email,
                    password : password_hash,
                    salt:salt,
                    public_key:public_key,
                    private_key:private_key
                }

                db.add_user(credentials, (err2, res2) => {
                    if (err2) {
                        console.log(err2)
                        res.status(500).send('Error : please try again')
                    } 
                    else {
                        let tokens = jwtTokens.jwtCodes(username, email); // generate refresh and access token

                        res.cookie('refresh_token', tokens.refreshToken, {httpOnly:true, sameSite:'Strict', secure:true})
                        res.cookie('access_token', tokens.accessToken, {httpOnly:true, sameSite:'Strict', secure:true})

                        let obj = {
                            username : username,
                            email : email,
                            private_key : private_key,
                            public_key : public_key
                        }

                        res.json(obj);
                    }
                })
            }
        })
    } catch (err) {
        console.error(err)
        res.status(500).send('Invalid credentials, please try again!')
    }
})

/**
 * Route handler for login request 
 * 1) Checks if username exists 
 * 2) Checks password hashes 
 * 3) returns user data to client on success
 */
router.post('/login', async (req,res) => {
    console.log('POST : /login')

    try{
        const {username, password} = req.body;

        db.get_user(username, async (err, result) => {
            if (err) {
                console.error(err);
                res.status(500).send('Check Username!');
            } else {
                if (result.length == 0) {
                    res.status(500).send('Check Username!');
                } else{

                    // Compare password hashes 
                    if (await bcrypt.compareSync(password,result[0].password)){
                        let tokens = jwtTokens.jwtCodes(
                            result[0].username,
                            result[0].email,
                        )

                        res.cookie('refresh_token', tokens.refreshToken, {httpOnly:true, sameSite:'Strict', secure:true})
                        res.cookie('access_token', tokens.accessToken, {httpOnly:true, sameSite:'Strict', secure:true})

                        let obj = {
                            username : username,
                            email : result[0].email,
                            private_key : result[0].private_key,
                            public_key : result[0]. public_key
                        }

                        res.json(obj);
                    } else {
                        res.status(500).send('Check Password!')
                    }
                }
            }
        })
    } catch (err) {
        console.error(err)
    }
})


router.post('/logout', (req,res) => {
    console.log('POST : /logout');

    const cookieNames = Object.keys(req.cookies);

    cookieNames.forEach((name) => {
        res.clearCookie(name, {httpOnly:true})
    })

    res.status(200).send('Success')
})

/**
 * Retrieves salt value for a user
 */
router.post('/salt', async (req,res) => {
    console.log('POST : /salt');

    const {username} = req.body;

    try {
        db.get_salt(username, (err,result) => {
            if (err) {
                console.log(err);
                res.status(500).send('Failed to retrieve salt, please check username');
            } else{
                res.status(200).send(result[0])
            }
        })
    } catch (err) {
        console.log(err)
        res.status(500).send('Failed to retrieve salt, please check username');
    }    
})

/**
 * Retrieves all groups 
 */
router.post('/allgroups', authentication.authenticateToken, async (req,res) => {
    console.log('POST : /allgroups')

    try{
        db.get_all_groups((err, result) => {
            if (err){
                console.log(err);
                res.status(500).send('Failure! Please reload page and try again.');
            } else {
                res.status(200).send(result);
            }
        })
    } catch (err) {
        console.log(err)
        res.status(500).send('Failure! Please reload page and try again.');
    }
})

/**
 * Retrieves all of a users groups 
 */
router.post('/usergroups', authentication.authenticateToken, async (req,res) => {
    console.log('POST : /usergroups');

    const {username} = req.body;

    const {access_token} = req.cookies;

    const user_id = parseJwt(access_token).username; 

    if (user_id == username){
        try {
            db.get_user_groups(username, (err,result) => {
                if (err) {
                    console.log(err);
                    res.status(500).send('Failure! Please reload page and try again.');
                } else {
                    res.status(200).send(result);
                }
            })
        } catch (err){
            console.log(err);
            res.status(500).send('Failure! Please reload page and try again.');
        }
    } else {
        res.status(500).send('Can only retrieve your own groups')
    }
})

/**
 * For retrieving group messages, encrypted for a particular user 
 */
router.post('/getMessages', authentication.authenticateToken, async (req,res) => {
    console.log('POST : /getMessages');

    const {username, group_id} = req.body;

    try {
        db.get_messages(group_id, username, (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).send("Failure to retrieve messages. Please try again!")
            } else {
                console.log(result)
                res.status(200).send(result);
            }
        })
    } catch (err) {
        console.log(err);
        res.status(500).send("Failure to retrieve messages. Please try again!")
    }
})

/**
 * For retrieveing public keys of members belonging to particular group 
 */
router.post('/getGroupKeys', authentication.authenticateToken, async (req,res) => {
    console.log('POST : /getGroupkeys');

    const {username, group_id} = req.body;

    try{
        db.get_group_keys(group_id, (err,result) => {
            if (err) {
                console.log(err);
                res.status(500).send('Faliure retrieving keys : please try again');
            } else {
                res.status(200).send(result)
            }
        })
    } catch (err) {
        console.log(err);
        res.status(500).send('Faliure retrieving keys : please try again');
    }
})

/**
 * Route Handler for storing messages 
 */
router.post('/sendMessage', authentication.authenticateToken, async (req,res) => {
    console.log('POST : /sendMessage');

    const {messages} = req.body;
    const {access_token} = req.cookies;

    const user_id = parseJwt(access_token).username; 

    let message_id = uuidv1();

    sql_messages = messages.map((obj) => {
        let values = Object.values(obj);
        values.push(message_id);
        return values
    })


    try {
        db.store_message(sql_messages, (err,result) => {
            if(err) {
                console.log(err);
                res.status(500).send('Failure to send message : please try again!')
            } else {
                messages.id = message_id;
                res.status(200).send(messages)
            }
        })
    } catch (err) {
        console.log(err)
        res.status(500).send('Failure to send message : please try again!')
    }
})


/**
 * Route handler for adding a newly created group to database 
 */
router.post('/addGroup', authentication.authenticateToken, async (req,res) => {
    console.log('POST : /addGroup');

    const {name, username, datetime} = req.body;

    let group_id = uuidv1();

    try {   
        db.add_group([group_id, datetime, name], (err,result) => {
            if (err) {
                console.log(err);
                res.status(500).send('Failure to create group : please try again!')
            } else {
                db.add_user_to_group(username, group_id, (err2, result2) => {
                    if(err2) {
                        console.log(err2);
                        res.status(500).send('Failure to add user to group!')
                    } else {
                        let obj = {
                            id : group_id,
                            created : datetime,
                            name : name,
                            member:true
                        }
                        res.status(200).json(obj);
                    }
                })
            }
        })
    } catch (err) {
        console.log(err);
        res.status(500).send('Failure to create group : please try again!')
    }
})


/**
 * Route handler for removing user from a group
 */
router.post('/leaveGroup', authentication.authenticateToken, async (req, res) => {
    console.log('POST : /leaveGroup');

    const {username, group_id} = req.body;
    const {access_token} = req.cookies;

    const user_id = parseJwt(access_token).username; 

    if (username == user_id){
        try {
            db.remove_user_from_group(username, group_id, (err, result) => {
                if (err) {
                    console.log(err);
                    res.status(500).send('Error removing user from group! Please try again.');
                } else {
                    res.status(200).send('Successfully removed user from group');
                }
            })
        } catch (err) {
            console.log(err);
        }
    }
})

/**
 * Route handler from deleting user from application
 */
router.post('/deleteUser', authentication.authenticateToken, async (req,res) => {
    console.log('POST : /deleteUser');

    const {username} = req.body; 

    const {access_token} = req.cookies;

    const user_id = parseJwt(access_token).username; 

    if (username == user_id) {
        try{
            db.delete_user(username, (err,result) => {
                if(err) {
                    console.log(err);
                    res.status(500).send('Failure to delete user');
                } else {
                    res.status(200).send('Success')
                }
            })
        } catch (err) {
    
        }
    } else {
        res.status(500).send('Can only delete yourself, not other users!')
    }

    
})

/**
 * Route handler for storing group join request messages in database
 */
router.post('/requestJoinGroup', authentication.authenticateToken, async (req,res) => {
    console.log('POST : /requestJoinGroup');

    let message_id = uuidv1();

    sql_messages = req.body.messages.map((obj) => {
        let values = Object.values(obj);
        values.push(message_id);
        return values 
    })

    console.log(sql_messages)

    try  {
        db.store_message(sql_messages, (err,result) => {
            if (err) {
                console.log(err);
                res.status(500).send('Failure to send request')
            } else { 
                res.status(200).send('Success')
            }
        })
    } catch (err) {
        console.log(err);
        res.status(500).send('Failure to send request')
    }
})



/**
 * Route handler for Accepting user to gorup
 */
router.post('/joinGroup', authentication.authenticateToken, async (req,res) => {
    console.log('POST : /requestJoinGroup');

    const {username, group_id} = req.body;

    const {access_token} = req.cookies;

    const user_id = parseJwt(access_token).username; 

    if (await check_group_membership(group_id, user_id)){
        try {
            db.add_user_to_group(username, group_id, (err,result) => {
                if (err) {
                    console.log(err);
                    res.status(500).send('Failure to add user to group!')
                } else {
                    res.status(200).send('success')
                }
            })
        } catch (err) {
            console.log(err);
            res.status(500).send('Failure to add user to group!')
        }
    } else {
        res.status(500).send('Invalid priviledges for this action.')
    }

    
})


router.post('/deleteMessage', authentication.authenticateToken, async (req,res) => {
    console.log('POST : /deleteMessage');

    const {author} = req.body;

    console.log(author)

    try {
        db.delete_message(author, (err,result) => {
            if (err) {
                console.log(err);
                res.status(500).send('Failed to delete message')
            } else {
                res.status(200).send('Success')
            }
        })
    } catch (err) {
        console.log(err);
        res.status(500).send('Failed to delete message')
    }
})

module.exports = router;