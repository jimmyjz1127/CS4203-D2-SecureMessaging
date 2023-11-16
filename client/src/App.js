import React from 'react';
import { useEffect, useLayoutEffect, useState } from 'react';
import Axios from 'axios';
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Cookies from 'js-cookie';
import { JSEncrypt } from "jsencrypt";
import {bcrypt, crypto, keypair} from './crypto'

// Styling 
import './App.css';
import './base.css'

// Components 
import Home from './components/pages/home/Home'
import Login from './components/pages/login/Login'
import Register from './components/pages/register/Register'
import Expire from './components/pages/expire/Expire'

import { full_url } from './Config';

function App() {

	const [loginState, setLoginState] = useState(0);

	/**
	 * Logs user out - clears all cookies 
	 */
	const logout = async () => {
		// Get an array of all cookie names
		const cookieNames = Object.keys(Cookies.get());

		// Loop through the cookie names and remove each cookie
		cookieNames.forEach((cookieName) => {
			Cookies.remove(cookieName);
		});

		// Send request to server to clear HttpOnly cookies from server-side 
		try {
			const res = await Axios({
				method : 'POST',
				withCredentials:true,
				url: full_url + '/logout'
			})
		} catch (err) {
			console.log(err)
		}

		setLoginState(0);
	}

	/**
     * Generates public and private keypair (RSA)
     * @returns public key and private key (STRINGS)
     */
    const generateKeyPair = () => {
		const key_pair = keypair();

		return {public_key : key_pair.public, private_key : key_pair.private};
    }

	/**
	 * Encrypts a string using a secret 
	 * @param {*} data : data to encrypt 
	 * @param {*} secret : some secret string 
	 * @returns : the encrypted cipher text 
	 */
    const encrypt_string =  (data, secret) => {
		var encrypt = new JSEncrypt();
		encrypt.setPublicKey(secret)
		var encrypted = encrypt.encrypt(data);

		return encrypted;
    }

	/**
	 * Decrypts some data using secret 
	 * @param {*} data : encrypted data 
	 * @param {*} secret : secret (string)
	 * @returns : decrypted string data 
	 */
	const decrypt_string = (data, secret) => {
		var decrypt = new JSEncrypt();
		decrypt.setPrivateKey(secret);
		var uncrypted = decrypt.decrypt(data);

		return uncrypted
	}

	/**
	 * Symetrically encrypts some string data using a secret key 
	 * @param {*} data   : string data to encrypt 
	 * @param {*} secret : secret (symetric key) 
	 * @returns 
	 */
	const encrypt_key = (data,secret) => {
		let cipher = crypto.AES.encrypt(data, secret).toString();
		return cipher;
	}

	/**
	 * Symetrically decrypts a cipher using a secret key 
	 * @param {*} cipher : the encrypted cipher 
	 * @param {*} secret : the symetric key secret
	 * @returns 
	 */
	const decrypt_key = (cipher,secret) => {
		let bytes = crypto.AES.decrypt(cipher, secret);
		let decipher = bytes.toString(crypto.enc.Utf8);
		return decipher;
	}
	


	return (
		<div className="App">
			<BrowserRouter>
				<Routes>
					<Route path='/' element={<Home 
						logout={logout}
						loginState={loginState}
						setLoginState={setLoginState}
						encrypt_string={encrypt_string}
						decrypt_string={decrypt_string}
						encrypt_key={encrypt_key}
						decrypt_key={decrypt_key}
					/>} />
					<Route path='/Login' element={<Login
						bcrypt={bcrypt}
						encrypt_string={encrypt_string}
						decrypt_string={decrypt_string}
						generateKeyPair={generateKeyPair}
						encrypt_key={encrypt_key}
						decrypt_key={decrypt_key}
					/>} />
					<Route path='/Register' element={<Register
						bcrypt={bcrypt}
						encrypt_string={encrypt_string}
						decrypt_string={decrypt_string}
						generateKeyPair={generateKeyPair}
						encrypt_key={encrypt_key}
						decrypt_key={decrypt_key}
					/>} />
					<Route path='/Expire' element={<Expire logout={logout}/>}/>
				</Routes>
			</BrowserRouter>
		</div>
	);
}

export default App;
