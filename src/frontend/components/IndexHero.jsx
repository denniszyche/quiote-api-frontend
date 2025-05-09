import { useLayoutEffect, useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { fetchFromApi } from "../../utils/fetchFromApi.js";

gsap.registerPlugin(ScrollTrigger);

const IndexHero = ({ onLoaded, allLoaded }) => {
    const { navRef } = useOutletContext();
    const [media, setMedia] = useState([]);
    const component = useRef(null);
    const pinSlider = useRef(null);
    const imagesWrapper = useRef(null);
    const title = useRef(null);
    const [loadedImages, setLoadedImages] = useState(0);

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
            }
        };
        fetchData();
    }, []);

    useLayoutEffect(() => {
        let interval;

        const ctx = gsap.context(() => {

            gsap.to(imagesWrapper.current, {
                scrollTrigger: {
                    trigger: pinSlider.current,
                    start: "top top",
                    end: "+=2000",
                    pin: true,
                    scrub: 1,
                    onLeave: () => {
                        gsap.to(navRef.current, {
                            yPercent: 0,
                            duration: 0.5,
                            ease: "power2.out",
                        });
                    },
                    onEnterBack: () => {
                        gsap.to(navRef.current, {
                            yPercent: -100,
                            duration: 0.5,
                            ease: "power2.out",
                        });
                            
                    },
                },
                clipPath: "inset(0% round 1rem)",
                duration: 1,
            });

            if (media.length > 0) {
                const images = imagesWrapper.current.querySelectorAll("img");
                gsap.set(images, { autoAlpha: 0 });
                gsap.set(images[0], { autoAlpha: 1 });
                let lastIndex = -1;
                interval = setInterval(() => {
                    let index;
                    do {
                        index = Math.floor(Math.random() * images.length);
                    } while (index === lastIndex);
                    lastIndex = index;
                    gsap.set(images, { autoAlpha: 0 });
                    gsap.set(images[index], { autoAlpha: 1 });
                }, 750);
            }
        }, component);

        return () => {
            clearInterval(interval);
            ctx.revert();
        };
    }, [media, navRef]);

    useEffect(() => {
        if (loadedImages === media.length && media.length > 0) {
            onLoaded();
            console.log("All images loaded");
        }
    }, [loadedImages, media, onLoaded]);


    useEffect(() => {
        if (allLoaded) {
            // Trigger animations when everything is loaded
            gsap.fromTo(
                title.current,
                { opacity: 0, y: 50 },
                { opacity: 1, y: 0, duration: 1, ease: "power2.out" }
            );
            gsap.fromTo(
                imagesWrapper.current,
                { opacity: 0, scale: 0.8 },
                { opacity: 1, scale: 1, duration: 1, ease: "power2.out" }
            );
        }
    }, [allLoaded]);


    return (
        <div className="index__hero" ref={component}>

            <div className="index__hero-pin" ref={pinSlider}>

                <h1 className="index__hero-title" ref={title}>
                    Quiote
                </h1>

                <div className="index__hero-image-wrapper" ref={imagesWrapper}>
                    {media.length > 0 ? (
                        media.map((item, index) => (
                            <img
                                key={index}
                                src={`https://quiote-api.dztestserver.de/${item.filepath}`}
                                alt={item.altText || "Media Image"}
                                onLoad={() => setLoadedImages((prev) => prev + 1)}
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

export default IndexHero;