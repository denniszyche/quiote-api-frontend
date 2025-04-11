import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUserRoles } from "../../utils/auth.js";
import Spinner from "../../components/Spinner";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";

const EditCategory = () => {
    const { id } = useParams();
    const [formData, setFormData] = useState({
        name: "",
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

    /**
     * Handle Input change
     * @param {*} e
     */
    const handleChange = (e) => {
        const { name, value } = e.target || e;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    /**
     * Handle form submit
     * @param {*} e
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name) {
            toast.current.show({
                severity: "warn",
                summary: "Validation Error",
                detail: "Bitte geben Sie einen Namen ein.",
            });
            return;
        }
        if (formData.name.length < 3) {
            toast.current.show({
                severity: "warn",
                summary: "Validation Error",
                detail: "Der Name muss mindestens 3 Zeichen lang sein.",
            });
            return;
        }
        try {
            const response = await fetch(`http://localhost:2109/category/post/${id}`, {
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
                detail: "Kategorie erfolgreich bearbeitet",
            });
            setTimeout(() => {
                navigate("/all-categories");
            }, 1500);
        } catch (error) {
            console.error("Error:", error);
            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: error.message,
            });
        }
    };
    
    useEffect(() => {
        const fetchCategory = async () => {
            try {
                const response = await fetch(`http://localhost:2109/category/post/${id}`, {
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
                    name: data.category.name
                });
            } catch (error) {
                toast.current.show({
                    severity: "error",
                    summary: "Error",
                    detail: error.message,
                });
            }
        }
        
        fetchCategory();
        
    }, [id]);

    if (loading) {
        return <Spinner />;
    }

    return (
        <>
            <Toast ref={toast} />
            <div className="flex">
                <div className="card width-shadow">
                    <h4>Kategorie hinzufügen</h4>
                    <form onSubmit={handleSubmit}>
                        <label 
                            htmlFor="name"
                            className="text-secondary font-semibold block mb-3">
                            Name
                        </label>
                        <InputText
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full p-calendar p-component p-inputwrapper mb-3"
                        />
                        <Button type="submit" label="Submit" />
                    </form>
                </div>
            </div>
        </>
    );
}

export default EditCategory;