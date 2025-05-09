import { useRef, useState, useEffect, useLayoutEffect, forwardRef } from "react";
import gsap from "gsap";

const Nav = forwardRef((props, ref) => {
    const [language, setLanguage] = useState("en");
    const header = ref || useRef(null);
    useEffect(() => {
        const storedLanguage = localStorage.getItem("language");
        if (storedLanguage) {
            setLanguage(storedLanguage);
        } else {
            setLanguage("en");
        }
    }, []);

    useLayoutEffect(() => {
        gsap.set(header.current, { yPercent: -100 });
    }, []);


    const handleLanguageChange = (newLanguage) => {
        setLanguage(newLanguage);
        localStorage.setItem("language", newLanguage);
        window.location.reload();
    }
    const handleLanguageSwitcherClick = () => {
        if (language === "en") {
            handleLanguageChange("es");
        } else {
            handleLanguageChange("en");
        }
    }


    return (
        <header className="nav" ref={header}>
            <div className="nav__logo">
                <a href="/">
                    Q
                </a>
            </div>
            <nav className="nav__menu">
                <ul>
                    <li><a href="/info">Info</a></li>
                    <li>
                        <button 
                            className="nav_language-switcher"
                            type="button"
                            aria-label="Language Switcher"
                            onClick={() => {
                                handleLanguageSwitcherClick();
                                handleLanguageChange(language === "en" ? "es" : "en");
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleLanguageSwitcherClick();
                                    handleLanguageChange(language === "en" ? "es" : "en");
                                }
                            }}
                            tabIndex={0}
                            >
                            <span className={`nav_language-switcher__text ${language === "en" ? "active" : ""}`}>
                                En
                            </span>
                            <span className="nav_language-switcher__icon">
                                |
                            </span>
                            <span className={`nav_language-switcher__text ${language === "es" ? "active" : ""}`}>
                                Es
                            </span>
                        </button>
                    </li>
                </ul>
            </nav>
        </header>
    );
});

export default Nav;