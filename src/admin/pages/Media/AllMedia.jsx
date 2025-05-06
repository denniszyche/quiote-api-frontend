import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Spinner from "../../components/Spinner";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Menu } from "primereact/menu";
import { Toast } from "primereact/toast";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { format } from "date-fns";
import { Image } from 'primereact/image';
import { InputText } from "primereact/inputtext";
import { Tag } from "primereact/tag";
import {fetchFromApi}  from "../../../utils/fetchFromApi.js";

const AllMediaPage = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [globalFilter, setGlobalFilter] = useState("");
    const toast = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetchFromApi("/media/all-media", {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                setData(response.media);
                setLoading(false);
            } catch (error) {
                console.error("Error loading JSON:", error);
                setLoading(false);
                toast.current.show({
                    severity: "error",
                    summary: "Error",
                    detail: "Failed to load media data.",
                    zindex: 1000,
                });
            }
        };
        fetchData();
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
     * Handle the edtit button click
     * @param {*} rowData
     */
    const handleEdit = (rowData) => {
        navigate(`/edit-media/${rowData.id}`);
    };


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
     * Handle the delete button click
     * @param {*} rowData
     */
    const handleDelete = async (rowData) => {
        try {
            await fetchFromApi(`/media/delete-media/${rowData.id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                },
            });
            setData(data.filter((item) => item.id !== rowData.id));
            toast.current.show({
                severity: "success",
                summary: "Deleted",
                detail: `Media with ID: ${rowData.id} has been deleted.`,
                zindex: 1000,
            });
        } catch (error) {
            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: "Failed to delete the media.",
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
            message: `Are you sure you want to delete the media with ID: ${rowData.id}?`,
            header: "Confirm",
            icon: "pi pi-exclamation-triangle",
            acceptLabel: "Yes, Delete",
            rejectLabel: "Cancel",
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
                <Toast ref={toast} />
                <ConfirmDialog />
                <h4>All Media</h4>
                <div className="flex justify-content-between align-items-center mb-3">
                    <Button
                        label="Add Media"
                        icon="pi pi-plus"
                        className="p-button-success"
                        onClick={() => navigate("/add-media")}
                    />
                    <span className="p-input-icon-left">
                        <InputText
                            value={globalFilter}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                            placeholder="Search by filename or alt text"
                        />
                    </span>
                </div>
                <DataTable 
                    value={data}
                    paginator
                    rows={10}
                    rowsPerPageOptions={[5, 10, 20]}
                    globalFilter={globalFilter}
                >
                    <Column field="id" header="ID" />
                    <Column
                        header="Thumbnail"
                        body={(rowData) => (
                            <Image 
                                src={rowData.filepath ? `https://quiote-api.dztestserver.de/${rowData.filepath}` : "/images/cms-logo.svg"}
                                zoomSrc={rowData.filepath ? `https://quiote-api.dztestserver.de/${rowData.filepath}` : "/images/cms-logo.svg"}
                                alt={rowData.altText || "Media Thumbnail"} 
                                width="80" 
                                height="80" 
                                preview
                                style={{
                                    objectFit: "cover",
                                    backgroundColor: "#f0f0f0",
                                }}
                            />
                        )}
                    />
                    <Column
                        field="filename"
                        header="Filename"
                    />
                     <Column 
                        field="featured" 
                        header="featured" 
                        body={featuredBodyTemplate}
                        />
                    <Column
                        field="updatedAt"
                        header="Updated"
                        body={(rowData) => formatDate(rowData.updatedAt)}
                    />
                    <Column  body={actionBodyTemplate} />
                </DataTable>
            </div>
        </div>
    );
};
export default AllMediaPage;