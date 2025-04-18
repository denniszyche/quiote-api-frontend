import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUserRoles } from "../../utils/auth.js";
import Spinner from "../../components/Spinner";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";

const EditTagPage = () => {
    const { id } = useParams();
    const [formData, setFormData] = useState({
        translations: [
            { language: "en", name: ""},
            { language: "es", name: ""},
        ],
    });
    const toast = useRef(null);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAccess = () => {
            const userRoles = getUserRoles();
            const userCanAccess = userRoles.some((role) => role.name === "admin");
            if (!userCanAccess) {
                navigate("/dashboard");
            } else {
                setLoading(false);
            }
        };
        checkAccess();
    }, [navigate]);
    
    useEffect(() => {
        const fetchTag = async () => {
            try {
                const response = await fetch(`http://localhost:3000/tag/${id}`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    }
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(
                        errorData.message || "An unexpected error occurred."
                    );
                }
                const data = await response.json();
                setFormData({
                    ...formData,
                    translations: data.tag.translations
                        .map((translation) => ({
                        name: translation.name,
                        language: translation.language,
                    })),
                });
            } catch (error) {
                toast.current.show({
                    severity: "error",
                    summary: "Error",
                    detail: error.message,
                });
            }
        }
        fetchTag();
    }, [id]);

    /**
     * Handle translation change
     * @param {*} index
     * @param {*} field
     * @param {*} value
     */
    const handleTranslationChange = (index, field, value) => {
        const updatedTranslations = [...formData.translations];
        updatedTranslations[index][field] = value;
        setFormData({ ...formData, translations: updatedTranslations });
    };

    /**
     * Handle form submit
     * @param {*} e
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.translations.some((translation) => !translation.name)) {
            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: "Please enter a name in all languages.",
            });
            return;
        }
        try {
            const response = await fetch(`http://localhost:3000/tag/update-tag/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify(formData),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || "An unexpected error occurred."
                );
            }
            toast.current.show({
                severity: "success",
                summary: "Success",
                detail: "Tag updated successfully.",
            });
        } catch (error) {
            console.error("Error:", error);
            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: error.message,
            });
        }
    };

    if (loading) {
        return <Spinner />;
    }

    return (
        <>
            <Toast ref={toast} />
            <div className="flex">
                <div className="card width-shadow">
                    <h4>Edit Tag</h4>
                    <form onSubmit={handleSubmit}>
                        {formData.translations.map((translation, index) => (
                            <div key={index} className="field">
                                <label htmlFor={`name-${translation.language}`}>
                                    Name ({translation.language})
                                </label>
                                <InputText
                                    id={`name-${translation.language}`}
                                    name={`name-${translation.language}`}
                                    value={translation.name}
                                    onChange={(e) => handleTranslationChange(index, "name", e.target.value)}
                                    required
                                    className="w-full"
                                />
                            </div>
                        ))}
                        <Button type="submit" label="Submit" />
                    </form>
                </div>
            </div>
        </>
    );
}

export default EditTagPage;