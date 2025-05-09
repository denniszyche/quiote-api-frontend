import { useContext, useEffect, useState } from "react";
import { LanguageContext } from "../../components/LanguageContext";
import ViewComponent from "../../components/cards/ViewComponent";
import LinkComponent from "../../components/cards/LinkComponent";
import PlainComponent from "../../components/cards/PlainComponent";
import FeaturedComponent from "../../components/cards/FeaturedComponent";
import CategoryMenu from "../../components/controls/CategoryMenu";
import {fetchFromApi}  from "../../../utils/fetchFromApi.js";

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
                <CategoryMenu
                    categories={categories}
                    activeCategory={activeCategory}
                    setActiveCategory={setActiveCategory}
                    getCategoryTranslation={getCategoryTranslation}
                    getTranslation={getTranslation}
                />
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
                        return <FeaturedComponent key={post.id} post={post} translation={translation} />;
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