import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getUserRoles } from "../../../utils/auth.js";
import Spinner from "../../components/Spinner";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { fetchFromApi } from "../../../utils/fetchFromApi.js";

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
                const response = await fetchFromApi("/setting/all-settings", {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                const settings = response.settings || [];
                const updatedFormData = {
                    info: {
                        en: settings.find((s) => s.key === "info" && s.language === "en")?.value || "",
                        es: settings.find((s) => s.key === "info" && s.language === "es")?.value || "",
                    },
                    admin_contact: settings.find((s) => s.key === "admin_contact")?.value || "",
                    contact: {
                        street: "",
                        colonia: "",
                        region: "",
                        city: "",
                        country: "",
                        phone: "",
                        email: "",
                        ...JSON.parse(settings.find((s) => s.key === "contact")?.value || "{}"), // Merge with defaults
                    },
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
            const response = await fetchFromApi("/setting/update-settings", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                    settings: formData,
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
                            <h4>Info Text</h4>
                            <label 
                                htmlFor="info-en" className="block mb-3">
                                English
                            </label>
                            <InputTextarea
                                id="info-en"
                                value={formData.info.en || ""} // Ensure fallback to empty string
                                onChange={(e) => handleInputChange("info", "en", e.target.value)}
                                className="p-inputtext-sm w-full mb-3"
                                rows={3}
                            />
                            <label htmlFor="info-es" className="block mb-3">
                                Spanish
                            </label>
                            <InputTextarea
                                id="info-es"
                                value={formData.info.es || ""} // Ensure fallback to empty string
                                onChange={(e) => handleInputChange("info", "es", e.target.value)}
                                className="p-inputtext-sm w-full mb-3"
                                rows={3}
                            />
                        </div>

                        {/* Admin Contact Field */}
                        <div className="mb-4">
                            <label htmlFor="admin_contact" className="block mb-3">
                                Admin Contact
                            </label>
                            <InputText
                                id="admin_contact"
                                type="text"
                                value={formData.admin_contact || ""} // Ensure fallback to empty string
                                onChange={(e) => handleInputChange("admin_contact", e.target.value)}
                                className="p-inputtext-sm w-full"
                            />
                        </div>

                        {/* Contact Field (Predefined Fields) */}
                        <div className="mb-4">
                            <h4>Contact</h4>
                            
                            <label htmlFor="contact-street" className="block mb-3">Street</label>
                            <InputText
                                id="contact-street"
                                type="text"
                                value={formData.contact.street || ""} // Ensure fallback to empty string
                                onChange={(e) => handleInputChange("contact", "street", e.target.value)}
                                className="p-inputtext-sm w-full mb-3"
                            />
                            
                            <label htmlFor="contact-colonia" className="block mb-3">Colonia</label>
                            <InputText
                                id="contact-colonia"
                                type="text"
                                value={formData.contact.colonia || ""} // Ensure fallback to empty string
                                onChange={(e) => handleInputChange("contact", "colonia", e.target.value)}
                                className="p-inputtext-sm w-full mb-3"
                            />

                            <label htmlFor="contact-region" className="block mb-3">Region</label>
                            <InputText
                                id="contact-region"
                                type="text"
                                value={formData.contact.region || ""} // Ensure fallback to empty string
                                onChange={(e) => handleInputChange("contact", "region", e.target.value)}
                                className="p-inputtext-sm w-full mb-3"
                            />
                            
                            <label htmlFor="contact-city" className="block mb-3">City</label>
                            <InputText
                                id="contact-city"
                                type="text"
                                value={formData.contact.city || ""} // Ensure fallback to empty string
                                onChange={(e) => handleInputChange("contact", "city", e.target.value)}
                                className="p-inputtext-sm w-full mb-3"
                            />
                            
                            <label htmlFor="contact-country" className="block mb-3">Country</label>
                            <InputText
                                id="contact-country"
                                type="text"
                                value={formData.contact.country || ""} // Ensure fallback to empty string
                                onChange={(e) => handleInputChange("contact", "country", e.target.value)}
                                className="p-inputtext-sm w-full mb-3"
                            />

                            <label htmlFor="contact-phone" className="block mb-3">Phone</label>
                            <InputText
                                id="contact-phone"
                                type="text"
                                value={formData.contact.phone || ""} // Ensure fallback to empty string
                                onChange={(e) => handleInputChange("contact", "phone", e.target.value)}
                                className="p-inputtext-sm w-full mb-3"
                            />
                            
                            <label htmlFor="contact-email" className="block mb-3">Email</label>
                            <InputText
                                id="contact-email"
                                type="text"
                                value={formData.contact.email || ""} // Ensure fallback to empty string
                                onChange={(e) => handleInputChange("contact", "email", e.target.value)}
                                className="p-inputtext-sm w-full mb-3"
                            />
                        </div>

                        <Button type="submit" label="Save Settings" className="p-button-success" />
                    </form>
                </div>
            </div>
        </>
    );
};

export default AllSettings;