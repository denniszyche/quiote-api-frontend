import { useContext } from "react";
import { LanguageContext } from "../components/LanguageContext";
import Image from "../components/Image";

const LinkComponent = ({ post, translation }) => {
    const { language } = useContext(LanguageContext);
    
    const featuredImage = post.featuredImage ? post.featuredImage.filepath : null;
    const hasNoThumbnail = post.featuredImage ? 'has--thumbnail' : 'has--no-thumbnail';
    const categoryTranslation = post.categories[0]?.translations.find(
        (t) => t.language === language
    ) || null;
    // Function to shorten the excerpt
    const shortenExcerpt = (text, maxLength) => {
        if (!text) return "";
        return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
    };
    
    return (
        <li key={post.id} className="index__posts-list-item">
            <a href={post.external_link} className={`index__posts-list-item--link ${hasNoThumbnail}`} target="_blank" rel="noopener noreferrer">
                <div className="index__posts-list-item---header">
                    <div className="index__posts-list-item--category">
                        <span className="circle"></span>
                        <span>{categoryTranslation?.name || ""}</span>
                    </div>
                </div>

                <div className="index__posts-list-item---footer">
                    <div className="index__posts-list-item--excerpt">
                        <p>{shortenExcerpt(translation?.excerpt, 150)}</p>
                    </div>
                    <div className="index__posts-list-item--title">
                        <h3>{translation?.title || ""}</h3>
                    </div>
                </div>

                {featuredImage && (
                    <div className="index__posts-list-item--image">
                        <Image
                            src={`https://quiote-api.dztestserver.de/${featuredImage}`}
                            alt={translation?.title || ""}
                            className="index__posts-list-item--featured-image-src"
                        />
                    </div>
                )}
            </a>
        </li>
    );
}

export default LinkComponent;