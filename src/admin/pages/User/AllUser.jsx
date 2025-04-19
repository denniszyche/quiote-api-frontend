import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getUserRoles } from "../../../utils/auth.js";
import Spinner from "../../components/Spinner";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import { Button } from "primereact/button";
import { Menu } from "primereact/menu";
import { Toast } from "primereact/toast";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import {fetchFromApi}  from "../../../utils/fetchFromApi.js";

const AllUserPage = () => {
    const [users, setUserData] = useState([]);
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

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetchFromApi("/user/all-users", {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                setUserData(response.users);
            } catch (error) {
                console.error("Error loading JSON:", error);
            }
        };
        fetchData();
    }, []);

    /**
     * Format the role to a tag
     * @param {*} roles 
     * @returns 
     */
    const roleBodyTemplate = (roles) => {
        return roles.roles.map((role) => (
            <Tag key={role.id} value={role.name} severity={getRoleSeverity(role.name)} rounded />
        ));
    }

    /**
     * Get the severity of the category
     * @param {*} status
     * @returns
     */
    const getRoleSeverity = (role) => {
        switch (role) {
            case "no_authentication":
                return "danger";
            case "user":
                return "info";
            case "hr":
                return "warning";
            case "admin":
                return "success";
            default:
                return "info";
        }
    };

    /**
     * Handle the edtit button click
     * @param {*} rowData
     */
    const handleEdit = (rowData) => {
        navigate(`/edit-user/${rowData.id}`);
    };

    /**
     * Handle the delete button click
     * @param {*} rowData
     */
    const handleDelete = async (rowData) => {
        try {
            const response = await fetchFromApi(`/user/delete-user/${rowData.id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                },
            });
            setUserData(users.filter((item) => item.id !== rowData.id));
            toast.current.show({
                severity: "success",
                summary: "Deleted",
                detail: `User with ID: ${rowData.id} has been deleted.`,
                zindex: 1000,
            });
        } catch (error) {
            console.error("Error deleting user:", error);
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
            message: `Sind Sie sicher, dass Sie den User mit der ID ${rowData.id} löschen möchten?`,
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
        const menuRef = useRef(null);
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
                <Menu model={items} popup ref={menuRef} />
                <Button
                    icon="pi pi-ellipsis-v"
                    className="p-button-rounded p-button-secondary"
                    onClick={(event) => menuRef.current.toggle(event)}
                />
            </>
        );
    };

    if (loading) {
        return <Spinner />;
    }

    return (
        <div className="card width-shadow w-100">
            <h4>All User</h4>
            <Button
                label="Add User"
                icon="pi pi-plus"
                className="p-button-success mb-3"
                onClick={() => navigate("/add-user")}
            />
            <Toast ref={toast} />
            <ConfirmDialog />
            <DataTable value={users}>
                <Column field="id" header="ID" />
                <Column
                    field="first_name"
                    header="First Name"
                />
                <Column
                    field="last_name"
                    header="Last Name"
                />
                <Column
                    field="roles"
                    header="Role"
                    body={roleBodyTemplate}
                ></Column>
                <Column  body={actionBodyTemplate} />
            </DataTable>
        </div>
    );
};
export default AllUserPage;
