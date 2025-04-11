import { useState } from "react";

const Dashboard = () => {
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="flex">
            <div className="card width-shadow w-100">
                <h2>👋 Welcome to QUIOTE API</h2>
                <p>
                    This is the dashboard page. You can manage your application
                    from here.
                </p>
            </div>
            {error && <div>Error: {error}</div>}
        </div>
    );
}
export default Dashboard;