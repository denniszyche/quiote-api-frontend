import { useContext, useEffect, useState } from "react";
import { LanguageContext } from "../components/LanguageContext";
import ViewComponent from "../components/ViewComponent";
import LinkComponent from "../components/LinkComponent";
import PlainComponent from "../components/PlainComponent";
import FeaturedPost from "../components/FeaturedPost";
import {fetchFromApi}  from "../../utils/fetchFromApi.js";

const IndexList = ({ onLoaded }) => {
    const { language } = useContext(LanguageContext);
    const [data, setData] = useState([]);
    const [categories, setCategories] = useState([]);
    const [activeCategory, setActiveCategory] = useState("all");
    const [isMenuOpen, setIsMenuOpen] = useState(false);


    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await fetchFromApi("/post/all-posts", {
                    method: "GET"
                });
                setData(data.posts || []);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                onLoaded();
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const categoriesResponse = await fetchFromApi("/category/all-categories", {
                    method: "GET",
                });
                setCategories(categoriesResponse.categories || []);
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };

        fetchCategories();
    }, []);

    const toggleMenu = () => {
        setIsMenuOpen((prev) => !prev);
    };

    const getCategoryTranslation = (category) => {
        const translation = category.translations.find((t) => t.language === language);
        return translation ? translation.name : category.translations[0]?.name;
    };

    const handleCategoryClick = (slug) => {
        setActiveCategory(slug);
    }

    const getTranslation = (key) => {
        const translations = {
            en: {
                allCategories: "All Categories",
                toggleMenu: "Toggle Category Menu",
            },
            es: {
                allCategories: "Todas las Categorías",
                toggleMenu: "Alternar Menú de Categorías",
            },
        };
        return translations[language]?.[key] || key;
    };

    const renderPost = (post) => {
        const translation = post.translations.find((t) => t.language === language);
        switch (post.post_type) {
            case "view":
                return <ViewComponent key={post.id} post={post} translation={translation} />;
            case "link":
                return <LinkComponent key={post.id} post={post} translation={translation} />;
            case "plain":
                return <PlainComponent key={post.id} post={post} translation={translation} />;
            default:
                return (
                    <></>
                );
        }
    };

    return (
        <>
            <div className="index__categories">
                <div className="index__categories-container">
                    {/* Toggle Button */}
                    <button
                        className="index__categories-btn "
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

                    {/* Collapsible Menu */}
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
                                                activeCategory === category.slug ? "active-cat" : ""
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
            </div>
            <ul className="index__posts-list">
                {data
                    .filter((post) => {
                        // Filter by category if activeCategory is not "all"
                        const matchesCategory =
                            activeCategory === "all" ||
                            post.categories.some((category) => category.id === activeCategory);

                        return post.status === "published" && post.featured === "1" && matchesCategory;
                    })
                    .map((post) => {
                        const translation = post.translations.find((t) => t.language === language);
                        return <FeaturedPost key={post.id} post={post} translation={translation} />;
                    })}
                {data
                    .filter((post) => {
                        // Filter by category if activeCategory is not "all"
                        const matchesCategory =
                            activeCategory === "all" ||
                            post.categories.some((category) => category.id === activeCategory);

                        return post.status === "published" && post.featured !== "1" && matchesCategory;
                    })
                    .map((post) => renderPost(post))}
            </ul> 
        </>
    );

}

export default IndexList;