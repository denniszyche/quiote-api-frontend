import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getUserRoles } from "../../utils/auth.js";
import Spinner from "../../components/Spinner";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { FileUpload } from 'primereact/fileupload';


const AddMediaPage = () => {
    const [formData, setFormData] = useState({
        media: "",
        filename: "",
        caption: "",
        altText: "",
    });
    const toast = useRef(null);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const fileUploadRef = useRef(null);
    const [imagePreview, setImagePreview] = useState(null);
    
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
        if (!formData.media) {
            toast.current.show({
                severity: "warn",
                summary: "Validation Error",
                detail: "Please upload a media file.",
            });
            return;
        }
        if (!formData.filename) {
            toast.current.show({
                severity: "warn",
                summary: "Validation Error",
                detail: "Please enter a filename.",
            });
            return;
        }
        try {
            const formDataToSend = new FormData();
            formDataToSend.append("media", formData.media);
            formDataToSend.append("caption", formData.caption);
            formDataToSend.append("altText", formData.altText);
            formDataToSend.append("filename", formData.filename);
            const response = await fetch("http://localhost:3000/media/create-media", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                },
                body: formDataToSend,
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
                detail: "Media uploaded successfully.",
            });
            setTimeout(() => {
                navigate("/all-media");
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

    if (loading) {
        return <Spinner />;
    }
    
    return (
        <>
            <Toast ref={toast} />
            <form onSubmit={handleSubmit}>
                <div className="card width-shadow w-100">
                    <h4>New Media</h4>
                    <label htmlFor="media" className="block mb-3">
                        Media / Image
                    </label>
                    <FileUpload
                        ref={fileUploadRef} 
                        name="media"
                        accept="image/*"
                        maxFileSize={1000000}
                        mode="basic"
                        auto
                        customUpload
                        uploadHandler={(e) => {
                            const file = e.files[0];
                            setFormData({ ...formData, media: file });
                            setImagePreview(URL.createObjectURL(file));
                            fileUploadRef.current.clear();
                        }}
                        className="mb-3"
                    />
                    {imagePreview && (
                        <div className="image-preview mb-3">
                            <img src={imagePreview} alt="Preview" style={{ maxWidth: "100%", height: "auto" }} />
                        </div>
                    )}
                    <label htmlFor="filename" className="block mb-3">
                        Filename
                    </label>
                    <InputText
                        id="filename"
                        name="filename"
                        value={formData.filename}
                        onChange={handleChange}
                        className="w-full mb-3">
                    </InputText>
                    <label htmlFor="caption" className="block mb-3">
                        Caption
                    </label>
                    <InputText
                        id="caption"
                        name="caption"
                        value={formData.caption}
                        onChange={handleChange}
                        className="w-full mb-3"
                    />
                    <label htmlFor="altText" className="block mb-3">
                        Alt Text
                    </label>
                    <InputText
                        id="altText"
                        name="altText"
                        value={formData.altText}
                        onChange={handleChange}
                        className="w-full mb-3"
                    />

                    <Button type="submit" label="Save" />
                </div>
            </form>
        </>
    );
};
export default AddMediaPage;
