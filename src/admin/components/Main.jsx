import { useEffect, useState } from "react";
import {jwtDecode} from "jwt-decode";
import classNames from "classnames";
import {fetchFromApi}  from "../../utils/fetchFromApi.js";

const Main = ({shouldShowSidebar, isMobile, children }) => {
    const token = localStorage.getItem("token");
    const [userData, setUserData] = useState({
        first_name: "",
        last_name: "",        
    });

    const mainClass = classNames("admin-page-content__main", {
        "no-sidebar": !shouldShowSidebar,
        "isMobile": isMobile,
        "isDesktop": !isMobile,
    });

    if (token) {
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.userId;
        useEffect(() => {
            const fetchUser = async () => {
                try {
                    const response = await fetchFromApi(`/user/${userId}`, {
                        method: "GET",
                        headers: {
                            "Authorization": `Bearer ${localStorage.getItem("token")}`,
                        },
                    });
                    setUserData({
                        first_name: response.user.first_name,
                        last_name: response.user.last_name,
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
            <div className="admin-page-content__main-header">
                <h1 className="admin-page-content__main-header-title">
                    {userData.first_name} {userData.last_name}
                </h1>
            </div>
            {children}
        </main>
    );
};
export default Main;