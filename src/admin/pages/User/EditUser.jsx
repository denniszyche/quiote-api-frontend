import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUserRoles } from "../../../utils/auth.js";
import Spinner from "../../components/Spinner";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Image } from "primereact/image";
import MediaLibraryModalSingle from "../../components/MediaLibraryModalSingle";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Dropdown } from "primereact/dropdown";
import {fetchFromApi}  from "../../../utils/fetchFromApi.js";

const EditUser = () => {
    const { id } = useParams();
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        roles: "",
        userImageId: "",
        userImageUrl: "",
        linkedIn: "",
        userBioEn: "",
        userBioEs: "",
    });
    const [roles, setUserRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const toast = useRef(null);
    const navigate = useNavigate();
    const [isMediaLibraryVisible, setIsMediaLibraryVisible] = useState(false);
    
    useEffect(() => {
        const checkAccess = () => {
            const userRoles = getUserRoles();
            const userCanAccess = userRoles.some((role) => role.name === "admin" || role.name === "hr");
            if (!userCanAccess) {
                navigate("/dashboard");
            } else {
                setLoading(false);
            }
        };
        checkAccess();
    }, [navigate]);

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response = await fetchFromApi(
                    "/user/roles",
                    {
                        method: "GET",
                        headers: {
                            "Authorization": `Bearer ${localStorage.getItem("token")}`,
                        }
                    }
                );
                const formattedRoles = response.roles.map((role) => ({
                    name: role.name,
                    value: role.id,
                }));
                setUserRoles(formattedRoles);
            } catch (error) {
                toast.current.show({
                    severity: "error",
                    summary: "Error",
                    detail: "Kategorien konnten nicht geladen werden.",
                });
            }
        };
        fetchRoles();
    }, []);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetchFromApi(`/user/${id}`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    },
                });  
                let userImageUrl = "";
                if (response.user.userImageId) {
                    const imageResponse = await fetchFromApi(`/media/${response.user.userImageId}`, {
                        method: "GET",
                        headers: {
                            "Authorization": `Bearer ${localStorage.getItem("token")}`,
                        },
                    });
                    userImageUrl = `https://quiote-api.dztestserver.de/${imageResponse.media.filepath}`;
                }
                setFormData({
                    first_name: response.user.first_name,
                    last_name: response.user.last_name,
                    email: response.user.email,
                    roles: response.user.roles[0]?.id || null,
                    userImageId: response.user.userImageId,
                    userImageUrl: userImageUrl,
                    linkedIn: response.user.linkedIn,
                    userBioEn: response.user.userBioEn,
                    userBioEs: response.user.userBioEs,
                });
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
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

    const handleMediaSelect = async (image) => {
        setFormData({
            ...formData,
            userImageId: image.id,
            userImageUrl: `https://quiote-api.dztestserver.de/${image.filepath}`,
        });
    };

    /**
     * Handle form submit
     * @param {*} e
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await fetchFromApi(
                `/user/update-user/${id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    },
                    body: JSON.stringify(formData),
                }
            );
            toast.current.show({
                severity: "success",
                summary: "Success",
                detail: "User updated successfully",
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
            <div className="flex">
                <div className="card width-shadow">
                    <h4>Edit User</h4>
                    <form onSubmit={handleSubmit}>
                        <label 
                            htmlFor="first_name"
                            className="text-secondary font-semibold block mb-3">
                            First Name</label>
                        <InputText
                            id="first_name"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleChange}
                            className="w-full p-calendar p-component p-inputwrapper mb-3"
                        />
                        <label 
                            htmlFor="last_name"
                            className="text-secondary font-semibold block mb-3">
                            Last Name</label>
                        <InputText
                            id="last_name"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleChange}
                            className="w-full p-calendar p-component p-inputwrapper mb-3"
                        />
                        <label 
                            htmlFor="email"
                            className="text-secondary font-semibold block mb-3">
                            E-mail</label>
                        <InputText
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full p-calendar p-component p-inputwrapper mb-3"
                        />
                        <label 
                            htmlFor="roles"
                            className="text-secondary font-semibold block mb-3">
                            Role</label>
                        <Dropdown
                            id="roles"
                            name="roles"
                            value={formData.roles}
                            options={roles}
                            onChange={(e) => {
                                handleChange({
                                    name: "roles",
                                    value: e.value,
                                });
                            }}
                            optionLabel="name"
                            placeholder="Rolle auswählen"
                            className="w-full mb-3"
                        />
                      <label 
                            htmlFor="userImage"
                            className="text-secondary font-semibold block mb-3">
                            User Image</label>
                        <Button
                            label="Select Image"
                            icon="pi pi-image"
                            onClick={() => {
                                setIsMediaLibraryVisible(true);
                            }}
                            className="p-button-sm mb-3"
                            type="button"
                        />
                        {formData.userImageUrl && (
                            <div className="mt-3">
                                <Image 
                                    src={formData.userImageUrl}
                                    zoomSrc={formData.userImageUrl}
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
                        <label 
                            htmlFor="userBioEn"
                            className="text-secondary font-semibold block mb-3">
                            User Bio (EN)</label>
                        <InputTextarea
                            id="userBioEn"
                            name="userBioEn"
                            value={formData.userBioEn}
                            onChange={handleChange}
                            rows={5}
                            className="w-full p-calendar p-component p-inputwrapper mb-3"
                        />
                        <label 
                            htmlFor="userBioEs"
                            className="text-secondary font-semibold block mb-3">
                            User Bio (ES)</label>
                        <InputTextarea
                            id="userBioEs"
                            name="userBioEs"
                            value={formData.userBioEs}
                            onChange={handleChange}
                            rows={5}
                            className="w-full p-calendar p-component p-inputwrapper mb-3"
                        />
                        <label 
                            htmlFor="linkedIn"
                            className="text-secondary font-semibold block mb-3">
                            LinkedIn</label>
                        <InputText
                            id="linkedIn"
                            name="linkedIn"
                            value={formData.linkedIn}
                            onChange={handleChange}
                            className="w-full p-calendar p-component p-inputwrapper mb-3"
                        />
                        <Button type="submit" label="Benutzer aktualisieren"/>
                    </form>
                </div>
            </div>
            <MediaLibraryModalSingle
                visible={isMediaLibraryVisible}
                onHide={() => setIsMediaLibraryVisible(false)}
                onSelect={handleMediaSelect}
            />
        </>
    );
}

export default EditUser;