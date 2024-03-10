import * as React from 'react';
import BasicLineChart from '../../components/BasicLineChart';
import TopNav from '../../components/TopNav';
import WelcomeCard from '../../components/WelcomeCard';
import Sidebar from '../../components/StudentSidebar';
import { Typography } from '@mui/material';

function StudentDash() {
    return (
        <>
            <Sidebar /> {/* Move Sidebar to the left corner */}
            
            <div style={{ marginLeft: '240px' }}> {/* Adjust margin based on Sidebar width */}
            
                <TopNav />
                <div style={{ marginTop: '10px', marginLeft:'10px', marginRight: '10px'}}>
                <WelcomeCard />
                </div>
                <div style={{marginLeft:'50px'}}>
                <Typography>My Progress</Typography>
                <BasicLineChart />
                </div>
            </div>
        </>
    );
}

export default StudentDash;
