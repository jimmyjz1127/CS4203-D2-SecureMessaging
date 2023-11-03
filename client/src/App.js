import React from 'react';
import { useEffect, useLayoutEffect, useState } from 'react';
import Axios from 'axios';
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Cookies from 'js-cookie';


import './App.css';
import './base.css'

// Components 
import Home from './components/pages/home/Home'
import Login from './components/pages/login/Login'
import Register from './components/pages/register/Register'

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

	return (
		<div className="App">
			<BrowserRouter>
				<Routes>
					<Route path='/' element={<Home logout={logout}/>} />
					<Route path='/Login' element={<Login />} />
					<Route path='/Register' element={<Register />} />
				</Routes>
			</BrowserRouter>
		</div>
	);
}

export default App;
