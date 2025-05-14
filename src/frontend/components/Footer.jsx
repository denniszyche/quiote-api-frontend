import { useLayoutEffect, useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { fetchFromApi } from "../../utils/fetchFromApi.js";

gsap.registerPlugin(ScrollTrigger);

const Footer = ({ onLoaded, allLoaded }) => {
    const [contact, setContact] = useState([]);
    const component = useRef(null);
    const content = useRef(null);
    const { navRef } = useOutletContext();
    // const title = useRef(null);
    // const description = useRef(null);
    

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await fetchFromApi("/setting/all-settings", {
                    method: "GET"
                });
                
                const contactSetting = data.settings.find(setting => setting.key === "contact");
                if (contactSetting) {
                    console.log("contactSetting", contactSetting);
                    setContact(contactSetting.value);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } 
        };
        fetchData();
    }, []);

    useLayoutEffect(() => {
        
        const ctx = gsap.context(() => {

            // gsap.to(content.current, {
            //     clipPath: "inset(5% round 1rem)",
            //     duration: 1, 
            //     scrollTrigger: {
            //         trigger: content.current,
            //         start: "top bottom",
            //         end: "top top",
            //         scrub: 1,
            //         onEnter: () => {
            //             gsap.to(navRef.current, {
            //                 yPercent: -100,
            //                 duration: 0.5,
            //                 ease: "power2.out",
            //             });
            //         },
            //         onLeaveBack: () => {
            //             gsap.to(navRef.current, {
            //                 yPercent: 0,
            //                 duration: 0.5,
            //                 ease: "power2.out",
            //             });
            //         }
            //     },
            // });


        }, component);

        return () => {
            ctx.revert();
        };
    }, [component]);


    return (
        <div className="footer" ref={component}>
        
            <div className="footer__content" ref={content}>

                <div className="footer__content-claim">
                    <h3><span className="circle" aria-hidden="true"></span>QUIOTE is a socio-spatial design agency crafting utopian futures from within the contested terrains of the Global South.</h3>
                </div>

                <div className="footer__content-contact">
                    <dl className="footer__content-contact-list">
                        <dt className="sr-only">Address</dt>
                        <dd>{contact.street}</dd>
                        <dd>{contact.colonia}</dd>
                        <dd>{contact.region}</dd>
                        <dd>{contact.city}</dd>
                    </dl>
                </div>

                <div className="footer__content-contact">
                    <dl className="footer__content-contact-list">
                        <dt className="sr-only">Contact</dt>
                        <dd>
                            <a href={`mailto:${contact.email}`} className="footer__content-contact-link mailaddress">
                                {contact.email}
                            </a>
                        </dd>
                        <dd>
                            <a href={`tel:${contact.phone}`} className="footer__content-contact-link">
                                {contact.phone}
                            </a>
                        </dd>
                    </dl>
                </div>

            </div>

        </div>
    );
}

export default Footer;