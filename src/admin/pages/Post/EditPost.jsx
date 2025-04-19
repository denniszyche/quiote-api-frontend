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
import ContentEditor from "../../components/ContentEditor";
import {fetchFromApi}  from "../../../utils/fetchFromApi.js";

const EditPostPage = () => {
    const { id } = useParams();
    const [formData, setFormData] = useState({
        featuredImageId: null,
        featuredImageUrl: "",
        galleryImageIds: [],
        galleryImageUrls: [],
        featured: false,
        status: "",
        post_type: "",
        categories: [],
        tags: [],
        createdAt: "",
        updatedAt: "",
        translations: [
            { language: "en", title: "", excerpt: "", content: "", details: {
                city: "",
                country: "",
                status: ""
            } },
            { language: "es", title: "", excerpt: "", content: "", details: {
                city: "",
                country: "",
                status: ""
            } },
        ],
    });
    const [categories, setCategories] = useState([]);
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const toast = useRef(null);
    const [isMediaLibraryVisible, setIsMediaLibraryVisible] = useState(false);
    const [isMediaLibraryGalleryVisible, setIsMediaLibraryGalleryVisible] = useState(false);

    useEffect(() => {
        const fetchPost = async () => {

            console.log("Fetching post data...");
            try {
                const response = await fetchFromApi(`/post/${id}`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                let featuredImageUrl = "";
                if (response.post.featuredImageId) {
                    const imageResponse = await fetchFromApi(`/media/${data.post.featuredImageId}`, {
                        method: "GET",
                        headers: {
                            "Authorization": `Bearer ${localStorage.getItem("token")}`,
                        },
                    });
                    featuredImageUrl = `http://localhost:3000/${imageResponse.media.filepath}`;
                }
                setFormData({
                    ...formData,
                    featuredImageId: response.post.featuredImageId,
                    featuredImageUrl, 
                    featured: response.post.featured === 1 || response.post.featured === "1",
                    status: response.post.status,
                    post_type: response.post.post_type,
                    categories: response.post.categories.map((cat) => cat.id),
                    tags: response.post.tags.map((tag) => tag.id),
                    createdAt: response.post.createdAt,
                    updatedAt: response.post.updatedAt,
                    translations: response.post.translations
                        .map((translation) => ({
                        title: translation.title,
                        excerpt: translation.excerpt,
                        content: translation.content,
                        language: translation.language,
                        details: {
                            city: translation.details.city,
                            country: translation.details.country,
                            status: translation.details.status,
                        }
                    })),
                });

                response.post.gallery.forEach((image) => {
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
                const response = await fetchFromApi("/category/all-categories", {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                setCategories(response.categories);
            } catch (error) {
                console.error("Error fetching categories:", error);
                toast.current.show({
                    severity: "error",
                    summary: "Error",
                    detail: "Categories could not be loaded.",
                });
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchTags = async () => {
            try {
                const response = await fetchFromApi("/tag/all-tags", {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                setTags(response.tags);
            } catch (error) {
                console.error("Error tags categories:", error);
                toast.current.show({
                    severity: "error",
                    summary: "Error",
                    detail: "Tags could not be loaded.",
                });
            }
        };
        fetchTags();
    }, []);


    /**
     * Handle the media library modal
     * @param {*} e
     */
    const handleFeaturedMediaSelect = async (imageId) => {
        // try {

        //     const response = await fetchFromApi(`/media/${imageId}`, {
        //         method: "GET",
        //         headers: {
        //             "Authorization": `Bearer ${localStorage.getItem("token")}`,
        //         },
        //     });
        //     if (!response.ok) {
        //         throw new Error("Failed to fetch image details.");
        //     }
        //     const data = await response.json();
        //     console.log("Image data:", data);
        //     setFormData({
        //         ...formData,
        //         featuredImageId: imageId,
        //         featuredImageUrl: `http://localhost:3000/${data.media.filepath}`,
        //     });
        // } catch (error) {
        //     console.error("Error fetching image details:", error);
        //     toast.current.show({
        //         severity: "error",
        //         summary: "Error",
        //         detail: "Failed to fetch image details.",
        //     });
        // }
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
            galleryImageIds: [],
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
     * Handle tag change
     * @param {*} e
     */
    const onTagChange = (e) => {
        let _selectedTags = [...formData.tags || []];
        if (e.checked) {
            _selectedTags.push(e.value);
        } else {
            _selectedTags = _selectedTags.filter((id) => id !== e.value);
        }
        setFormData({ ...formData, tags: _selectedTags });
    }

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
        try {
            // const response = await fetch(`http://localhost:3000/post/update-post/${id}`, {
            //     method: "PUT",
            //     headers: {
            //         "Content-Type": "application/json",
            //         "Authorization": `Bearer ${localStorage.getItem("token")}`,
            //     },
            //     body: JSON.stringify(formData),
            // });

            await fetchFromApi(`/post/update-post/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify(formData),
            });
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
                            {formData.translations.map((translation, index) => (
                                <div key={index} className="mb-4">
                                    <h4>{translation.language.toUpperCase()}</h4>
                                    <label htmlFor={`title-${translation.language}`} className="text-secondary font-semibold block mb-3">
                                        Title ({translation.language})
                                    </label>
                                    <InputText
                                        id={`title-${translation.language}`}
                                        name="title"
                                        value={translation.title}
                                        onChange={(e) => handleTranslationChange(index, "title", e.target.value)}
                                        className="w-full mb-3"
                                    />
                                    <label htmlFor={`excerpt-${translation.language}`} className="text-secondary font-semibold block mb-3">
                                        Excerpt ({translation.language})
                                    </label>
                                    <InputTextarea
                                        id={`excerpt-${translation.language}`}
                                        name="excerpt"
                                        value={translation.excerpt}
                                        onChange={(e) => handleTranslationChange(index, "excerpt", e.target.value)}
                                        rows={3}
                                        className="w-full mb-3"
                                    />
                                    <label htmlFor={`content-${translation.language}`} className="text-secondary font-semibold block mb-3">
                                        Content ({translation.language})
                                    </label>
                                    <ContentEditor
                                        id={`content-${translation.language}`}
                                        name="content"
                                        value={translation.content}
                                        onChange={(htmlValue) => handleTranslationChange(index, "content", htmlValue)}
                                        className="w-full mb-3"
                                    />
                                </div>
                            ))}
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
                                htmlFor="status"
                                className="text-secondary font-semibold block mb-3">
                                Post Type</label>
                            <Dropdown
                                id="post_type"
                                name="post_type"
                                value={formData.post_type}
                                options={[
                                    { label: "View", value: "view" },
                                    { label: "Link", value: "link" },
                                    { label: "Plain", value: "plain" },
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
                                        {category.translations.map((translation, index) => (
                                            <span key={index} className="mr-2">
                                                {translation.name} ({translation.language.toUpperCase()})
                                            </span>
                                        ))}
                                    </label>
                                </div>
                            ))}
                        </div>
                        <div className="card width-shadow w-100 mb-3">
                            <h4>Tags</h4>
                            {tags.map((tag) => (
                                <div key={tag.id} className="flex align-items-center m-2">
                                    <Checkbox
                                        inputId={tag.id}
                                        name="tag"
                                        value={tag.id} 
                                        onChange={onTagChange}
                                        checked={formData.tags.includes(tag.id)}
                                    />
                                    <label htmlFor={tag.id} className="ml-2">
                                        {tag.translations.map((translation, index) => (
                                            <span key={index} className="mr-2">
                                                {translation.name} ({translation.language.toUpperCase()})
                                            </span>
                                        ))}
                                    </label>
                                </div>
                            ))}
                        </div>

                        <div className="card width-shadow w-100 mb-3">
                            <h4>Details</h4>
                            {formData.translations.map((translation, index) => (
                                <div key={index} className="mb-4">
                                    <label htmlFor={`city-${translation.language}`} className="text-secondary font-semibold block mb-3">
                                        City ({translation.language})
                                    </label>
                                    <InputText
                                        id={`city-${translation.language}`}
                                        name="city"
                                        value={translation.details.city}
                                        onChange={(e) => handleTranslationChange(index, "details", { ...translation.details, city: e.target.value })}
                                        className="w-full mb-3"
                                    />
                                    <label htmlFor={`country-${translation.language}`} className="text-secondary font-semibold block mb-3">
                                        Country ({translation.language})
                                    </label>
                                    <InputText
                                        id={`country-${translation.language}`}
                                        name="country"
                                        value={translation.details.country}
                                        onChange={(e) => handleTranslationChange(index, "details", { ...translation.details, country: e.target.value })}
                                        className="w-full mb-3"
                                    />
                                    <label htmlFor={`status-${translation.language}`} className="text-secondary font-semibold block mb-3">
                                        Status ({translation.language})
                                    </label>
                                    <InputText
                                        id={`status-${translation.language}`}
                                        name="status"
                                        value={translation.details.status}
                                        onChange={(e) => handleTranslationChange(index, "details", { ...translation.details, status: e.target.value })}
                                        className="w-full mb-3"
                                    />
                                </div>
                            ))}
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