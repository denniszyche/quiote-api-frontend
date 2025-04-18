import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUserRoles } from "../../utils/auth.js";
import Spinner from "../../components/Spinner";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Dropdown } from "primereact/dropdown";

const EditUser = () => {
    const { id } = useParams();
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        roles: "",
    });
    const [roles, setUserRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const toast = useRef(null);
    const navigate = useNavigate();
    
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
        const fetchUser = async () => {
            try {
                const response = await fetch(`http://localhost:3000/user/post/${id}`, 
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
                setFormData({
                    first_name: data.user.first_name,
                    last_name: data.user.last_name,
                    email: data.user.email,
                    roles: data.user.roles[0]?.id || null,
                });
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [id]);
        
    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response = await fetch(
                    "http://localhost:3000/user/roles",
                    {
                        method: "GET",
                        headers: {
                            "Authorization": `Bearer ${localStorage.getItem("token")}`,
                        },
                    }
                );
                if (!response.ok) {
                    throw new Error("Failed to fetch user roles.");
                }
                const data = await response.json();
                const formattedRoles = data.roles.map((role) => ({
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
        // Vaidate the form
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
        try {
            const response = await fetch(`http://localhost:3000/user/post/${id}`, {
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
                detail: "Benutzer*in erfolgreich aktualisiert",
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
    }

    if (loading) {
        return <Spinner />;
    }

    return (
        <>
            <Toast ref={toast} />
            <div className="flex">
                <div className="card width-shadow">
                    <h4>Benutzer*in bearbeiten</h4>
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
                            Rolle</label>
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
                        <Button type="submit" label="Benutzer aktualisieren"/>
                    </form>
                </div>
            </div>
        </>
    );

}

export default EditUser;