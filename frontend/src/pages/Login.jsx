import React, { useState } from 'react';
import { FaUser } from 'react-icons/fa';
import axios from 'axios';


const Login = () => {   
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLoginClick = async () => {
        try {
            const response = await axios.post('http://localhost:5000/api/auth/login', { username, password }); // Specify backend URL and port
            console.log("Login successful:", response.data);
            // Handle successful login (e.g., redirect or store token)
        } catch (error) {
            console.error("Login failed:", error.response?.data || error.message);
            // Handle login failure (e.g., show error message)
        }
    };

    return (
        <div className="flex min-h-screen flex-1 flex-col justify-start pt-[8%] px-6 py-12 lg:px-8 bg-gray-100">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
            <div className="flex items-center justify-center w-10 h-10 mx-auto rounded-full border-3 border-stone-950 bg-white">
                <FaUser className="text-xl text-stone-950" />
            </div>
          <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
            Sign in to your account
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form action="#" method="POST" className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm/6 font-medium text-gray-900">
                Username
              </label>
              <div className="mt-2">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 border border-gray-400 shadow-md placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm/6 font-medium text-gray-900">
                  Password
                </label>
              </div>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 border border-gray-400 shadow-md placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
              </div>
            </div>

            <div className="mt-8">
              <button
                type="button"
                onClick={handleLoginClick}
                className="flex w-full justify-center rounded-md bg-blue-900 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Sign in
              </button>
            </div>
          </form>
        </div>
      </div>
    );
}
export default Login;