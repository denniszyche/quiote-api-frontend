import { useEffect } from "react";
import { Outlet } from 'react-router-dom';

import { gsap } from "gsap";
    
import { ScrollTrigger } from "gsap/ScrollTrigger";
// ScrollSmoother requires ScrollTrigger
import { ScrollSmoother } from "gsap/ScrollSmoother";

gsap.registerPlugin(ScrollTrigger,ScrollSmoother);


const FrontendRoot = () => {

    useEffect(() => {
        const smoother = ScrollSmoother.create({
            wrapper: ".page-content", // The wrapper element
            content: ".page-content__main", // The content element
            smooth: 1.2, // Smoothness (higher is smoother)
            effects: true, // Enable effects like parallax
        });

        // Cleanup on unmount
        return () => {
            if (smoother) smoother.kill();
        };
    }, []);

    useEffect(() => {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "/css/style.css";
        document.head.appendChild(link);
        return () => {
            document.head.removeChild(link);
        };
    }, []);

    return (
        <div className="page-content">
            <main className="page-content__main">
                <Outlet />
            </main>
        </div>
    );
}
export default FrontendRoot;