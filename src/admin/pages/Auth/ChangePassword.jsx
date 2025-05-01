import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Password } from 'primereact/password';
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import {fetchFromApi}  from "../../../utils/fetchFromApi.js";

const ChangePassword = () => {
    const { id } = useParams();
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: '',
        userId: null
    });
    const toast = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            navigate("/dashboard", { replace: true });
        }
    }, [navigate]);

    useEffect(() => {
        const fetchToken = async () => {
            try {
                const response = await fetchFromApi(`/auth/verify-token/${id}`, {
                    method: "GET",
                });
                setFormData({
                    ...formData,
                    userId: response.userId
                });
            } catch (error) {
                const errorMessages = error.errors
                    ? error.errors.map((err) => err.msg).join(", ")
                    : error.message;
                toast.current.show({
                    severity: "error",
                    summary: "Error",
                    detail: errorMessages,
                });
            }
        }
        fetchToken();
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
     * @param {*} event
     */
    const handleSubmit = async (event) => {
        event.preventDefault();
        if(formData.password === '' || formData.confirmPassword === '') {
            toast.current.show({
                severity: "warn",
                summary: "Validation Error",
                detail: "Please fill in all fields",
            });
            return;
        }
        if(formData.password !== formData.confirmPassword) {
            toast.current.show({
                severity: "warn",
                summary: "Validation Error",
                detail: "Passwords do not match",
            });
            return;
        }
        try {
            await fetchFromApi("/auth/change-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    password: formData.password,
                    confirmPassword: formData.confirmPassword,
                    userId: formData.userId
                }),
            });
            toast.current.show({
                severity: "success",
                summary: "Success",
                detail: "Password changed successfully",
            });
            setTimeout(() => {
                navigate("/login", { replace: true });
            }, 2000);
        }
        catch (error) {
            const errorMessages = error.errors
                ? error.errors.map((err) => err.msg).join(", ")
                : error.message;
            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: errorMessages,
            });
        }
    }

    return (
        <>
            <Toast ref={toast} />
            <div className="card">
                <h4>Change Password</h4>
                <form onSubmit={handleSubmit}>
                    <label 
                        htmlFor="password" 
                        className="text-secondary font-semibold block mb-3">
                            Password
                    </label>
                    <Password 
                        value={formData.password}
                        id="password"
                        name="password"
                        onChange={(e) => {
                            handleChange({
                                target: {
                                    name: 'password',
                                    value: e.target.value
                                }
                            });
                        }}
                        feedback={false} 
                        tabIndex={1} 
                        toggleMask
                        className="w-full p-calendar p-component p-inputwrapper mb-3"
                    />
                    <label 
                        htmlFor="confirmPassword" 
                        className="text-secondary font-semibold block mb-3">
                            Confirm Password
                    </label>
                    <Password 
                        value={formData.confirmPassword}
                        id="confirmPassword"
                        name="confirmPassword"
                        onChange={(e) => {
                            handleChange({
                                target: {
                                    name: 'confirmPassword',
                                    value: e.target.value
                                }
                            });
                        }}
                        feedback={false} 
                        tabIndex={1} 
                        toggleMask
                        className="w-full p-calendar p-component p-inputwrapper mb-3"
                    />
                    <Button type="submit" label="Change Password" icon="pi pi-user" className="w-12rem" />
                </form>
            </div>
        </>
    );
}
export default ChangePassword;
