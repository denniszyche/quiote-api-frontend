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

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await fetchFromApi("/post/all-posts", {
                    method: "GET"
                });
                setData(data.posts || []);
                console.log("Data fetched successfully:", data.posts);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                onLoaded();
            }
        };
        fetchData();
    }, []);

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
        <ul className="index__posts-list">
            {data
                .filter((post) => post.status === "published" && post.featured === "1")
                .map((post) => {
                    const translation = post.translations.find((t) => t.language === language);
                    return <FeaturedPost key={post.id} post={post} translation={translation} />;
                })}
                
            {data.map((post) => renderPost(post))}
            {/* {data
                .filter((post) => post.status === "published" && post.featured !== "1")
                .map((post) => {
                    const translation = post.translations.find((t) => t.language === language);
                    return (
                        <li key={post.id} className="index__posts-list-item">
                            <h3>{translation?.title || "No title available"}</h3>
                            <p>{translation?.content || "No content available"}</p>
                        </li>
                    );
                })} */}
        </ul> 
    );

}

export default IndexList;