import React from 'react';
import {useEffect, useLayoutEffect, useState} from 'react';
import Axios from 'axios';
import {BrowserRouter, Routes, Route, useNavigate, Link} from "react-router-dom";
import Cookies from 'js-cookie';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faFilter, faUserPlus, faPenToSquare, faRightFromBracket, faUnlock} from '@fortawesome/free-solid-svg-icons';

import {full_url} from './../../../Config';

import './MessageModal.css';


function MessageModal(props) {
    const {allGroups, encrypt_string, decrypt_string} = props;

    const username = Cookies.get('username')

    const allGroupsX = [
        {
            id:'adasd',
            created:'November 23rd, 2023',
            name:'Some Group',
            member:true
        },
        {
            id:'adasd2',
            created:'November 23rd, 2023',
            name:'A Group',
            member:false
        },
        {
            id:'adasd3',
            created:'November 23rd, 2023',
            name:'CS4203 Group',
            member:true
        }
    ]

    /**
     * 0 : Create Group 
     * 1 : Password prompt to enter group 
     * 2 : Messages 
     * 3 : Join Request 
     */
    const [type, setType] = useState(0); // set to 0 if no groups 

    const [groups, setGroups] = useState(allGroupsX);

    const [selectedGroup, setSelectedGroup] = useState();

    const [messages, setMessages] = useState([]);

    const [message, setMessage] = useState('Test Message');

    const [password, setPassword] = useState([]);

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
        if (group.member) {
            setType(1);
            setSelectedGroup(group);
        } else {
            setType(3)
            setSelectedGroup(group);
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
                headers: {
                    Authorization : 'Bearer ' + Cookies.get('access_token')
                },
                data : {
                    username : username,
                    group_id : group_id
                },
                url : full_url + '/getMessages'
            })

            let data = res.data; 

            let encrypted_private_key = Cookies.get('private_key');

            let private_key = decrypt_string(encrypted_private_key, password);

            setPassword(null) // throw away password after use 

            const decrypted_messages = data.map((message) => {
                message.content = decrypt_string(message.content, private_key);
                return message;
            })

            private_key = null; //throw away private key after use 

            setMessages(decrypted_messages);

            setType(2);
        
        } catch (err) {
            console.log(err);
            // some error message 
        }
    }


    const sendMessage = async () => {
        try {
            let date = new Date().toLocaleString();

            const res = await Axios({
                method:'POST',
                headers: {
                    Authorization : 'Bearer ' + Cookies.get('access_token')
                },
                data : {
                    username : username,
                    group_id : selectedGroup.id
                },
                url: full_url + '/getGroupKeys'
            })
            

            // let data = res.data;
            let data = [
                {
                    public_key:Cookies.get('public_key'),
                    username : 'jz75'
                }, 
                {
                    public_key : 'sdfsdf.sdfs3fesf.sf3',
                    username : 'bob'
                }
            ]

            console.log(message)

            let encrypted_copies = data.map((obj) => {                
                return {
                    author : username, 
                    content : encrypt_string(message, obj.public_key),
                    group_id : selectedGroup.id,
                    key_user : obj.username,
                    datetime : date
                }
            })
           

            const response = await Axios({
                method:'POST',
                headers: {
                    Authorization : 'Bearer ' + Cookies.get('access_token')
                },
                data: {
                    messages : encrypted_copies
                },
                url : full_url + '/sendMessage'
            })

        } catch(err) {
            console.log(err);
            // do something to indicate 
        }
    }


    return (
        <div id='message-modal' className='flex row'>
            <button onClick={(e) => sendMessage()}>CLICKME</button>
            <div id='left-col'>
                <div id='left-menu-bar' className='flex col align-start justify-between'>
                    <div className='flex row align-center justify-between' style={{width:'90%'}}>
                        <input type='text' placeholder='Search groups' id='group-search'/>
                        <button id='create-group-btn' >
                            <FontAwesomeIcon icon={faPenToSquare}/>
                        </button>
                    </div>
                    <div className="flex row align-center" style={{backgroundColor:'var(--bg-color-dark)', borderRadius:'var(--border-radius-m)', padding:'3px', marginTop:'5px'}}>
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
                <div>
                    
                </div>
            }

            {type == 1 && 
                <div id="right-col" className='password-prompt flex col align-center justify-center'>
                    <h2 style={{color:'white'}}>Enter password to decrypt messages.</h2>
                    <input id='decrypt-input' type='password' placeholder='Enter password...' onChange={(e) => setPassword(e.target.value)}/>
                    <button id='decrypt-btn' onClick={(e) => retrieveMessages(selectedGroup)}>Decrypt Messages</button>
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

                                <button id='leave-group-btn' className='message-btn'>
                                    <FontAwesomeIcon icon={faRightFromBracket}/>
                                </button>
                                <button id='view-members-btn' className='message-btn'>Members</button>
                            </div>
                            
                        </div>
                    </div>
                    <div id='message-section'>

                    </div>
                    <div id='type-message-container' className='flex col align-center justify-center'>
                        <div id='type-message-bar' className='flex row align-center'>
                            <input id='message-input' type='text' placeholder='Type a message...'/>
                            <button id='send-msg-btn'>Send</button>
                        </div>
                    </div>
                </div>
            }   

            {type == 3 && 
                <div>
                    <h1>TesT</h1>
                </div> 
            }
            
        </div>
    )
}

export default MessageModal;