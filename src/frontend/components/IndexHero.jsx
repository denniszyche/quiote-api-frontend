import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

const IndexHero = () => {


    return (
        <div className="index__hero">
            <div className="index__hero-images">
                {/* Replace with your content */}
                Images
            </div>
        </div>
    );
};

export default IndexHero;