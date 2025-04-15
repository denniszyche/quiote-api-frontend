import React, { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import Spinner from "../../components/Spinner";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";

const EditMediaPage = () => {
    const { id } = useParams();
    const [formData, setFormData] = useState({
        filename: "",
        filepath: "",
        caption: "",
        altText: "",
        size: "",
        user: "",
        mimetype: "",
    });
    const toast = useRef(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMedia = async () => {
            try {
                const response = await fetch(`http://localhost:3000/media/${id}`, {
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
                    filename: data.media.filename,
                    filepath: data.media.filepath,
                    caption: data.media.caption,
                    altText: data.media.altText,
                    size: data.media.size,
                    user: data.media.user,
                    mimetype: data.media.mimetype,
                });
                setLoading(false);
            } catch (error) {
                toast.current.show({
                    severity: "error",
                    summary: "Error",
                    detail: error.message,
                });
            }
        }
        
        fetchMedia();
        
    }, [id]);

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
        try {
            const response = await fetch(`http://localhost:3000/media/update-media/${id}`, {
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
                detail: "Media updated successfully.",
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
    
    /**
     * Format the file size
     * @param {*} sizeInBytes
     * @returns
     */
    const formatFileSize = (sizeInBytes) => {
        if (sizeInBytes < 1024) {
            return `${sizeInBytes} bytes`;
        } else if (sizeInBytes < 1024 * 1024) {
            return `${(sizeInBytes / 1024).toFixed(2)} KB`;
        } else {
            return `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`;
        }
    };

    if (loading) {
        return <Spinner />;
    }

    return (
        <>
            <Toast ref={toast} />
            <form onSubmit={handleSubmit}>
                <div className="flex flex-column md:flex-row col-12 gap-3">
                    <div className="w-full md:w-8">
                        <div className="card width-shadow w-100">
                            <h4>Edit Media</h4>
                            <div className="image-preview mb-3">
                                <img 
                                    src={formData.filepath ? `http://localhost:3000/${formData.filepath}` : "/images/cms-logo.svg"}
                                    alt="Preview" 
                                    style={{ maxWidth: "100%", height: "auto" }} 
                                    />
                            </div>
                            <label
                                htmlFor="filename"
                                className="text-secondary font-semibold block mb-3">
                                Filename</label>
                            <InputText
                                id="filename"
                                name="filename"
                                value={formData.filename}
                                onChange={handleChange}
                                className="w-full p-calendar p-component p-inputwrapper mb-3"></InputText>
                            <label
                                htmlFor="caption"
                                className="text-secondary font-semibold block mb-3">
                                Caption</label>
                            <InputText
                                id="caption"
                                name="caption"
                                value={formData.caption}
                                onChange={handleChange}
                                className="w-full p-calendar p-component p-inputwrapper mb-3"></InputText>
                            <label
                                htmlFor="altText"
                                className="text-secondary font-semibold block mb-3">
                                Alt Text</label>
                            <InputText
                                id="altText"
                                name="altText"
                                value={formData.altText}
                                onChange={handleChange}
                                className="w-full p-calendar p-component p-inputwrapper mb-3"></InputText>
                        </div>
                    </div>
                    <div className="w-full md:w-4">
                        <div className="card width-shadow w-100 mb-3">
                            <label 
                                htmlFor="author"
                                className="text-secondary font-semibold block mb-3">
                                Author</label>
                            <InputText
                                id="author"
                                name="author"
                                value={formData.user.first_name + " " + formData.user.last_name}
                                onChange={handleChange}
                                disabled
                                className="w-full p-calendar p-component p-inputwrapper mb-3"></InputText>

                            <label
                                htmlFor="size"
                                className="text-secondary font-semibold block mb-3">
                                Size</label>
                            <InputText
                                id="size"
                                name="size"
                                value={formatFileSize(formData.size)} 
                                onChange={handleChange}
                                disabled
                                className="w-full p-calendar p-component p-inputwrapper mb-3"></InputText>
                            <label
                                htmlFor="mimetype"
                                className="text-secondary font-semibold block mb-3">
                                Mimetype</label>
                            <InputText
                                id="mimetype"
                                name="mimetype"
                                value={formData.mimetype}
                                onChange={handleChange}
                                disabled
                                className="w-full p-calendar p-component p-inputwrapper mb-3"></InputText>
                            <div className="flex justify-content-end">
                                <Button type="submit" label="Submit" />
                            </div>
                        </div>

                    </div>
                </div>
            </form>
        </>
    );
}

export default EditMediaPage;