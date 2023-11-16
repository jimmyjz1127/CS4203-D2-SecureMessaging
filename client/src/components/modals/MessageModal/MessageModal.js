import React from 'react';
import {useEffect, useLayoutEffect, useState, useRef} from 'react';
import Axios from 'axios';
import {BrowserRouter, Routes, Route, useNavigate, Link} from "react-router-dom";
import Cookies from 'js-cookie';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faFilter, faUserPlus, faPenToSquare, faRightFromBracket, faUnlock} from '@fortawesome/free-solid-svg-icons';


import Message from './../message/Message';

import {full_url} from './../../../Config';

import './MessageModal.css';


function MessageModal(props) {
    const {allGroups, encrypt_string, decrypt_string, encrypt_key, decrypt_key, logout} = props;

    const navigate = useNavigate();

    const username = Cookies.get('username')

    /**
     * 0 : Create Group 
     * 1 : Password prompt to enter group 
     * 2 : Messages 
     * 3 : Join Request 
     */
    const [type, setType] = useState(0); // set to 0 if no groups 

    const [groups, setGroups] = useState(allGroups);

    const [selectedGroup, setSelectedGroup] = useState();

    const [messages, setMessages] = useState([]);

    const [message, setMessage] = useState('Test Message');

    const [password, setPassword] = useState([]);

    const [errMsg, setErrMsg] = useState('');

    const scrollRef = useRef(null);


    /**
     * Toggles group listing (left panel) between all groups and groups that user is apart of 
     * @param {*} event 
     */
    const changeGroupListing = (event) => {
        if (event.target.checked) {
            let filtered_groups = groups.map((group) => {
                if (group.member) return group
            })
            setGroups(filtered_groups)
        }else {
            setGroups(allGroups)
        }
        
    }

    const selectGroup = (event, group) => {
        if (group.id != selectGroup.id){
            let group_tiles = document.getElementsByClassName('group-tile')

            for (let i = 0; i < group_tiles.length; i++)  {
                if (group_tiles[i] != event.target) {
                    group_tiles[i].style.border = 'none'
                } else {
                    group_tiles[i].style.border = '2px solid white';
                }
            }

            if (group.member) {
                setType(1);
                setSelectedGroup(group);
            } else {
                setType(3)
                setSelectedGroup(group);
            }
            setMessage('');
            setMessages([])
        } 
    }



    /**
     * Returns messages of group, encrypted for particular user 
     * @param {*} group_id 
     * @returns 
     */
    const retrieveMessages = async (group_id) => {
        try {
            const res = await Axios({
                method : 'POST',
                withCredentials:true,
                data : {
                    username : username,
                    group_id : group_id,
                },
                url : full_url + '/getMessages'
            })

            let data = res.data; 

            let encrypted_private_key = Cookies.get('private_key');

            let private_key = decrypt_key(encrypted_private_key, password);
            
            const decrypted_messages = data.map((message) => {
                let decrypted = decrypt_string(message.content, private_key);
                let x = {
                    id : message.id,
                    author:message.author,
                    datetime:message.datetime,
                    content:decrypted,
                    key_user:message.key_user,
                    type : message.type,
                    group_id : message.group_id
                }
                return x
            })

            private_key = null; //throw away private key after use 

            setPassword(null) // throw away password after use 

            setMessages(decrypted_messages);

            setType(2);
            setErrMsg('');
        } catch (err) {
            console.log(err);
            if (err.response.status == 401 || err.response.status == 403) {
                navigate('/Expire')
            } else {
                setErrMsg('Invalid Password!')
            }
        }
    }


    const sendMessage = async () => {
        try {
            let date = new Date().toLocaleString();

            // Retrieve public keys of all members in group to encrypt message 
            const res = await Axios({
                method:'POST',
                withCredentials:true,
                data : {
                    username : username,
                    group_id : selectedGroup.id,
                },
                url: full_url + '/getGroupKeys'
            })

            let data = res.data;
            
            // Created an encrypted copy of message for each members public key
            let encrypted_copies = data.map((obj) => {     
                let encrypted = encrypt_string(message, obj.public_key);    
   
                return {
                    author : username, 
                    content : encrypted,
                    group_id : selectedGroup.id,
                    key_user : obj.username,
                    datetime : date,
                    type : '0'
                }
            })

            // Send encrypted copies to server for storage 
            const response = await Axios({
                method:'POST',
                withCredentials:true,
                data: {
                    messages : encrypted_copies,
                },
                url : full_url + '/sendMessage'
            })
            response.data[0].content = message;

            setMessages(messages => [...messages, response.data[0]]);

            setMessage('');

        } catch(err) {
            console.log(err);
            if (err.response.status == 401 || err.response.status == 403) {
                navigate('/Expire')
            } else {
                // Do something else 
            }
        }
    }

    /**
     * Function for creating groups - sends new group info to server to Db storage 
     * @param {*} id : id of name input element
     */
    const createGroup = async (id) => {
        let name = document.getElementById(id).value;

        let datetime = new Date().toLocaleString();

        try {
            const res = await Axios({
                method: 'POST', 
                withCredentials:true,
                data : {
                    name : name,
                    username : username, 
                    datetime: datetime,
                },
                url: full_url + '/addGroup'
            })
            
            setGroups(groups => [...groups, res.data]);
            selectGroup(null, res.data)

        } catch (err) {
            if (err.response.status == 401 || err.response.status == 403) {
                navigate('/Expire')
            } else {
                // Do something else 
            }
        }
    }

    /**
     * For leaving a group
     * @param {*} group_id 
     */
    const leave_group = async (group_id) => {
        try {
            const res = await Axios({
                method : 'POST',
                withCredentials:true,
                data : {
                    username : username,
                    group_id : group_id,
                },
                url : full_url + '/leaveGroup'
            })

            window.location.reload();

        } catch (err) {
            console.log(err)
            if (err.response.status == 401 || err.response.status == 403) {
                navigate('/Expire')
            } else {
                // Do something else 
                setErrMsg('Failure to leave group! Please refresh or logout and try again.')
            }
        }
    }

    /**
     * For sending group join requests 
     * @param {*} username 
     * @param {*} group_id 
     */
    const send_join_request = async (username, group_id) => {
        try {
            let date = new Date().toLocaleString();

            //Get group member usernames and public keys 
            const res = await Axios({
                method:'POST',
                withCredentials:true,
                data : {
                    username : username,
                    group_id : group_id,
                },
                url : full_url + '/getGroupKeys'
            })

            // Assemble list of message copies for each group member
            let encrypted_messages = res.data.map((obj) => {
                return {
                    author : username,
                    content : '',
                    group_id : group_id,
                    key_user : obj.username,
                    datetime : date,
                    type : '1'
                }
            })

            // send messages to be stored 
            const res2 = await Axios({
                method:'POST',
                withCredentials:true,
                data : {
                    messages : encrypted_messages,
                },
                url : full_url + '/requestJoinGroup'
            })

            let btn = document.getElementById('request-join-btn');
            btn.innerHTML = 'Request Sent!'
            btn.disabled = true;
            btn.style.backgroundColor = 'var(--secondary-color)'
        } catch (err) {
            console.log(err);
            if (err.response.status == 401 || err.response.status == 403){
                navigate('/')
            } else {

            }
        }
    }

    /**
     * handles deleting a message (join request messages)
     * @param {*} message_id 
     */
    const delete_message = async (author) => {
        try {
            const res = await Axios({
                method : 'POST',
                withCredentials:true,
                data : {
                    author : author,
                },
                url : full_url + '/deleteMessage'
            })

           let new_messages = messages.filter((obj) => (obj.type != 1) && (obj.author != author))

            setMessages(new_messages)
        } catch (err) {
            if (err.response.status == 401 || err.response.status == 403){
                navigate('/')
            } else {

            }
        }
    }


    useEffect(() => {
        if (scrollRef.current){
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    })

    return (
        <div id='message-modal' className='flex row'>
            <div id='left-col'>
                <div id='left-menu-bar' className='flex row align-center'>
                    <button id='create-group-btn' onClick={(e) => setType(0)}>
                        <FontAwesomeIcon icon={faPenToSquare}/>
                    </button>

                    <div className="flex row align-center" style={{backgroundColor:'var(--bg-color-dark)', borderRadius:'var(--border-radius-m)', padding:'5px', height:'50%'}}>
                        <input id='all-groups-check' type='checkbox' onClick={(e) => changeGroupListing(e)}/>
                        <label style={{fontSize:'12px'}}>Show Only Your Groups</label>
                    </div>
                </div>

                <div id='groups'>
                    {
                        groups.map((group) => {
                            if (group && group.member){
                                return (
                                    <div className='btn member-tile group-tile flex row align-center justify-between' onClick={(e) => selectGroup(e, group)}>
                                        <h4>{group.name}</h4>
                                    </div>
                                )
                            } else if (group){
                                return (
                                    <div className='btn group-tile flex row align-center justify-between' onClick={(e) => selectGroup(e, group)}>
                                        <h4>{group.name}</h4>
                                    </div>
                                )
                            }
                        })
                    }
                </div>
            </div>

            {type == 0 &&
                <div id="right-col" className='password-prompt flex col align-center justify-center'>
                    <div id='create-group-form'>
                        <h1>Create Group</h1>
                        <input type='text' placeholder='Enter group name...' id='create-group-input'/>
                        <button id='create-group' onClick={(e) => createGroup('create-group-input')}>Create</button>
                    </div>
                    <div className='err-msg'>{errMsg}</div>
                </div>
            }

            {type == 1 && 
                <div id="right-col" className='password-prompt flex col align-center justify-center'>
                    <h2 style={{color:'white'}}>Enter password to decrypt messages.</h2>
                    <input id='decrypt-input' type='password' placeholder='Enter password...' onChange={(e) => setPassword(e.target.value)}/>
                    <button id='decrypt-btn' onClick={(e) => retrieveMessages(selectedGroup.id)}>Decrypt Messages</button>
                    <div className='err-msg'>{errMsg}</div>
                </div>

            }

            
            {type == 2 &&
                <div id='right-col'>
                    <div id='right-menu-bar' className='flex col align-center justify-center'>
                        <div id='message-panel-bar' className='flex row align-center justify-between'>
                            <h1 style={{color:'white'}}>{selectedGroup.name}</h1>

                            <div className='flex row align-center'>
                                <div className='dropdown'>
                                    <button id="add-member-btn" className='message-btn'>
                                        <FontAwesomeIcon icon={faUserPlus}/>
                                    </button>
                                </div>

                                <button id='leave-group-btn' className='message-btn' onClick={(e) => leave_group(selectedGroup.id)}>
                                    <FontAwesomeIcon icon={faRightFromBracket}/>
                                </button>
                                <button id='view-members-btn' className='message-btn'>Members</button>
                            </div>
                            
                        </div>
                    </div>
                    <div id='message-section' ref={scrollRef}>
                        {
                            messages.map((message) => {
                                return (
                                    <Message message={message} username={username} delete_message={delete_message}/>
                                )
                            })
                        }
                    </div>
                    <div id='type-message-container' className='flex col align-center justify-center'>
                        <div id='type-message-bar' className='flex row align-center'>
                            <input id='message-input' type='text' value={message} placeholder='Type a message...' onChange={(e) => setMessage(e.target.value)}/>
                            <button id='send-msg-btn' onClick={(e) => sendMessage()}>Send</button>
                        </div>
                    </div>
                </div>
            }   

            {type == 3 && 
                <div id='right-col' className='flex row align-center justify-center'>
                    <div className='join-group flex col align-center justify-center'>
                        <div className='flex row align-center'>
                            Request to join &nbsp;
                            <div style={{color:'var(--purple-accent)'}}>{selectedGroup.name}?</div>
                        </div>
                        <button id="request-join-btn" onClick={(e) => send_join_request(Cookies.get('username'), selectedGroup.id)}>Send Request</button>
                    </div> 
                </div>
            }
            
        </div>
    )
}

export default MessageModal;