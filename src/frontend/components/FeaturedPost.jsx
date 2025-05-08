import { useContext } from "react";
import { LanguageContext } from "../components/LanguageContext";
import Image from "../components/Image";

const FeaturedPost = ({ post, translation }) => {
    const { language } = useContext(LanguageContext);
    
    const featuredImage = post.featuredImage ? post.featuredImage.filepath : null;        
    const categoryTranslation = post.categories[0]?.translations.find(
        (t) => t.language === language
    ) || null;
    // Function to shorten the excerpt
    const shortenExcerpt = (text, maxLength) => {
        if (!text) return "";
        return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
    };

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
                        <p>{shortenExcerpt(translation?.excerpt, 150)}</p>
                    </div>
                </div>
                <div className="index__posts-list-item--featured-image">
                    {featuredImage && (
                        <Image
                            src={`https://quiote-api.dztestserver.de/${featuredImage}`}
                            alt={translation?.title || ""}
                            className="index__posts-list-item--featured-image-src"
                        />
                    )}
                </div>

                <div className="index__item-block-cross-featured" aria-hidden="true"></div>
            </a>
    
        </li>
    );
};

export default FeaturedPost;