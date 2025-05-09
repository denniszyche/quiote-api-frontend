import { useContext, useEffect, useState } from "react";
import { LanguageContext } from "../../components/LanguageContext";
import {fetchFromApi}  from "../../../utils/fetchFromApi.js";

const IndexDescription = ({ onLoaded }) => {
    const { language } = useContext(LanguageContext);
    const [description, setDescription] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await fetchFromApi("/setting/all-settings", {
                    method: "GET"
                });
                const infoSetting = data.settings.find(setting => setting.key === "info");
                if (infoSetting) {
                    setDescription(infoSetting.value);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                console.log("IndexDescription successfully:");
                onLoaded();
            }
        };
        fetchData();
    }, []);

    return (
        <div className="grid">
            <div className="index__description">
                <p>{description[language]}</p>
            </div>
        </div>
    )
}

export default IndexDescription;