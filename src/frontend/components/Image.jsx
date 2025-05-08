import { useState, useRef, useEffect } from "react";
import gsap from "gsap";

const Image = ({ src, alt, className }) => {
    const [loaded, setLoaded] = useState(false);
    const imgRef = useRef(null);

    useEffect(() => {
        if (loaded) {
            gsap.to(imgRef.current, {
                opacity: 1,
                duration: 0.5,
                ease: "power2.out",
            });
        }
    }, [loaded]);

    return (
        <img
            ref={imgRef}
            src={src}
            alt={alt}
            className={className}
            style={{ opacity: 0 }}
            onLoad={() => setLoaded(true)}
        />
    );
};

export default Image;