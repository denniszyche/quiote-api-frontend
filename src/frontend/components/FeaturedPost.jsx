import { useContext } from "react";
import { LanguageContext } from "../components/LanguageContext";

const FeaturedPost = ({ post, translation }) => {
    const { language } = useContext(LanguageContext);
    
    const categoryTranslation = post.categories[0]?.translations.find(
        (t) => t.language === language
    ) || null;

    return (
        <li key={post.id} className="index__posts-list-item--featured">

            <a href={`/post/${post.id}`} className="index__posts-list-item--featured-link">

                <div className="index__posts-list-item--featured-header">
                    <div className="index__posts-list-item--featured-category">
                        <span className="circle"></span>
                        <span>{categoryTranslation?.name || ""}</span>
                    </div>
                    <div className="index__posts-list-item--featured-title">
                        <h3>{translation?.title || ""}</h3>
                    </div>
                    <div className="index__posts-list-item--featured-excerpt">
                        <p>{translation?.excerpt || ""}</p>
                    </div>
                </div>
                <div className="index__posts-list-item--featured-image">
                    Image
                </div>
            </a>
    
        </li>
    );
};

export default FeaturedPost;