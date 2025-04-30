import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getUserRoles } from "../../../utils/auth.js";
import Spinner from "../../components/Spinner";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Menu } from "primereact/menu";
import { Toast } from "primereact/toast";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import {fetchFromApi}  from "../../../utils/fetchFromApi.js";

const AllCategories = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const toast = useRef(null);
    const navigate = useNavigate();
    
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

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetchFromApi("/category/all-categories", {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    }
                });
                setData(response.categories || []);   
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

    /**
     * Handle the edtit button click
     * @param {*} rowData
     */
    const handleEdit = (rowData) => {
        navigate(`/edit-category/${rowData.id}`);
    };

    /**
     * Handle the delete button click
     * @param {*} rowData
     */
    const handleDelete = async (rowData) => {
        try {
            const response = await fetchFromApi(`/category/delete-category/${rowData.id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                },
            });
            setData(data.filter((item) => item.id !== rowData.id));
            toast.current.show({
                severity: "success",
                summary: "Deleted",
                detail: `Tag with ID: ${rowData.id} has been deleted.`,
                zindex: 1000,
            });
        } catch (error) {
            console.error("Error deleting post:", error);
            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: "Failed to delete the tag.",
                zindex: 1000,
            });
        }
    };

    /**
     * Confirm delete action
     * @param {*} rowData
     */
    const confirmDelete = (rowData) => {
        confirmDialog({
            message: `Are you sure you want to delete the category with ID: ${rowData.id}?`,
            header: "Confirm Deletion",
            icon: "pi pi-exclamation-triangle",
            accept: () => handleDelete(rowData),
        });
    };

    /**
     * Render the action buttons
     * @param {*} rowData
     * @returns 
     */
    const actionBodyTemplate = (rowData) => {
        const menu = useRef(null);
        const items = [
            {
                label: "Edit",
                icon: "pi pi-pencil",
                command: () => handleEdit(rowData),
            },
            {
                label: "Delete",
                icon: "pi pi-trash",
                command: () => confirmDelete(rowData),
            },
        ];
        return (
            <>
                <Menu model={items} popup ref={menu} />
                <Button
                    icon="pi pi-ellipsis-v"
                    className="p-button-rounded p-button-secondary"
                    onClick={(event) => menu.current.toggle(event)}
                />
            </>
        );
    };

    if (loading) {
        return <Spinner />;
    }

    return (
        <>
            <Toast ref={toast} />
            <ConfirmDialog />
            <div className="flex">
                <div className="card width-shadow w-100">
                    <h4>All Categories</h4>
                    <Button
                        label="Add Category"
                        icon="pi pi-plus"
                        className="p-button-success mb-3"
                        onClick={() => navigate("/add-category")}
                    />
                    <DataTable value={data}>
                        <Column
                            field="name"
                            header="Name (en)"
                            body={(rowData) => {
                                const englishTranslation = rowData.translations?.find(
                                    (translation) => translation.language === "en"
                                );
                                return englishTranslation ? englishTranslation.name : "No Title";
                            }}
                        />
                        <Column
                            field="name"
                            header="Name (es)"
                            body={(rowData) => {
                                const englishTranslation = rowData.translations?.find(
                                    (translation) => translation.language === "es"
                                );
                                return englishTranslation ? englishTranslation.name : "No Title";
                            }}
                        />
                        <Column  body={actionBodyTemplate} />
                    </DataTable>
                </div>
            </div>
        </>
    );
}

export default AllCategories;