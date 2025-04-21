import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Divider } from "primereact/divider";
import {fetchFromApi}  from "../../utils/fetchFromApi.js";

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
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
        if(formData.email === '' || formData.password === '') {
            toast.current.show({
                severity: "warn",
                summary: "Validation Error",
                detail: "Bitte füllen Sie alle Felder aus",
            });
            return;
        }
        try {
            const response = await fetchFromApi("/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });
            localStorage.setItem("token", response.token);
            navigate("/dashboard", { replace: true });
        }
        catch (error) {
            toast.current.show({
                severity: "error",
                summary: "Login Failed",
                detail: "Invalid email or password",
            });
        }
    }

    return (
        <>
            <Toast ref={toast} />
            <div className="card">
                <form onSubmit={handleSubmit}>
                    <label 
                        htmlFor="email" 
                        className="text-secondary font-semibold block mb-3">
                            E-Mail
                    </label>
                    <InputText 
                        id="email" 
                        type="text" 
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full p-calendar p-component p-inputwrapper mb-3"
                        />
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
                        className="w-full p-calendar p-component p-inputwrapper mb-3"
                        />
                    
                    <Button 
                        label="Login"
                        icon="pi pi-user" 
                        type="submit"
                        className="w-12rem"
                        />
                </form>
            </div>

        </>
    );
}
export default Login;