import React from 'react';
import { useEffect, useLayoutEffect, useState } from 'react';
import Axios from 'axios';
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Cookies from 'js-cookie';

import {bcrypt} from './crypto'


import './App.css';
import './base.css'

// Components 
import Home from './components/pages/home/Home'
import Login from './components/pages/login/Login'
import Register from './components/pages/register/Register'
import { hash } from 'bcryptjs';

function App() {

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

	const salt = bcrypt.genSaltSync(10);
	


	return (
		<div className="App">
			<button onClick={(e) => console.log(bcrypt.hashSync('password', salt))}>CLICK ME</button>
			{/* <button onClick={(e) => console.log(bcrypt.compare('password', hash_password))}>asdf</button> */}
			<BrowserRouter>
				<Routes>
					<Route path='/' element={<Home logout={logout} />} />
					<Route path='/Login' element={<Login
						bcrypt={bcrypt}
					/>} />
					<Route path='/Register' element={<Register
						bcrypt={bcrypt}
					/>} />
				</Routes>
			</BrowserRouter>
		</div>
	);
}

export default App;
