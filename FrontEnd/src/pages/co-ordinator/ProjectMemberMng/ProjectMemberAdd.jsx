
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { validateContactNo, validateEmail, validateFirstName, validateLastName } from '../../../validation/CordinatorValidations/PrjMemberAddValid'
import { toast } from 'react-toastify'

function ProjectMemberAdd() {
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', contactNo: '', password: '', confirm_password: '' })

  const role = 'member'
  const password = '1234' 
  const handleChange = (e) => {
    setFormData({
      ...formData,
      'role': role,
      'password': password,
      [e.target.name]: e.target.value
    })
  }

  //submission of form with validations
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form data
    const errors = {};
    errors.firstName = validateFirstName(formData.firstName);
    errors.lastName = validateLastName(formData.lastName);
    errors.email = validateEmail(formData.email);
    errors.contactNo = validateContactNo(formData.contactNo);
    
    
    const errorFields = Object.entries(errors)
      .filter(([field, error]) => error !== null)
      .map(([field, error]) => `${field} ${error}`);
    
   
    if (errorFields.length > 0) {
      const errorMessage = errorFields.join(', ');
      toast.error(errorMessage);
      return;
    }
    
    
    axios.post('http://localhost:510/user/create', formData)
      .then(() => {
        toast.success('Project member added successfully');
        console.log('Project member added successfully');
      })
      .catch((err) => {
        console.log('Form data:', formData);
        console.log('Error:', err);
        toast.error('Error adding project member');
        toast.error(err.response.data.message);
      });
  };
  


  return (

    <div className="bg-grey-lighter min-h-screen flex flex-col bg-white ">
      <div className="container max-w-xl mx-auto flex-1 flex flex-col items-center justify-center px-2">
        <div className="bg-white px-6 py-8 rounded shadow-md text-black w-full">
          <h1 className="mb-8 text-3xl text-center">Add Users</h1>
          <form onSubmit={handleSubmit} className="mb-4 md:flex md:flex-wrap md:justify-between" action="/signup/" method="post">

            <div className='flex gap-2 w-full'>
            
              <input
              
                type="text"
                className="block border border-grey-light w-full p-3 rounded mb-4"
                name="firstName"
                placeholder="Project Member First Name"
                id='firstName'
                onChange={handleChange} />

              <input
                type="text"
                className="block border border-grey-light w-full p-3 rounded mb-4"
                name="lastName"
                placeholder="Project Member Last Name"
                id='lastName'
                onChange={handleChange} />


            </div>



            <input
              type="text"
              className="block border border-grey-light w-full p-3 rounded mb-4"
              name="email"
              placeholder="Email"
              id='email'
              onChange={handleChange} />


            <input
              type="tel"
              className="block border border-grey-light w-full p-3 rounded mb-4"
              name="contactNo"
              placeholder="contact No"
              id='contactNo'
              onChange={handleChange} />

            <input
              type="string"
              className="block border border-grey-light w-full h-48 p-3 rounded mb-4"
              name="address"
              placeholder="Address"
              id='address'
              onChange={handleChange} />




            <button
              type="submit" className="w-full text-center  bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded">
              Add Member
            </button>
            <div>
              <p className='text-red-600 text-center'>

              </p>
            </div>



          </form>

          <div className="text-center text-sm text-grey-dark mt-4">
            Password set to default:
            <h1 className="no-underline text-grey-dark">
            Users must update their password in their profile
            </h1> and
         
          </div>
        </div>

      </div>
    </div>
  )
}

export default ProjectMemberAdd;