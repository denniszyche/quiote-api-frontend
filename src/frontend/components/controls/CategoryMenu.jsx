import { useState, useRef, useEffect } from "react";


const CategoryMenu = ({
    categories,
    activeCategory,
    setActiveCategory,
    getCategoryTranslation,
    getTranslation
}) => {
    const containerRef = useRef(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const toggleMenu = () => setIsMenuOpen((prev) => !prev);

    const handleCategoryClick = (slug) => {
        setActiveCategory(slug);
        setIsMenuOpen(false);
    };

    useEffect(() => {
        if (!isMenuOpen) return;
        const handleKeyDown = (e) => {
            if (e.key === "Escape") setIsMenuOpen(false);
        };
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isMenuOpen]);

    return (
        <div className="index__categories-container" ref={containerRef}>
            <button
                className={`index__categories-btn ` + (isMenuOpen ? "is-open" : "")}
                type="button"
                aria-label={getTranslation("toggleMenu")}
                aria-controls="drop-menu-cat"
                aria-expanded={isMenuOpen}
                onClick={toggleMenu}
            >
                <span className="index__categories-btn-settings">
                    <svg
                        className="animated-lines-dots"
                        width="15"
                        height="14"
                        viewBox="0 0 15 14"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <rect y="1.25037" width="15" height="1" fill="black"></rect>
                        <rect y="6.25049" width="15" height="1" fill="black"></rect>
                        <rect y="11.2501" width="15" height="1" fill="black"></rect>
                        <circle cx="8.12402" cy="1.875" r="1.875" fill="black"></circle>
                        <circle cx="4.37402" cy="6.87537" r="1.875" fill="black"></circle>
                        <circle cx="10.626" cy="11.8755" r="1.875" fill="black"></circle>
                    </svg>
                </span>
                <span className="index__categories-btn-text js-cat-btn-text">
                    {getTranslation("allCategories")}
                </span>
                <span className="index__categories-btn-plus"></span>
            </button>
            <div
                id="drop-menu-cat"
                className={`index__categories-panel js-cat-panel ${isMenuOpen ? "open" : ""}`}
                style={{ height: isMenuOpen ? "auto" : "0px" }}
            >
                <div className="index__categories-panel-container">
                    <ul className="index__categories-panel-list">
                        <li className="index__categories-panel-item">
                            <button
                                className={`index__categories-panel-link js-cat-link ${
                                    activeCategory === "all" ? "active-cat" : ""
                                }`}
                                type="button"
                                onClick={() => handleCategoryClick("all")}
                            >
                                {getTranslation("allCategories")}
                            </button>
                        </li>
                        {categories.map((category) => (
                            <li key={category.id} className="index__categories-panel-item">
                                <button
                                    type="button"
                                    className={`index__categories-panel-link js-cat-link ${
                                        activeCategory === category.id ? "active-cat" : ""
                                    }`}
                                    onClick={() => handleCategoryClick(category.id)}
                                >
                                    {getCategoryTranslation(category)}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default CategoryMenu;