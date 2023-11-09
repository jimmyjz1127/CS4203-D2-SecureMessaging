import React from 'react';
import { useEffect, useLayoutEffect, useState } from 'react';
import Axios from 'axios';
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Cookies from 'js-cookie';

import {bcrypt, crypto} from './crypto'
import {ec} from 'elliptic'

import './App.css';
import './base.css'

// Components 
import Home from './components/pages/home/Home'
import Login from './components/pages/login/Login'
import Register from './components/pages/register/Register'

function App() {
	const x = 'hello'

	/**
	 * Logs user out - clears all cookies 
	 */
	const logout = () => {
		// Get an array of all cookie names
		const cookieNames = Object.keys(Cookies.get());

		// Loop through the cookie names and remove each cookie
		cookieNames.forEach((cookieName) => {
			Cookies.remove(cookieName);
		});

		window.location.reload();
	}

	/**
     * Generates public and private keypair (RSA)
     * @returns public key and private key (STRINGS)
     */
    const generateKeyPair = () => {
        const elliptic = new ec('secp256k1');

        const key_pair = elliptic.genKeyPair();
        const public_key = key_pair.getPublic('hex');
        const private_key = key_pair.getPrivate('hex')

        return {public_key, private_key}
    }

	/**
	 * Encrypts a string using a secret 
	 * @param {*} data : data to encrypt 
	 * @param {*} secret : some secret string 
	 * @returns : the encrypted cipher text 
	 */
    const encrypt_string =  (data, secret) => {
        let cipher = crypto.AES.encrypt(data, secret).toString();
        return cipher
    }

	/**
	 * Decrypts some data using secret 
	 * @param {*} data : encrypted data 
	 * @param {*} secret : secret (string)
	 * @returns : decrypted string data 
	 */
	const decrypt_string = (data, secret) => {
		let bytes = crypto.AES.decrypt(data, secret);
		let decipher = bytes.toString(crypto.enc.Utf8);
		return decipher;
	}
	


	return (
		<div className="App">
			{/* <button onClick={(e) => test()}>test</button> */}
			<BrowserRouter>
				<Routes>
					<Route path='/' element={<Home 
						logout={logout} 
						encrypt_string={encrypt_string}
						decrypt_string={decrypt_string}
					/>} />
					<Route path='/Login' element={<Login
						bcrypt={bcrypt}
						encrypt_string={encrypt_string}
						decrypt_string={decrypt_string}
						generateKeyPair={generateKeyPair}
					/>} />
					<Route path='/Register' element={<Register
						bcrypt={bcrypt}
						encrypt_string={encrypt_string}
						decrypt_string={decrypt_string}
						generateKeyPair={generateKeyPair}
					/>} />
				</Routes>
			</BrowserRouter>
		</div>
	);
}

export default App;
