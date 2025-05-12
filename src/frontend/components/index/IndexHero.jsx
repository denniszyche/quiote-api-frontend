import { useLayoutEffect, useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { fetchFromApi } from "../../../utils/fetchFromApi.js";

gsap.registerPlugin(ScrollTrigger);

const IndexHero = ({ onLoaded, allLoaded }) => {
    const { navRef } = useOutletContext();
    const [media, setMedia] = useState([]);
    const component = useRef(null);
    const pinSlider = useRef(null);
    const imagesWrapper = useRef(null);
    const title = useRef(null);
    const description = useRef(null);
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
                console.log("Fetched media data:", data);
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
                description.current,
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
                    {/* Q */}
                </h1>

                <div className="index__hero-image-wrapper" ref={imagesWrapper}>
                    {media.length > 0 ? (
                        media.map((item, index) => {
                            const baseUrl = "https://quiote-api.dztestserver.de/";
                            const original = item.filepath;
                            const match = original.match(/\.(jpe?g)$/i);
                            const ext = match ? match[0] : ".jpg";
                            const baseName = original.replace(/\.(jpe?g)$/i, "");
                            const small = `${baseName}-480w${ext}`;
                            const medium = `${baseName}-800w${ext}`;
                            const large = `${baseName}-1200w${ext}`;
                            const srcSet = `${baseUrl}${small} 480w, ${baseUrl}${medium} 800w, ${baseUrl}${large} 1200w`;
                            return (
                            <picture
                                key={index}
                                alt={item.altText || "Media Image"}
                                className="index__hero-image"
                                onLoad={() => setLoadedImages((prev) => prev + 1)}
                            >
                                <source
                                    media="(max-width: 900px)"
                                    srcSet={`${baseUrl}${large}`}
                                />
                                <img
                                    src={`${baseUrl}${item.filepath}`}
                                    alt="Media Image"
                                />
                                </picture>
                            );
                        })
                    ) : null}
                </div>

                <p className="index__hero-description" ref={description}>
                    QUIOTE is a socio-spatial design agency crafting utopian futures from within the contested terrains of the Global South.
                </p>
            </div>
        </div>
    );
}

export default IndexHero;