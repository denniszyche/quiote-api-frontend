import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getUserRoles } from "../../../utils/auth.js";
import Spinner from "../../components/Spinner";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";

const AllSettings = () => {
    const [formData, setFormData] = useState({
        info: { en: "", es: "" }, // Two languages for info
        admin_contact: "", // Single field
        contact: { 
            street: "", 
            colonia: "", 
            region: "", 
            city: "", 
            country: "", 
            phone: "", 
            email: "" 
        }, // Object for contact
    });
    const [loading, setLoading] = useState(true);
    const toast = useRef(null);
    const navigate = useNavigate();

    // Check user access
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

    // Fetch existing settings
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch("http://localhost:3000/setting/all-settings", {
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                if (!response.ok) {
                    throw new Error("Failed to fetch data.");
                }
                const result = await response.json();

                // Populate formData with existing settings
                const settings = result.settings || [];
                const updatedFormData = {
                    info: {
                        en: settings.find((s) => s.key === "info" && s.language === "en")?.value || "",
                        es: settings.find((s) => s.key === "info" && s.language === "es")?.value || "",
                    },
                    admin_contact: settings.find((s) => s.key === "admin_contact")?.value || "",
                    contact: JSON.parse(settings.find((s) => s.key === "contact")?.value || "{}"), // Parse contact as an object
                };
                setFormData(updatedFormData);
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.current.show({
                    severity: "error",
                    summary: "Error",
                    detail: "Failed to fetch data.",
                    zindex: 1000,
                });
            }
        };
        fetchData();
    }, []);

    // Handle input changes
    const handleInputChange = (key, languageOrValue, value) => {
        if (key === "info") {
            setFormData({
                ...formData,
                info: {
                    ...formData.info,
                    [languageOrValue]: value,
                },
            });
        } else if (key === "contact") {
            setFormData({
                ...formData,
                contact: {
                    ...formData.contact,
                    [languageOrValue]: value,
                },
            });
        } else {
            setFormData({
                ...formData,
                [key]: value,
            });
        }
    };

    // Submit updated settings
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("http://localhost:3000/setting/update-settings", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                    settings: [
                        { key: "info", language: "en", value: formData.info.en },
                        { key: "info", language: "es", value: formData.info.es },
                        { key: "admin_contact", value: formData.admin_contact },
                        { key: "contact", value: JSON.stringify(formData.contact) }, // Stringify contact object
                    ],
                }),
            });
            if (!response.ok) {
                throw new Error("Failed to update settings.");
            }
            toast.current.show({
                severity: "success",
                summary: "Success",
                detail: "Settings updated successfully.",
                zindex: 1000,
            });
        } catch (error) {
            console.error("Error updating settings:", error);
            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: "Failed to update settings.",
                zindex: 1000,
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
                <div className="card width-shadow w-100">
                    <h4>All Settings</h4>
                    <form onSubmit={handleSubmit}>
                        {/* Info Field (Two Languages) */}
                        <div className="mb-4">
                            <h5>Info Text</h5>
                            <label htmlFor="info-en" className="block mb-2">
                                English
                            </label>
                            <input
                                id="info-en"
                                type="text"
                                value={formData.info.en}
                                onChange={(e) => handleInputChange("info", "en", e.target.value)}
                                className="p-inputtext-sm w-full mb-2"
                            />
                            <label htmlFor="info-es" className="block mb-2">
                                Spanish
                            </label>
                            <input
                                id="info-es"
                                type="text"
                                value={formData.info.es}
                                onChange={(e) => handleInputChange("info", "es", e.target.value)}
                                className="p-inputtext-sm w-full"
                            />
                        </div>

                        {/* Admin Contact Field */}
                        <div className="mb-4">
                            <label htmlFor="admin_contact" className="block mb-2">
                                Admin Contact
                            </label>
                            <input
                                id="admin_contact"
                                type="text"
                                value={formData.admin_contact}
                                onChange={(e) => handleInputChange("admin_contact", null, e.target.value)}
                                className="p-inputtext-sm w-full"
                            />
                        </div>

                        {/* Contact Field (Predefined Fields) */}
                        <div className="mb-4">
                            <h5>Contact</h5>
                            <div className="mb-2">
                                <label htmlFor="contact-street" className="block mb-2">Street</label>
                                <input
                                    id="contact-street"
                                    type="text"
                                    value={formData.contact.street}
                                    onChange={(e) => handleInputChange("contact", "street", e.target.value)}
                                    className="p-inputtext-sm w-full"
                                />
                            </div>
                            <div className="mb-2">
                                <label htmlFor="contact-colonia" className="block mb-2">Colonia</label>
                                <input
                                    id="contact-colonia"
                                    type="text"
                                    value={formData.contact.colonia}
                                    onChange={(e) => handleInputChange("contact", "colonia", e.target.value)}
                                    className="p-inputtext-sm w-full"
                                />
                            </div>
                            <div className="mb-2">
                                <label htmlFor="contact-region" className="block mb-2">Region</label>
                                <input
                                    id="contact-region"
                                    type="text"
                                    value={formData.contact.region}
                                    onChange={(e) => handleInputChange("contact", "region", e.target.value)}
                                    className="p-inputtext-sm w-full"
                                />
                            </div>
                            <div className="mb-2">
                                <label htmlFor="contact-city" className="block mb-2">City</label>
                                <input
                                    id="contact-city"
                                    type="text"
                                    value={formData.contact.city}
                                    onChange={(e) => handleInputChange("contact", "city", e.target.value)}
                                    className="p-inputtext-sm w-full"
                                />
                            </div>
                            <div className="mb-2">
                                <label htmlFor="contact-country" className="block mb-2">Country</label>
                                <input
                                    id="contact-country"
                                    type="text"
                                    value={formData.contact.country}
                                    onChange={(e) => handleInputChange("contact", "country", e.target.value)}
                                    className="p-inputtext-sm w-full"
                                />
                            </div>
                            <div className="mb-2">
                                <label htmlFor="contact-phone" className="block mb-2">Phone</label>
                                <input
                                    id="contact-phone"
                                    type="text"
                                    value={formData.contact.phone}
                                    onChange={(e) => handleInputChange("contact", "phone", e.target.value)}
                                    className="p-inputtext-sm w-full"
                                />
                            </div>
                            <div className="mb-2">
                                <label htmlFor="contact-email" className="block mb-2">Email</label>
                                <input
                                    id="contact-email"
                                    type="text"
                                    value={formData.contact.email}
                                    onChange={(e) => handleInputChange("contact", "email", e.target.value)}
                                    className="p-inputtext-sm w-full"
                                />
                            </div>
                        </div>

                        <Button type="submit" label="Save Settings" className="p-button-success" />
                    </form>
                </div>
            </div>
        </>
    );
};

export default AllSettings;