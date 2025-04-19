import { useContext, useEffect, useState } from "react";
import { LanguageContext } from "../components/LanguageContext";
import FeaturedPost from "../components/FeaturedPost";
import {fetchFromApi}  from "../../utils/fetchFromApi.js";

const Home = () => {
    const { language } = useContext(LanguageContext);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await fetchFromApi("/post/all-posts-frontend", {
                    method: "GET"
                });
                setData(data.posts || []);
                // Use the data in your component
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="loading">
                <h1>Loading...</h1>
            </div>
        );
    }

    return (
        <>
            <div className="index">
                <h1>Home</h1>
                <p>Welcome to the home page!</p>

                <h2>Posts</h2>
                
                    <ul className="index__posts-list">
                        {/* Featured Posts */}
                        {data
                            .filter((post) => post.status === "published" && post.featured === "1")
                            .map((post) => {
                                const translation = post.translations.find((t) => t.language === language);
                                return <FeaturedPost key={post.id} post={post} translation={translation} />;
                            })}

                        {/* Non-Featured Posts */}
                        {data
                            .filter((post) => post.status === "published" && post.featured !== "1")
                            .map((post) => {
                                const translation = post.translations.find((t) => t.language === language);
                                return (
                                    <li key={post.id} className="index__posts-list-item">
                                        <h3>{translation?.title || "No title available"}</h3>
                                        <p>{translation?.content || "No content available"}</p>
                                    </li>
                                );
                            })}
                    </ul>
                
            </div>
        </>
    );
}
export default Home;