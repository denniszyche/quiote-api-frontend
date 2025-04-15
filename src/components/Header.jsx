import { TieredMenu } from 'primereact/tieredmenu';
import { useNavigate } from 'react-router-dom';
import { getUserRoles } from "../utils/auth.js";
        
const Header = () => {
    const navigate = useNavigate();
    const userRoles = getUserRoles();
    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/");
    };
    const items = [
        {
            label: 'Dashboard',
            icon: 'pi pi-fw pi-home',
            command: () => navigate('/dashboard')
        },
        { separator: true },
        ...(userRoles?.some(role => role.name === "admin" || role.name === "hr") ? [
        {
            label: 'User',
            icon: 'pi pi-user',
            items: [
                {
                    label: 'All User',
                    command: () => navigate('/all-user')
                },
                {
                    label: 'Add User',
                    command: () => navigate('/add-user')
                }
            ]
        },
        { separator: true },
        ] : []),
        {
            label: 'Posts',
            icon: 'pi pi-file',
            items: [
                {
                    label: 'All Posts',
                    command: () => navigate('/all-posts'),                    
                },
                {
                    label: 'Add Post',
                    command: () => navigate('/add-post')
                }
            ]
        },
        ...(userRoles?.some(role => role.name === "admin" ) ? [
        {
            label: 'Kategorie',
            icon: 'pi pi-tags',
            items: [
                {
                    label: 'All Categories',
                    command: () => navigate('/all-categories')
                },
                {
                    label: 'Add Category',
                    command: () => navigate('/add-category')
                }
            ]
        },
        { separator: true },
        {
            label: 'Media',
            icon: 'pi pi-image',
            items: [
                {
                    label: 'All Media',
                    command: () => navigate('/all-media')
                },
                {
                    label: 'Add Media',
                    command: () => navigate('/add-media')
                }
            ]
        },
        { separator: true },
        ] : []),
        {
            label: 'Logout',
            icon: 'pi pi-sign-out',
            command: handleLogout
        }
    ];
    return (
        <header className="page-content__header">
            <div className="page-content__header-logo">
                <a href="/dashboard" className="page-content__header-logo-link">
                    <img src="/images/cms-logo.svg" alt="Logo" />
                </a>
            </div>
            <TieredMenu model={items}  />    
        </header>
    )
}
export default Header;