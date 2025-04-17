import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Spinner from "../../components/Spinner";
import MediaLibraryModal from "../../components/MediaLibraryModal";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Dropdown } from "primereact/dropdown";
import { Checkbox } from "primereact/checkbox";
import { InputSwitch } from 'primereact/inputswitch';
import { Image } from 'primereact/image';

const AddPostPage = () => {
    const [formData, setFormData] = useState({
        title: "",
        excerpt: "",
        content: "",
        featuredImageId: null,
        featuredImageUrl: "",
        galleryImageIds: [],
        galleryImageUrls: [],
        featured: false,
        status: "draft",
        details: {},
        categories: [],
    });
    const [categories, setCategories] = useState([]);
    const toast = useRef(null);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [isMediaLibraryVisible, setIsMediaLibraryVisible] = useState(false);
    const [isMediaLibraryGalleryVisible, setIsMediaLibraryGalleryVisible] = useState(false);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch(
                    "http://localhost:3000/category/posts",
                    {
                        method: "GET",
                        headers: {
                            "Authorization": `Bearer ${localStorage.getItem("token")}`,
                        },
                    }

                );
                if (!response.ok) {
                    throw new Error("Failed to fetch categories.");
                }
                const data = await response.json();
                setCategories(data.categories);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching categories:", error);
                toast.current.show({
                    severity: "error",
                    summary: "Error",
                    detail: "Failed to fetch categories.",
                });
            }
        };
        fetchCategories();
    }, []);

    /**
     * Handle the media library modal
     * @param {*} e
     */
    const handleFeaturedMediaSelect = async (imageId) => {
        try {
            const response = await fetch(`http://localhost:3000/media/${imageId}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                },
            });
            if (!response.ok) {
                throw new Error("Failed to fetch image details.");
            }
            const data = await response.json();
            console.log("Image data:", data);
            setFormData({
                ...formData,
                featuredImageId: imageId,
                featuredImageUrl: `http://localhost:3000/${data.media.filepath}`,
            });
        } catch (error) {
            console.error("Error fetching image details:", error);
            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: "Failed to fetch image details.",
            });
        }
    };

    /**
     * Handle the media library modal for gallery
     * @param {*} imageIds
     */
    const handleGalleryMediaSelect = async (imageIds) => {
        try {
            const imageUrls = await Promise.all(
                imageIds.map(async (imageId) => {
                    const response = await fetch(`http://localhost:3000/media/${imageId}`, {
                        method: "GET",
                        headers: {
                            "Authorization": `Bearer ${localStorage.getItem("token")}`,
                        },
                    });
                    if (!response.ok) {
                        throw new Error("Failed to fetch image details.");
                    }
                    const data = await response.json();
                    return `http://localhost:3000/${data.media.filepath}`;
                })
            );
            setFormData({
                ...formData,
                galleryImageIds: imageIds,
                galleryImageUrls: imageUrls,
            });
        } catch (error) {
            console.error("Error fetching image details:", error);
            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: "Failed to fetch image details.",
            });
        }
    }

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
     * Handle category change
     * @param {*} e
     */
    const onCategoryChange = (e) => {
        let _selectedCategories = [...formData.categories || []];
        if (e.checked)
            _selectedCategories.push(e.value);
        else
            _selectedCategories = _selectedCategories.filter(category => category.id !== e.value.id);
        setFormData({ ...formData, categories: _selectedCategories });
    };

    /**
     * Handle form submit
     * @param {*} e
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title) {
            toast.current.show({
                severity: "warn",
                summary: "Validation Error",
                detail: "Bitte geben Sie einen Titel ein.",
            });
            return;
        }
        try {
            const response = await fetch("http://localhost:3000/post/create-post", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json",
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
                detail: "Post created successfully",
            });
            setTimeout(() => {
                navigate("/all-posts");
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
                <div className="flex flex-column md:flex-row col-12 gap-3">
                    <div className="w-full md:w-8">
                        <div className="card width-shadow w-100 mb-3">
                            <h4>New Post</h4>
                            <label 
                                htmlFor="title"
                                className="text-secondary font-semibold block mb-3">
                                Title</label>
                            <InputText
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full p-calendar p-component p-inputwrapper mb-3"
                            />
                            <label 
                                htmlFor="title"
                                className="text-secondary font-semibold block mb-3">
                                Content</label>
                            <InputTextarea
                                id="content"
                                name="content"
                                value={formData.content}
                                onChange={handleChange}
                                rows={5}
                                cols={30}
                                className="w-full p-calendar p-component p-inputwrapper mb-3"
                            />
                            <label 
                                htmlFor="excerpt"
                                className="text-secondary font-semibold block mb-3">
                                Excerpt</label>
                            <InputTextarea
                                id="excerpt"
                                name="excerpt"
                                value={formData.excerpt}
                                onChange={handleChange}
                                rows={5}
                                cols={30}
                                className="w-full p-calendar p-component p-inputwrapper mb-3"
                            />
                        </div>
                        <div className="card width-shadow w-100">
                            <label
                                htmlFor="gallery"
                                className="text-secondary font-semibold block mb-3">
                                Gallery</label>
                            <Button
                                label="Select Images"
                                icon="pi pi-image"
                                onClick={() => setIsMediaLibraryGalleryVisible(true)}
                                className="p-button-sm"
                                type="button"
                            />
                            {formData.galleryImageUrls.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {formData.galleryImageUrls.map((url, index) => (
                                        <Image
                                            key={index}
                                            src={url}
                                            zoomSrc={url}
                                            width="100"
                                            height="100"
                                            preview
                                            style={{
                                                objectFit: "cover",
                                                backgroundColor: "#f0f0f0",
                                            }}
                                        />
                                    ))} 
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="w-full md:w-4">
                        <div className="card width-shadow w-100 mb-3">
                            <label 
                                htmlFor="status"
                                className="text-secondary font-semibold block mb-3">
                                Status</label>
                            <Dropdown
                                id="status"
                                name="status"
                                value={formData.status}
                                options={[
                                    { label: "Draft", value: "draft" },
                                    { label: "Pending", value: "pending" },
                                    { label: "Published", value: "published" },
                                ]}
                                onChange={handleChange}
                                placeholder="Select a status"
                                className="w-full mb-3"
                            />
                            <label 
                                htmlFor="featured"
                                className="text-secondary font-semibold block mb-3">
                                Featured</label>                        
                            <InputSwitch
                                id="featured"
                                name="featured"
                                checked={formData.featured}
                                onChange={(e) => handleChange({ target: { name: "featured", value: e.value } })}
                        
                            />
                            <div className="flex justify-content-end">
                                <Button type="submit" label="Save" />
                            </div>
                        </div>
                        <div className="card width-shadow w-100 mb-3">
                            <h4>Categories</h4>
                            {categories.map((category, index) => (
                                <div key={index} className="flex align-items-center m-2">
                                    <Checkbox
                                        inputId={category.id}
                                        name="category"
                                        value={category}
                                        onChange={onCategoryChange}
                                        checked={formData.categories.some((item) => item.id === category.id)}
                                    />
                                    <label htmlFor={category.id} className="ml-2">
                                        {category.name}
                                    </label>
                                </div>
                            ))}
                        </div>
                        <div className="card width-shadow w-100 mb-3">
                            <label 
                                htmlFor="featuredImage"
                                className="text-secondary font-semibold block mb-3">
                                Featured Image</label>
                                <Button
                                    label="Select Image"
                                    icon="pi pi-image"
                                    onClick={() => setIsMediaLibraryVisible(true)}
                                    className="p-button-sm"
                                    type="button"
                                />
                                {formData.featuredImageUrl  && (
                                    <div className="mt-3">
                                        <Image 
                                            src={formData.featuredImageUrl}
                                            zoomSrc={formData.featuredImageUrl}
                                            width="100" 
                                            height="100" 
                                            preview
                                            style={{
                                                objectFit: "cover",
                                                backgroundColor: "#f0f0f0",
                                            }}
                                        />
                                    </div>
                                )}
                        </div>
                    </div>
                </div>
            </form>
            <MediaLibraryModal
                visible={isMediaLibraryVisible}
                onHide={() => setIsMediaLibraryVisible(false)}
                onSelect={handleFeaturedMediaSelect}
                multiSelect={false}
            />
            <MediaLibraryModal
                visible={isMediaLibraryGalleryVisible}
                onHide={() => setIsMediaLibraryGalleryVisible(false)}
                onSelect={handleGalleryMediaSelect}
                multiSelect={true}
            />
        </>
    );
};
export default AddPostPage;