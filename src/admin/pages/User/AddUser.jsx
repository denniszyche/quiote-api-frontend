import React, { useEffect, useState, useRef } from "react";
import { getUserRoles } from "../../../utils/auth.js";
import Spinner from "../../components/Spinner";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { useNavigate } from "react-router-dom";
import { Dropdown } from "primereact/dropdown";
import { Password } from 'primereact/password';
import {fetchFromApi}  from "../../../utils/fetchFromApi.js";
import MediaLibraryModalSingle from "../../components/MediaLibraryModalSingle";
import { Image } from "primereact/image";

const AddUserPage = () => {
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        roles: null,
        userImageId: "",
        userImageUrl: "",
        linkedIn: "",
        userBioEn: "",
        userBioEs: "",
        password: "",
        passwordConfirmation: "",
    });
    const [roles, setUserRoles] = useState([]);
    const toast = useRef(null);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
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

    useEffect(() => { // Fetch User Roles 
        const fetchRoles = async () => {
            try {
                const response = await fetchFromApi("/user/roles", {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                setUserRoles(response.roles);
            } catch (error) {
                console.error("Error fetching categories:", error);
                toast.current.show({
                    severity: "error",
                    summary: "Error",
                    detail: "Roles could not be fetched",
                });
            }
        };
        fetchRoles();
    }, []);

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
        if (formData.first_name === "" || formData.last_name === "") {
            toast.current.show({
                severity: "warn",
                summary: "Validation Error",
                detail: "Please enter first and last name",
            });
            return;
        }
        if (formData.email === "") {
            toast.current.show({
                severity: "warn",
                summary: "Validation Error",
                detail: "Please enter an email address",
            });
            return;
        }
        if (formData.password === "") {
            toast.current.show({
                severity: "warn",
                summary: "Validation Error",
                detail: "Please enter a password",
            });
            return;
        }
        if (formData.passwordConfirmation === "") {
            toast.current.show({
                severity: "warn",
                summary: "Validation Error",
                detail: "Please confirm your password",
            });
            return;
        }
        if (formData.password !== formData.passwordConfirmation) {
            toast.current.show({
                severity: "warn",
                summary: "Validation Error",
                detail: "Passwords do not match",
            });
            return;
        }
        try {
            await fetchFromApi("/user/create-user", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify(formData),
            });
            toast.current.show({
                severity: "success",
                summary: "Success",
                detail: "User created successfully",
            });
            setTimeout(() => {
                navigate("/all-user");
            }, 1500);
        } catch (error) {
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
                    <h4>Add User</h4>
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
                            E-Mail</label>
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
                            options={roles.map((role) => ({
                                label: role.name,
                                value: role.id,
                            }))}
                            onChange={(e) => {
                                handleChange({
                                    name: "roles",
                                    value: e.value,
                                });
                            }}
                            placeholder="Wählen Sie eine Rolle"
                            className="w-full p-calendar p-component p-inputwrapper mb-3"
                        />
                        <label 
                            htmlFor="password"
                            className="text-secondary font-semibold block mb-3">
                            Password</label>
                        <Password
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full p-calendar p-component p-inputwrapper mb-3"
                            feedback={false}
                            toggleMask
                            placeholder="Passwort"
                        />
                        <label 
                            htmlFor="passwordConfirmation"
                            className="text-secondary font-semibold block mb-3">
                            Password Confirmation</label>
                        <Password
                            id="passwordConfirmation"
                            name="passwordConfirmation"
                            value={formData.passwordConfirmation}
                            onChange={handleChange}
                            className="w-full p-calendar p-component p-inputwrapper mb-3"
                            feedback={false}
                            toggleMask
                            placeholder="Passwort bestätigen"
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
                        <Button type="submit" label="Benutzer*in hinzufügen"  />
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
};
export default AddUserPage;