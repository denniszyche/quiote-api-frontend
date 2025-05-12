import { useState, useRef, useEffect } from "react";
import gsap from "gsap";

const Image = ({
    src,
    alt,
    className,
    fallbackClassName,
    srcSet,
    sizes,
}) => {
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);
    const imgRef = useRef(null);
    const fallbackRef = useRef(null);

    useEffect(() => {
        if (loaded && !error) {
            gsap.to(imgRef.current, {
                opacity: 1,
                duration: 0.5,
                ease: "power2.out",
            });
        } else if (error) {
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
            srcSet={srcSet}
            sizes={sizes}
            alt={alt}
            className={className}
            style={{ opacity: 0 }}
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
        />
    );
};

export default Image;