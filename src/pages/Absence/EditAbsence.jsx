import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Spinner from "../../components/Spinner";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";

const EditAbsence = () => {
    const { id } = useParams();
    const [formData, setFormData] = useState({
        fromDate: null,
        toDate: null,
        comment: "",
        categories: null,
    });
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const toast = useRef(null);
    const navigate = useNavigate();
    const isSingleDay =
        formData.fromDate &&
        formData.toDate &&
        formData.fromDate.toDateString() === formData.toDate.toDateString();

    useEffect(() => {
        const fetchAbsence = async () => {
            try {
                const response = await fetch(`http://localhost:2109/absence/post/${id}`, 
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
                    fromDate: data.post.from ? new Date(data.post.from) : null,
                    toDate: data.post.to ? new Date(data.post.to) : null,
                    comment: data.post.comment || "",
                    categories: data.post.categories[0]?.id || null, 
                });
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchAbsence();
    }, [id]);
    
    useEffect(() => { // Fetch categories from the server
        const fetchCategories = async () => {
            try {
                const response = await fetch(
                    "http://localhost:2109/category/posts",
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
                const formattedCategories = data.categories.map((cat) => ({
                    label: cat.name,
                    value: cat.id,
                }));
                setCategories(formattedCategories);
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

        /**
         * Foramt the time to HH:MM:SS
         * @param {*} date 
         * @returns 
         */
        const formatTime = (date) => {
            if (!date) return null;
            const hours = date.getHours().toString().padStart(2, "0");
            const minutes = date.getMinutes().toString().padStart(2, "0");
            const seconds = date.getSeconds().toString().padStart(2, "0");
            return `${hours}:${minutes}:${seconds}`;
        };
        const formattedData = {
            ...formData,
            fromDate: formData.fromDate
                ? formData.fromDate.toISOString()
                : null,
            toDate: formData.toDate
                ? formData.toDate.toISOString()
                : null,
            fromTime: formData.fromTime
                ? formatTime(formData.fromTime)
                : null,
            toTime: formData.toTime
                ? formatTime(formData.toTime)
                : null,
        };
        if (!formattedData.fromDate || !formattedData.toDate) {
            toast.current.show({
                severity: "warn",
                summary: "Validation Error",
                detail: "Bitte geben Sie ein Datum ein.",
            });
            return;
        }
        if (formattedData.fromDate > formattedData.toDate) {
            toast.current.show({
                severity: "warn",
                summary: "Validation Error",
                detail: "Das Enddatum muss nach dem Startdatum liegen.",
            });
            return;
        }
        if (isSingleDay && (!formattedData.fromTime || !formattedData.toTime)) {
            toast.current.show({
                severity: "warn",
                summary: "Validation Error",
                detail: "Bitte geben Sie eine Uhrzeit ein.",
            });
            return;
        }
        if (
            isSingleDay &&
            formattedData.fromTime &&
            formattedData.toTime &&
            formattedData.fromTime > formattedData.toTime
        ) {
            toast.current.show({
                severity: "warn",
                summary: "Validation Error",
                detail: "Die Endzeit muss nach der Startzeit liegen.",
            });
            return;
        }
        if (!formattedData.categories) {
            toast.current.show({
                severity: "warn",
                summary: "Validation Error",
                detail: "Bitte wählen Sie eine Kategorie aus.",
            });
            return;
        }
        try {
            const response = await fetch(`http://localhost:2109/absence/post/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify(formattedData),
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
                detail: "Abwesenheit erfolgreich aktualisiert",
            });
            setTimeout(() => {
                navigate("/all-absences");
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
                    <h4>Abwesenheit bearbeiten</h4>
                    <form onSubmit={handleSubmit}>
                        <span className="text-secondary font-semibold block mb-3">
                            <label htmlFor="fromDate">Datum (von)</label>
                        </span>
                        <Calendar
                            id="fromDate"
                            name="fromDate"
                            value={formData.fromDate}
                            dateFormat="dd/mm/yy"
                            onChange={(e) => {
                                handleChange({
                                    name: "fromDate",
                                    value: e.value,
                                });
                            }}
                            showIcon
                        />
                        <span className="text-secondary font-semibold block mt-3 mb-3">
                            <label htmlFor="toDate">Datum (bis)</label>
                        </span>              
                        <Calendar
                            id="toDate"
                            name="toDate"
                            value={formData.toDate}
                            dateFormat="dd/mm/yy"
                            onChange={(e) => {
                                handleChange({
                                    name: "toDate",
                                    value: e.value,
                                });
                            }}
                            showIcon
                        />
                        <span className="text-secondary font-semibold block mt-3 mb-3">
                            <label htmlFor="category">Kategorie</label>
                        </span>
                        <Dropdown
                            id="category"
                            name="category"
                            value={formData.categories}
                            options={categories}
                            onChange={(e) => {
                                handleChange({
                                    name: "categories",
                                    value: e.value,
                                });
                            }}
                            placeholder="Select a Category"
                        />
                        <span className="text-secondary font-semibold block mt-3 mb-3">
                            <label htmlFor="comment">Anmerkung</label>
                        </span>
                        <span className="text-secondary font-semibold block mt-3 mb-3">
                            <InputTextarea
                                id="comment"
                                name="comment"
                                value={formData.comment}
                                onChange={(e) => {
                                    handleChange({
                                        name: "comment",
                                        value: e.target.value,
                                    });
                                }}
                            />
                        </span>
                        <Button type="submit" label="Submit" />
                    </form>
                </div>
            </div>
        </>
    );
}
export default EditAbsence;