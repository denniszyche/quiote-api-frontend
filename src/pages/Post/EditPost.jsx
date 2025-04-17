import React, { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
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
import { format } from "date-fns";

const EditPostPage = () => {
    const { id } = useParams();
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
        createdAt: "",
        updatedAt: "",
    });
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const toast = useRef(null);
    const [isMediaLibraryVisible, setIsMediaLibraryVisible] = useState(false);
    const [isMediaLibraryGalleryVisible, setIsMediaLibraryGalleryVisible] = useState(false);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await fetch(`http://localhost:3000/post/${id}`, 
                    {
                        method: "GET",
                        headers: {
                            "Authorization": `Bearer ${localStorage.getItem("token")}`,
                        },
                    }
                );
                if (!response.ok) {
                    throw new Error("Failed to fetch absence");
                }
                const data = await response.json();
                
                let featuredImageUrl = "";
                if (data.post.featuredImageId) {
                    const imageResponse = await fetch(`http://localhost:3000/media/${data.post.featuredImageId}`, {
                        method: "GET",
                        headers: {
                            "Authorization": `Bearer ${localStorage.getItem("token")}`,
                        },
                    });
                    if (imageResponse.ok) {
                        const imageData = await imageResponse.json();
                        featuredImageUrl = `http://localhost:3000/${imageData.media.filepath}`;
                    }
                }
                setFormData({
                    ...formData,
                    title: data.post.title,
                    excerpt: data.post.excerpt,
                    content: data.post.content,
                    featuredImageId: data.post.featuredImageId,
                    featuredImageUrl, 
                    featured: data.post.featured,
                    status: data.post.status,
                    details: data.post.details,
                    categories: data.post.categories.map((cat) => cat.id),
                    createdAt: data.post.createdAt,
                    updatedAt: data.post.updatedAt,
                });
                data.post.gallery.forEach((image) => {
                    const imageUrl = `http://localhost:3000/${image.filepath}`;
                    setFormData((prevState) => ({
                        ...prevState,
                        galleryImageUrls: [...prevState.galleryImageUrls, imageUrl],
                        galleryImageIds: [...prevState.galleryImageIds, image.id],
                    }));
                });
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
    }, [id]);
    
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
            } catch (error) {
                console.error("Error fetching categories:", error);
                toast.current.show({
                    severity: "error",
                    summary: "Error",
                    detail: "Kategorien konnten nicht geladen werden.",
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
     * Handle clear all gallery images
     */
    const handleClearAllGalleryImages = () => {
        setFormData({
            ...formData,
            galleryImageUrls: [],
            galleryImageIds: [], // Reset the IDs as well
        });
    };

    /**
     * Handle category change
     * @param {*} e
     */
    const onCategoryChange = (e) => {
        let _selectedCategories = [...formData.categories || []];
        if (e.checked) {
            _selectedCategories.push(e.value);
        } else {
            _selectedCategories = _selectedCategories.filter((id) => id !== e.value);
        }
        setFormData({ ...formData, categories: _selectedCategories });
    };

    /**
     * Format the date to dd/MM/yyyy
     * @param {*} value
     * @returns
     */
    const formatDate = (value) => {
        if (!value) return "";
        const date = new Date(value);
        return format(date, "dd/MM/yyyy");
    };

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
            const response = await fetch(`http://localhost:3000/post/update-post/${id}`, {
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
                detail: "Post updated successfully.",
            });
        } catch (error) {
            console.error("Error:", error);
            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: error.message,
            });
        }
    }

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
                                <div>
                                    <div className="flex flex-wrap gap-2 mt-3 mb-3">
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
                                    <Button
                                        label="Clear All"
                                        icon="pi pi-trash"
                                        onClick={handleClearAllGalleryImages}
                                        className="p-button-danger p-button-sm"
                                        type="button"
                                    />
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
                                htmlFor="createdAt"
                                className="text-secondary font-semibold block mb-3">
                                Created At</label>
                            <InputText
                                id="createdAt"
                                name="createdAt"
                                value={formatDate(formData.createdAt)}
                                onChange={handleChange}
                                disabled
                                className="w-full p-calendar p-component p-inputwrapper mb-3"
                            />
                            <label 
                                htmlFor="updatedAt"
                                className="text-secondary font-semibold block mb-3">
                                Updated At</label>
                            <InputText
                                id="updatedAt"
                                name="updatedAt"
                                value={formatDate(formData.updatedAt)}
                                onChange={handleChange}
                                disabled
                                className="w-full p-calendar p-component p-inputwrapper mb-3"
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
                            {categories.map((category) => (
                                <div key={category.id} className="flex align-items-center m-2">
                                    <Checkbox
                                        inputId={category.id}
                                        name="category"
                                        value={category.id} 

                                        onChange={onCategoryChange}
                                        checked={formData.categories.includes(category.id)}
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
                selectedMedia={formData.galleryImageIds} 
            />
        </>
    );
}
export default EditPostPage;