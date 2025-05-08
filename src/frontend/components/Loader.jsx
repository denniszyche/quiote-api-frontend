import { useEffect } from "react";
import { ScrollSmoother } from "gsap/ScrollSmoother";

const Loader = () => {
    useEffect(() => {
        document.body.style.overflow = "hidden";
        const smoother = ScrollSmoother.get();
        if (smoother) {
            smoother.paused(true);
        }
        return () => {
            document.body.style.overflow = "";
            if (smoother) {
                smoother.paused(false);
            }
        };
    }, []);

    return (
        <div className="loader"></div>
    );
};

export default Loader;