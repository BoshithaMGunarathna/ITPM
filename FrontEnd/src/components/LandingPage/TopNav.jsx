/* eslint-disable no-unused-vars */
import { Button } from '@mui/material'
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import MenuIcon from '@mui/icons-material/Menu';
const TopNav = () => {
    const [open, toggleOpen] = useState(false);
    const handleMenuExpand = () => {
        toggleOpen((prev) => !prev);

    }
    function scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        } else {
            console.warn(`Section with ID '${sectionId}' not found.`);
        }
    }

    // Example usage:
    // scrollToSection('about-us');

    return (
        <>
            <div className='items-center lg:px-10 bg-gray-400 flex '>
                <Link to={'/'} className='text-white bg-gray-400 text-lg hover:bg-gray-500 p-5 focus:bg-blue-950 focus:text-white'>
                    Home
                </Link>
                <Link to={'/'} className='text-white bg-gray-400 text-lg hover:bg-gray-500 p-5 focus:bg-blue-950 focus:text-white' onClick={()=>scrollToSection('vision')}>
                    Vision
                </Link>
                <Link to={'/'} className='text-white bg-gray-400 text-lg hover:bg-gray-500 p-5 focus:bg-blue-950 focus:text-white' onClick={()=>scrollToSection('mission')}>
                    Mission
                </Link>
                <Link to={'/'} className='text-white bg-gray-400 text-lg hover:bg-gray-500 p-5 focus:bg-blue-950 focus:text-white' onClick={()=>scrollToSection('support')}>
                    Support
                </Link>
                {/* <Link to={'/'} className='text-white bg-gray-400 text-lg hover:bg-gray-500 p-5 focus:bg-blue-950 focus:text-white' onClick={()=>scrollToSection('notices')}>
                    Notices
                </Link> */}

            </div>
            <div className={`lg:hidden bg-gray-300 relative block`}>
                <button className='p-5 ' onClick={handleMenuExpand}><MenuIcon /></button>
                <div className={`w-full absolute top-16 left-0 z-10 transition-all ease-in-out duration-300 flex flex-col ${open ? 'visible' : 'invisible'} transform ${open ? 'scale-x-100' : 'scale-x-0'}`}>
                    <Link to={'/'} className='text-white bg-gray-400 text-lg hover:bg-gray-500 p-5 focus:bg-blue-950 focus:text-white'>
                        Home
                    </Link>
                    <Link to={'/'} className='text-white bg-gray-400 text-lg hover:bg-gray-500 p-5 focus:bg-blue-950 focus:text-white'>
                        Vision
                    </Link>
                    <Link to={'/'} className='text-white bg-gray-400 text-lg hover:bg-gray-500 p-5 focus:bg-blue-950 focus:text-white' onClick={()=>scrollToSection('mission')}>
                        Mission
                    </Link>
                    <Link to={'/'} className='text-white bg-gray-400 text-lg hover:bg-gray-500 p-5 focus:bg-blue-950 focus:text-white' onClick={()=>scrollToSection('support')}>
                        Support
                    </Link>
                    <Link to={'/'} className='text-white bg-gray-400 text-lg hover:bg-gray-500 p-5 focus:bg-blue-950 focus:text-white' onClick={()=>scrollToSection('notices')}>
                        Notices
                    </Link>


                </div>
            </div>
        </>
    )
}

export default TopNav