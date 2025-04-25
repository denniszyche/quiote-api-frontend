import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { InputText } from 'primereact/inputtext';
import { Button } from "primereact/button";
import { Link } from "react-router-dom";
import { Toast } from "primereact/toast";
import {fetchFromApi}  from "../../../utils/fetchFromApi.js";

const ResetPassword = () => {
    const [formData, setFormData] = useState({
        email: '',
    });
    const toast = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            navigate("/dashboard", { replace: true });
        }
    }, [navigate]);

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
     * @param {*} event
     */
    const handleSubmit = async (event) => {
        event.preventDefault();

        if(formData.email === '') {
            toast.current.show({
                severity: "warn",
                summary: "Validation Error",
                detail: "Please fill in all fields",
            });
            return;
        }
        try {
            await fetchFromApi("/auth/reset-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });
            toast.current.show({
                severity: "success",
                summary: "Success",
                detail: "Password reset link sent to your email",
            });
            setTimeout(() => {
                navigate("/login", { replace: true });
            }, 2000);
        }
        catch (error) {
            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: "Failed to send password reset link",
            });
        }
    }

    return (
        <>
            <Toast ref={toast} />
            <div className="card">
                <h4>Password reset</h4>
                <form onSubmit={handleSubmit}>
                    <label 
                        htmlFor="email" 
                        className="text-secondary font-semibold block mb-3">
                            E-Mail
                    </label>
                    <InputText
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full p-component p-inputwrapper mb-3"
                    />
                    <Button type="submit" label="Send Reset Link" icon="pi pi-user" className="w-12rem" />
                    <div className="flex justify-content-end mt-3">
                        <Link to="/login">Back to Login</Link>
                    </div>
                </form>
            </div>
        </>
    );
}
export default ResetPassword;
