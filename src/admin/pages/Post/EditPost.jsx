import React, { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
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
import { format } from "date-fns";
import ContentEditor from "../../components/ContentEditor";
import {fetchFromApi}  from "../../../utils/fetchFromApi.js";
import { Calendar } from "primereact/calendar";

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
        createdAt: "",
        external_link: "",
        collaborator: [],
        photographer: [],
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
            try {
                const response = await fetchFromApi(`/post/${id}`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                let featuredImageUrl = "";
                if (response.post.featuredImageId) {
                    const imageResponse = await fetchFromApi(`/media/${response.post.featuredImageId}`, {
                        method: "GET",
                        headers: {
                            "Authorization": `Bearer ${localStorage.getItem("token")}`,
                        },
                    });
                    featuredImageUrl = `https://quiote-api.dztestserver.de/${imageResponse.media.filepath}`;
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
                    external_link: response.post.external_link,
                    createdAt: response.post.createdAt,
                    collaborator: response.post.collaborator ? response.post.collaborator : [],
                    photographer: response.post.photographer ? response.post.photographer : [],
                });
                response.post.gallery.forEach((image) => {
                    const imageUrl = `https://quiote-api.dztestserver.de/${image.filepath}`;
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
                toast.current.show({
                    severity: "error",
                    summary: "Error",
                    detail: "Tags could not be loaded.",
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
        try {
            const imageUrls = await Promise.all(
                imageIds.map(async (imageId) => {
                    const response = await fetchFromApi(`/media/${imageId}`, {
                        method: "GET",
                        headers: {
                            "Authorization": `Bearer ${localStorage.getItem("token")}`,
                        },
                    });
                    return `https://quiote-api.dztestserver.de/${response.media.filepath}`;
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

    const handleClearAllGalleryImages = () => {
        setFormData({
            ...formData,
            galleryImageUrls: [],
            galleryImageIds: [],
        });
    };

    const handleClearFeaturedImage = () => {
        setFormData({
            ...formData,
            featuredImageId: null,
            featuredImageUrl: "",
        });
    }   

    const onCategoryChange = (e) => {
        let _selectedCategories = [...formData.categories || []];
        if (e.checked) {
            _selectedCategories.push(e.value);
        } else {
            _selectedCategories = _selectedCategories.filter((id) => id !== e.value);
        }
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

    const formatDate = (value) => {
        if (!value) return "";
        const date = new Date(value);
        return format(date, "dd/MM/yyyy");
    };

    const handleChange = (e) => {
        const { name, value } = e.target || e;
        setFormData({
            ...formData,
            [name]: name === "createdAt" ? value.toISOString() : value,
        });
    };

    const handleTranslationChange = (index, field, value) => {
        const updatedTranslations = [...formData.translations];
        updatedTranslations[index][field] = value;
        setFormData({ ...formData, translations: updatedTranslations });
    };

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Form data:", formData);
        try {
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
            const errorMessages = error.errors
                ? error.errors.map((err) => err.msg).join(", ")
                : error.message;
            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: errorMessages,
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
                                value={formData.createdAt ? new Date(formData.createdAt) : new Date()}
                                onChange={handleChange}
                                dateFormat="dd/mm/yy"
                                showIcon
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
                                    <>
                                        <div className="mt-3 mb-3">
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
                                        <Button
                                            label="Clear Image"
                                            icon="pi pi-trash"
                                            onClick={handleClearFeaturedImage}
                                            className="p-button-danger p-button-sm"
                                            type="button"
                                        />
                                    </>  
                                )}
                        </div>
                        {/* Categories */}
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
                                    {category.translations
                                        .sort((a, b) => a.language.localeCompare(b.language))
                                        .map((translation, index) => (
                                            <span key={index} className="mr-2">
                                                {translation.name}
                                                {index === 0 && " /"}
                                            </span>
                                        ))}
                                    </label>
                                </div>
                            ))}
                        </div>
                        {/* Tags */}
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
                                        {tag.translations
                                            .sort((a, b) => a.language.localeCompare(b.language))
                                            .map((translation, index) => (
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
}
export default EditPostPage;