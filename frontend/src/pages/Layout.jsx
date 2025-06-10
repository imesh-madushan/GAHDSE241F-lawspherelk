// src/pages/OICDashboard.jsx
import React, { useState } from 'react';
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

                <main className="flex-1 overflow-y-auto">
                    {children ? children : <Outlet />}
                </main>
            </div>
        </div>
    );
};

export default Layout;