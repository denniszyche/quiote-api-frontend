import React, { useEffect, useState } from "react";
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Main from '../components/Main';

const AdminRoot = () => {
    const token = localStorage.getItem("token");
    const [sidebarVisible, setSidebarVisible] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
    const location = useLocation();
    const noSidebarRoutes = ["/", "/sign-up"]; // // routes where the header should not be displayed
    const shouldShowSidebar = token && !noSidebarRoutes.includes(location.pathname);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1024);
        };
        window.addEventListener("resize", handleResize);
        handleResize();
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);


    useEffect(() => {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "/src/admin-style.css";
        document.head.appendChild(link);
        return () => {
            document.head.removeChild(link);
        };
    }, []);



    return (
        <div className="admin-page-content">
            {shouldShowSidebar ? (
                <>
                    <Sidebar isMobile={isMobile}>
                        <Header />
                    </Sidebar>
    
                    <Main shouldShowSidebar={shouldShowSidebar} isMobile={isMobile}>
                        <Outlet />
                    </Main>
                </>
            ) : (
                <main className="admin-page-content__main no-sidebar">
                    <Outlet />
                </main>
            )}

        </div>
    );
}
export default AdminRoot;