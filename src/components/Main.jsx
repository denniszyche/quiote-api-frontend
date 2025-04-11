import { useEffect, useState } from "react";
import {jwtDecode} from "jwt-decode";
import classNames from "classnames";

const Main = ({shouldShowSidebar, isMobile, children }) => {
    const token = localStorage.getItem("token");
    const [userData, setUserData] = useState({
        first_name: "",
        last_name: "",        
    });

    const mainClass = classNames("page-content__main", {
        "no-sidebar": !shouldShowSidebar,
        "isMobile": isMobile,
        "isDesktop": !isMobile,
    });

    if (token) {
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.userId;
        useEffect(() => {
            const documentStyle = getComputedStyle(document.documentElement);
            const fetchUser = async () => {
                try {
                    const response = await fetch(`http://localhost:3000/user/post/${userId}`, 
                        {
                            method: "GET",
                            headers: {
                                "Authorization": `Bearer ${localStorage.getItem("token")}`,
                            },
                        }
                    );
                    if (!response.ok) {
                        throw new Error("Failed to fetch absence");
                    }
                    const data = await response.json();
                    setUserData({
                        first_name: data.user.first_name,
                        last_name: data.user.last_name,
                    });
                }
                catch (error) {
                    console.error("Error fetching user data:", error);
                }
            }
            fetchUser();
        }, [userId]);

    }

    return (
        <main className={mainClass}>
            <div className="page-content__main-header">
                <h1 className="page-content__main-header-title">
                    {userData.first_name} {userData.last_name}
                </h1>
            </div>
            {children}
        </main>
    );
};
export default Main;