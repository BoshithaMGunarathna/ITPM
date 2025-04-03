/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import Button from '@mui/material/Button';

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:510/user/login', formData);
      Cookies.set('role', res.data.userRole);
      Cookies.set('firstName', res.data.firstName);
      Cookies.set('level', res.data.level);
      Cookies.set('staffPost', res.data.staffPost);
      
      const userRoles = res.data.userRole;

      if (userRoles.includes('admin')) {
        navigate('/dashboard/adminDash');
      } else if (userRoles.includes('student')) {
        navigate('/dashboard/studentDash');
      } else if (userRoles.includes('examinar')) {
        navigate('/dashboard/examinerDash');
        // } else if (userRoles.includes('supervisor')) {
        //   navigate('/dashboard/supervisorDash');
        // } else if (userRoles.includes('member')) {
        //   navigate('/dashboard/pMemberDash');
      } else if (userRoles.includes('coordinator')) {
        navigate('/dashboard');
      } else if (userRoles.includes('staff')) {
        navigate('/main');
      } else {
        navigate('/');
      }
      toast.success(`${res.data.userRole}, successfully Logged In!`);
    } catch (err) {
      console.log('Error:', err);
      toast.error(err.response.data.message || 'User Login failed');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center">
      <div className="container max-w-md mx-auto p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-6">Staff Log In</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="text"
              name="email"
              placeholder="Email"
              onChange={handleChange}
              className="w-full p-4 text-sm text-gray-700 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              onChange={handleChange}
              className="w-full p-4 text-sm text-gray-700 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <button
              type="submit"
              className="w-full py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-300"
            >
              Sign In
            </button>
          </div>
        </form>
        <div className="mt-6 text-center text-gray-700">
          <p>
            Cannot Sign In?{' '}
            <span className="text-blue-500 cursor-pointer">Contact Administrators!</span>
          </p>
          <Button
            variant="contained"
            sx={{
              backgroundColor: "blue",
              color: "white",
              mt: 2,
              "&:hover": {
                backgroundColor: "darkblue",
              },
            }}
            onClick={() => navigate('/s-login')}
          >
            Student Login
          </Button>
        </div>
        <div className="mt-6 text-center">
          <Link to="/">
            <Button
              variant="contained"
              sx={{
                backgroundColor: "green",
                color: "white",
                "&:hover": {
                  backgroundColor: "darkgreen",
                },
              }}
            >
              Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
