import { useState, useRef, useEffect } from "react";
import gsap from "gsap";

const Image = ({ src, alt, className, fallbackClassName }) => {
    const [loaded, setLoaded] = useState(false); // Track if the image is loaded
    const [error, setError] = useState(false); // Track if the image failed to load
    const imgRef = useRef(null); // Reference to the image element
    const fallbackRef = useRef(null); // Reference to the fallback element

    useEffect(() => {
        if (loaded && !error) {
            // Fade in the image using GSAP when it's loaded
            gsap.to(imgRef.current, {
                opacity: 1,
                duration: 0.5,
                ease: "power2.out",
            });
        } else if (error) {
            // Fade in the fallback element if the image fails to load
            gsap.to(fallbackRef.current, {
                opacity: 1,
                duration: 0.5,
                ease: "power2.out",
            });
        }
    }, [loaded, error]);

    return error ? (
        <div
            ref={fallbackRef}
            className={fallbackClassName}
            style={{
                opacity: 0,
                backgroundImage: `url('/public/images/cms-logo.svg')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                width: "100%",
                height: "100%",
            }}
            aria-label={alt}
        ></div>
    ) : (
        <img
            ref={imgRef}
            src={src}
            alt={alt}
            className={className}
            style={{ opacity: 0 }}
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
        />
    );
};

export default Image;