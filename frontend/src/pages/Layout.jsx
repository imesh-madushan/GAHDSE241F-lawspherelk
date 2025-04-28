// src/pages/OICDashboard.jsx
import React, { useEffect, useState } from 'react';
import Dashboard from './homepages/Dashboard';
import SingleCaseView from './cases/SingleCaseView';
import Navbar from '../components/NavBar';
import Sidebar from '../components/Sidebar';
import { Outlet } from 'react-router-dom';

const Layout = ({ children }) => {
    const [activeItem, setActiveItem] = useState([]);
    const [expanded, setExpanded] = useState(true); //to toggle the sidebar and hide the text in navbar

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar
                activeItem={activeItem}
                setActiveItem={setActiveItem}
                expanded={expanded}
                setExpanded={setExpanded}
            />

            <div className="flex-1 flex flex-col overflow-hidden">
                <Navbar
                    expanded={expanded}
                />

                {/* load the dashbord or other pages according to the active item */}
                {/* TODO: change the linked components to actual components later */}
                {/* <div className="flex-1 overflow-y-auto">
                    {activeItem === 'dashboard' && <Dashboard />}
                    {activeItem === 'complaints' && <div>Complaints</div>}
                    {activeItem === 'cases' && (<div>Cases</div>)}
                    {activeItem === 'analytics' && <div>Analytics</div>}
                    {activeItem === 'settings' && <div>Settings</div>}
                    {activeItem === 'reports' && <div>Reports</div>}
                    {activeItem === 'evidence' && <div>Evidence</div>}
                    {activeItem === 'forensic-requests' && <div>Forensic Requests</div>}
                    <Outlet />
                </div> */}
                <main className="flex-1 overflow-y-auto">
                    {children ? children : <Outlet />}
                    {/* You can keep this fallback if needed */}
                </main>
            </div>
        </div>
    );
};

export default Layout;