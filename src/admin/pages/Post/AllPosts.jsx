import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Spinner from "../../components/Spinner";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import { Button } from "primereact/button";
import { Menu } from "primereact/menu";
import { Toast } from "primereact/toast";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { format } from "date-fns";
        

const AllPostsPage = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const toast = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetch("http://localhost:3000/post/all-posts", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`,
            },
        })
            .then((response) => response.json())
            .then((data) => {
                setData(data.posts);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error loading JSON:", error);
                setLoading(false);
            });
    }, []);
    
    /**
     * Format the date to dd/MM/yyyy
     * @param {*} value
     * @returns
     */
    const formatDate = (value) => {
        if (!value) return "";
        const date = new Date(value);
        return format(date, "dd/MM/yyyy");
    };

    /**
     * Format the status to a tag
     * @param {*} status
     * @returns
     */
    const statusBodyTemplate = (status) => {
        return <Tag value={status.status} severity={getStatusSeverity(status.status)} />;
    };

    /**
     * Get the severity of the status
     * @param {*} status
     * @returns
     */
    const getStatusSeverity = (status) => {
        switch (status) {
            case "published":
                return "success";

            case "draft":
                return "warning";

            case "pending":
                return "danger";

            default:
                return null;
        }
    };

    /**
     * Format the categories to a tag
     * @param {*} categories 
     * @returns 
     */
    const categoryBodyTemplate = (categories) => {
        return categories.categories.map((category) => {
            const englishTranslation = category.translations.find(
                (translation) => translation.language === "en"
            );
            return (
                <Tag
                    key={category.id}
                    value={englishTranslation ? englishTranslation.name : "No Name"}
                    severity="info"
                    rounded
                    className="mr-1"
                />
            );
        });
    };

    /**
     * Format the featured to a tag
     * @param {*} rowData
     * @returns
     */
    const featuredBodyTemplate = (rowData) => {
        if (rowData.featured === 1 || rowData.featured === "1") {
            return (
                <Tag
                    severity="success"
                    icon="pi pi-check"
                    rounded
                />
            );
        }
        return null;
    };

    /**
     * Handle the edtit button click
     * @param {*} rowData
     */
    const handleEdit = (rowData) => {
        navigate(`/edit-post/${rowData.id}`);
    };

    /**
     * Handle the delete button click
     * @param {*} rowData
     */
    const handleDelete = async (rowData) => {
        try {
            const response = await fetch(`http://localhost:3000/post/delete-post/${rowData.id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                },
            });
            if (!response.ok) {
                throw new Error("Failed to delete the post.");
            }
            setData(data.filter((item) => item.id !== rowData.id));
            toast.current.show({
                severity: "success",
                summary: "Deleted",
                detail: `Post with ID: ${rowData.id} has been deleted.`,
                zindex: 1000,
            });
        } catch (error) {
            console.error("Error deleting post:", error);
            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: "Failed to delete the post.",
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
            message: `Sind Sie sicher, dass Sie die Anfrage mit der ID ${rowData.id} löschen möchten?`,
            header: "Anfrage löschen",
            icon: "pi pi-exclamation-triangle",
            acceptLabel: "Ja, löschen",
            rejectLabel: "Abbrechen",
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
        <div className="flex">
            <div className="card width-shadow w-100">
                <h4>All Posts</h4>
                <Button
                    label="Add Post"
                    icon="pi pi-plus"
                    className="p-button-success mb-3"
                    onClick={() => navigate("/add-post")}
                />
                <Toast ref={toast} />
                <ConfirmDialog />
                <DataTable value={data}>
                    <Column field="id" header="ID" />
                    <Column
                        field="title"
                        header="Title"
                        body={(rowData) => {
                            const englishTranslation = rowData.translations?.find(
                                (translation) => translation.language === "en"
                            );
                            return englishTranslation ? englishTranslation.title : "No Title";
                        }}
                    />
                    <Column
                        field="categories"
                        header="Categories"
                        body={categoryBodyTemplate}
                    ></Column>
                    <Column 
                        field="featured" 
                        header="featured" 
                        body={featuredBodyTemplate}
                        />
                    <Column
                        field="user"
                        header="User"
                        body={(rowData) => `${rowData.user?.first_name || ''} ${rowData.user?.last_name || ''}`}
                    />
                    <Column
                        field="status"
                        header="Status"
                        body={statusBodyTemplate}
                    ></Column>
                    <Column
                        field="createdAt"
                        header="Created At"
                        body={(rowData) => formatDate(rowData.createdAt)}
                    />
                    <Column  body={actionBodyTemplate} />
                </DataTable>
            </div>
        </div>
    );
};
export default AllPostsPage;