import { Outlet } from 'react-router-dom';


const FrontendRoot = () => {

    return (
        <div className="page-content">
            This is the Frontend Header
            <main className="page-content__main">
                <Outlet />
            </main>
        </div>
    );
}
export default FrontendRoot;