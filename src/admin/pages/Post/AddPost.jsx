import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Spinner from "../../components/Spinner";
import MediaLibraryModal from "../../components/MediaLibraryModal";
import MediaLibraryModalSingle from "../../components/MediaLibraryModalSingle";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Dropdown } from "primereact/dropdown";
import { Checkbox } from "primereact/checkbox";
import { InputSwitch } from 'primereact/inputswitch';
import { Image } from 'primereact/image';
import ContentEditor from "../../components/ContentEditor";
import {fetchFromApi}  from "../../../utils/fetchFromApi.js";
import { Calendar } from "primereact/calendar";

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
        status: "published",
        post_type: "view",
        categories: [],
        tags: [],
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
        createdAt: new Date(),
        external_link: "",
        collaborator: [],
        photographer: [],
    });
    const [categories, setCategories] = useState([]);
    const [tags, setTags] = useState([]);
    const toast = useRef(null);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [isMediaLibraryVisible, setIsMediaLibraryVisible] = useState(false);
    const [isMediaLibraryGalleryVisible, setIsMediaLibraryGalleryVisible] = useState(false);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetchFromApi(
                    "/category/all-categories",
                    {
                        method: "GET",
                        headers: {
                            "Authorization": `Bearer ${localStorage.getItem("token")}`,
                        },
                    }
                );
                setCategories(response.categories);
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

    useEffect(() => {
        const fetchTags = async () => {
            try {
                const response = await fetchFromApi(
                    "/tag/all-tags",
                    {
                        method: "GET",
                        headers: {
                            "Authorization": `Bearer ${localStorage.getItem("token")}`,
                        },
                    }
                );
                setTags(response.tags);
                setLoading(false);
            } catch (error) {
                toast.current.show({
                    severity: "error",
                    summary: "Error",
                    detail: "Failed to fetch tags.",
                });
            }
        };
        fetchTags();
    }, []);
    
    const handleFeaturedMediaSelect = async (image) => {
        setFormData({
            ...formData,
            featuredImageId: image.id,
            featuredImageUrl: `https://quiote-api.dztestserver.de/${image.filepath}`,
        });
    };

    const handleGalleryMediaSelect = async (imageIds) => {
        console.log("Selected image IDs:", imageIds);
        try {
            const imageUrls = await Promise.all(
                imageIds.map(async (imageId) => {
                    const response = await fetchFromApi(
                        `/media/${imageId}`,
                        {
                            method: "GET",
                            headers: {
                                "Authorization": `Bearer ${localStorage.getItem("token")}`,
                            },
                        }
                    );
                    return `https://quiote-api.dztestserver.de/${response.media.filepath}`;
                })
            );
            setFormData({
                ...formData,
                galleryImageIds: imageIds,
                galleryImageUrls: imageUrls,
            });
        } catch (error) {
            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: "Failed to fetch image details.",
            });
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target || e;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleTranslationChange = (index, field, value) => {
        const updatedTranslations = [...formData.translations];
        updatedTranslations[index][field] = value;
        setFormData({ ...formData, translations: updatedTranslations });
    };

    const onCategoryChange = (e) => {
        let _selectedCategories = [...formData.categories || []];
        if (e.checked)
            _selectedCategories.push(e.value);
        else
            _selectedCategories = _selectedCategories.filter(category => category.id !== e.value.id);
        setFormData({ ...formData, categories: _selectedCategories });
    };
    
    const onTagChange = (e) => {
        let _selectedTags = [...formData.tags || []];
        if (e.checked)
            _selectedTags.push(e.value);
        else
            _selectedTags = _selectedTags.filter(tag => tag.id !== e.value.id);
        setFormData({ ...formData, tags: _selectedTags });
    }

    const handleAddCollaborator = () => {
        setFormData({
            ...formData,
            collaborator: [...formData.collaborator, { name: "", link: "" }],
        });
    };

    const handleCollaboratorChange = (index, field, value) => {
        const updatedCollaborators = [...formData.collaborator];
        updatedCollaborators[index][field] = value;
        setFormData({ ...formData, collaborator: updatedCollaborators });
    };

    const handleRemoveCollaborator = (index) => {
        const updatedCollaborators = formData.collaborator.filter((_, i) => i !== index);
        setFormData({ ...formData, collaborator: updatedCollaborators });
    };
    const handleAddPhotographer = () => {
        setFormData({
            ...formData,
            photographer: [...formData.photographer, { name: "", link: "" }],
        });
    }
    const handlePhotographerChange = (index, field, value) => {
        const updatedPhotographers = [...formData.photographer];
        updatedPhotographers[index][field] = value;
        setFormData({ ...formData, photographer: updatedPhotographers });
    };
    const handleRemovePhotographer = (index) => {
        const updatedPhotographers = formData.photographer.filter((_, i) => i !== index);
        setFormData({ ...formData, photographer: updatedPhotographers });
    };

    /**
     * Handle form submit
     * @param {*} e
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.translations.some(translation => !translation.title)) {
            toast.current.show({
                severity: "warn",
                summary: "Validation Error",
                detail: "Please enter a title in all languages.",
            });
            return;
        }
        try {
            await fetchFromApi(
                "/post/create-post",
                {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("token")}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                }
            );  
            toast.current.show({
                severity: "success",
                summary: "Success",
                detail: "Post created successfully",
            });
            setTimeout(() => {
                navigate("/all-posts");
            }, 1500);
        } catch (error) {
            const errorMessages = error.errors
                ? error.errors.map((err) => err.msg).join(", ")
                : error.message;
            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: errorMessages,
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
                        {/* Main Content */}
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
                        {/* Gallery */}
                        <div className="card width-shadow w-100 mb-3">
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
                        {/* Collaborators */}
                        <div className="card width-shadow w-100 mb-3">
                            <h4>Collaborators</h4>
                            {formData.collaborator.map((collab, index) => (
                                <div key={index} className="flex align-items-end gap-3 mb-3">
                                    <div className="flex-grow-1">
                                        <label htmlFor={`collaborator-name-${index}`} className="block mb-2">
                                            Name
                                        </label>
                                        <InputText
                                            id={`collaborator-name-${index}`}
                                            value={collab.name}
                                            onChange={(e) => handleCollaboratorChange(index, "name", e.target.value)}
                                            placeholder="Enter collaborator name"
                                            className="w-full"
                                        />
                                    </div>
                                    <div className="flex-grow-1">
                                        <label htmlFor={`collaborator-link-${index}`} className="block mb-2">
                                            Link
                                        </label>
                                        <InputText
                                            id={`collaborator-link-${index}`}
                                            value={collab.link}
                                            onChange={(e) => handleCollaboratorChange(index, "link", e.target.value)}
                                            placeholder="Enter collaborator link"
                                            className="w-full"
                                        />
                                    </div>
                                    <Button
                                        icon="pi pi-trash"
                                        className="p-button-danger p-button-sm mb-1"
                                        onClick={() => handleRemoveCollaborator(index)}
                                        type="button"
                                    />
                                </div>
                            ))}
                            <Button
                                label="Add Collaborator"
                                icon="pi pi-plus"
                                className="p-button-sm"
                                onClick={handleAddCollaborator}
                                type="button"
                            />
                        </div>
                        {/* Photographers */}
                        <div className="card width-shadow w-100 mb-3">
                            <h4>Photographers</h4>
                            {formData.photographer.map((photo, index) => (
                                <div key={index} className="flex align-items-end gap-3 mb-3">
                                    <div className="flex-grow-1">
                                        <label htmlFor={`photographer-name-${index}`} className="block mb-2">
                                            Name
                                        </label>
                                        <InputText
                                            id={`photographer-name-${index}`}
                                            value={photo.name}
                                            onChange={(e) => handlePhotographerChange(index, "name", e.target.value)}
                                            placeholder="Enter photographer name"
                                            className="w-full"
                                        />
                                    </div>
                                    <div className="flex-grow-1">
                                        <label htmlFor={`photographer-link-${index}`} className="block mb-2">
                                            Link
                                        </label>
                                        <InputText
                                            id={`photographer-link-${index}`}
                                            value={photo.link}
                                            onChange={(e) => handlePhotographerChange(index, "link", e.target.value)}
                                            placeholder="Enter photographer link"
                                            className="w-full"
                                        />
                                    </div>
                                    <Button
                                        icon="pi pi-trash"
                                        className="p-button-danger p-button-sm mb-1"
                                        onClick={() => handleRemovePhotographer(index)}
                                        type="button"
                                    />
                                </div>
                            ))}
                            <Button
                                label="Add Photographer"
                                icon="pi pi-plus"
                                className="p-button-sm"
                                onClick={handleAddPhotographer}
                                type="button"
                            />
                        </div>
                    </div>
                    <div className="w-full md:w-4">
                        <div className="card width-shadow w-100 mb-3">
                            <label htmlFor="createdAt" className="text-secondary font-semibold block mb-3">
                                Publish Date
                            </label>
                            <Calendar
                                id="createdAt"
                                name="createdAt"
                                value={formData.createdAt || new Date()}
                                onChange={(e) => handleChange({ target: { name: "createdAt", value: e.value } })}
                                showTime
                                dateFormat="dd/mm/yy"
                                className="w-full mb-3"
                            />
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
                            {/* Conditionally render the external_link input */}
                            {formData.post_type === "link" && (
                                <>
                                    <label
                                        htmlFor="external_link"
                                        className="text-secondary font-semibold block mb-3">
                                        External Link</label>
                                    <InputText
                                        id="external_link"
                                        name="external_link"
                                        value={formData.external_link}
                                        onChange={handleChange}
                                        className="w-full mb-3"
                                    /> 
                                </>
                            )}
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
                                    onClick={() => {
                                        setIsMediaLibraryVisible(true);
                                    }}
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
                                        {category.translations.map((translation, index) => (
                                            <span key={index} className="mr-2">
                                                {translation.name}
                                                {index === 0 && " /"}
                                            </span>
                                        ))}
                                    </label>
                                </div>
                            ))}
                        </div>
                        <div className="card width-shadow w-100 mb-3">
                            <h4>Tags</h4>
                            {tags.map((tag, index) => (
                                <div key={index} className="flex align-items-center m-2">
                                    <Checkbox
                                        inputId={tag.id}
                                        name="tag"
                                        value={tag}
                                        onChange={onTagChange}
                                        checked={formData.tags.some((item) => item.id === tag.id)}
                                    />
                                    <label htmlFor={tag.id} className="ml-2">
                                        {tag.translations.map((translation, index) => (
                                            <span key={index} className="mr-2">
                                                {translation.name}
                                                {index === 0 && " /"}
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
                visible={isMediaLibraryGalleryVisible}
                onHide={() => setIsMediaLibraryGalleryVisible(false)}
                onSelect={handleGalleryMediaSelect}
            /> 
            <MediaLibraryModalSingle
                visible={isMediaLibraryVisible}
                onHide={() => setIsMediaLibraryVisible(false)}
                onSelect={handleFeaturedMediaSelect}
            />
        </>
    );
};
export default AddPostPage;