import React, { useEffect, useState, useRef } from "react";
import { getUserRoles } from "../../../utils/auth.js";
import Spinner from "../../components/Spinner";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { useNavigate } from "react-router-dom";
import { Dropdown } from "primereact/dropdown";
import { Password } from 'primereact/password';
import {fetchFromApi}  from "../../../utils/fetchFromApi.js";

const AddUserPage = () => {
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        roles: null,
        password: "",
        passwordConfirmation: "",
    });
    const [roles, setUserRoles] = useState([]);
    const toast = useRef(null);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    
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
                    detail: "Kategorien konnten nicht geladen werden.",
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
                detail: "Bitte geben Sie einen Vornamen und Nachnamen ein",
            });
            return;
        }
        if (formData.email === "") {
            toast.current.show({
                severity: "warn",
                summary: "Validation Error",
                detail: "Bitte geben Sie eine E-Mail Adresse ein",
            });
            return;
        }
        if (formData.password === "") {
            toast.current.show({
                severity: "warn",
                summary: "Validation Error",
                detail: "Bitte geben Sie ein Passwort ein",
            });
            return;
        }
        if (formData.passwordConfirmation === "") {
            toast.current.show({
                severity: "warn",
                summary: "Validation Error",
                detail: "Bitte bestätigen Sie das Passwort",
            });
            return;
        }
        if (formData.password !== formData.passwordConfirmation) {
            toast.current.show({
                severity: "warn",
                summary: "Validation Error",
                detail: "Passwörter stimmen nicht überein",
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
                detail: "Benutzer*in erfolgreich hinzugefügt",
            });
            setTimeout(() => {
                navigate("/all-user");
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
            <div className="flex">
                <div className="card width-shadow">
                    <h4>Benutzer*in hinzufügen</h4>
                    <form onSubmit={handleSubmit}>
                        <label 
                            htmlFor="first_name"
                            className="text-secondary font-semibold block mb-3">
                            Vorname</label>
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
                            Nachname</label>
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
                            Rolle</label>
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
                            Passwort</label>
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
                            Passwort bestätigen</label>
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
                        <Button type="submit" label="Benutzer*in hinzufügen"  />
                    </form>
                </div>
            </div>
        </>
    );
};
export default AddUserPage;