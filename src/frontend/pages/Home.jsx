import { useState, useEffect } from "react";
import Nav from "../components/Nav";
import IndexHero from "../components/IndexHero";
import IndexDescription from "../components/IndexDescription";
import IndexList from "../components/IndexList";
import Loader from "../components/Loader";

const Home = () => {
    const [isIndexHeroLoaded, setIndexHeroLoaded] = useState(false);
    const [isIndexListLoaded, setIndexListLoaded] = useState(false);
    const [isIndexDescription, setIndexDescription] = useState(false);
    const [allLoaded, setAllLoaded] = useState(false);

    useEffect(() => {
        if (isIndexHeroLoaded && isIndexListLoaded && isIndexDescription) {
            console.log("All components are loaded");
            setAllLoaded(true);
        }
    }, [isIndexHeroLoaded, isIndexDescription, isIndexListLoaded]);

    return (
        <div className="index">
            {!isIndexHeroLoaded || !isIndexListLoaded || !isIndexDescription ? (
                <Loader />
            ) : null}
            <IndexHero 
                onLoaded={() => setIndexHeroLoaded(true)} 
                allLoaded={allLoaded}
            />
            <IndexDescription
                onLoaded={() => setIndexDescription(true)} 
            />
            <IndexList 
                onLoaded={() => setIndexListLoaded(true)} 
            />
        </div>  
    );
}
export default Home;