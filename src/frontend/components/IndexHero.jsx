import { useLayoutEffect, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { fetchFromApi } from "../../utils/fetchFromApi.js";
import Loader from "../components/Loader";


gsap.registerPlugin(ScrollTrigger);

export default function App() {
    const [media, setMedia] = useState([]);
    const component = useRef(null);
    const pinSlider = useRef(null);
    const imagesWrapper = useRef(null);
    const [loading, setLoading] = useState(true);
    const [firstImageLoaded, setFirstImageLoaded] = useState(false);

    useLayoutEffect(() => {
        const fetchData = async () => {
            try {
                const data = await fetchFromApi(
                    "/media/random-media-frontend",
                    {
                        method: "GET",
                    }
                );
                setMedia(data.media || []);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useLayoutEffect(() => {
        let interval;

        const ctx = gsap.context(() => {
            gsap.to(pinSlider.current, {
                scrollTrigger: {
                    trigger: pinSlider.current,
                    start: "top top",
                    end: "+=2000",
                    pin: true,
                    scrub: 1,
                },
                clipPath: "inset(0% round 1rem)",
                duration: 1,
            });


            if (media.length > 0) {
                const images = imagesWrapper.current.querySelectorAll("img");
                gsap.set(images, { autoAlpha: 0 });
                gsap.set(images[0], { autoAlpha: 1 }); // Show the first image initially
                let lastIndex = -1;
                interval = setInterval(() => {
                    let index;
                    do {
                        index = Math.floor(Math.random() * images.length);
                    } while (index === lastIndex);
                    lastIndex = index;
                    gsap.set(images, { autoAlpha: 0 }); // Instantly hide all images
                    gsap.set(images[index], { autoAlpha: 1 });
                }, 750);
            }
        }, component);

        return () => {
            clearInterval(interval);
            ctx.revert();
        };
    }, [media, firstImageLoaded]);

    if (loading) {
        return (<Loader />);
    }

    return (
        <div className="index__hero" ref={component}>
            <div className="index__hero-pin" ref={pinSlider}>
                <div className="index__hero-image-wrapper" ref={imagesWrapper}>
                    {media.length > 0 ? (
                        media.map((item, index) => (
                            <img
                                key={index}
                                src={`https://quiote-api.dztestserver.de/${item.filepath}`}
                                alt={item.altText || "Media Image"}
                            />
                        ))
                    ) : (
                        <></>
                    )}
                </div>
            </div>
        </div>
    );
}
