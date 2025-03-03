import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Message } from "primereact/message";
import { Divider } from "primereact/divider";

const vetLogin = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const onSubmit = async (data) => {
        setLoading(true);
        setErrorMessage("");

        try {
            const response = await fetch("http://localhost:3000/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error("Invalid credentials");

            const result = await response.json();
            console.log("Login Successful:", result);
            alert("Login successful!");  // Replace with navigation

        } catch (error) {
            setErrorMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <Card className="p-6 shadow-lg w-96">
                <h2 className="text-center text-xl font-bold mb-4">Login</h2>
                {errorMessage && <Message severity="error" text={errorMessage} />}
                
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
                    {/* Username */}
                    <label htmlFor="username">Username</label>
                    <InputText 
                        id="username" 
                        {...register("username", { required: "Username is required" })}
                        className={`w-full ${errors.username ? "p-invalid" : ""}`} 
                    />
                    {errors.username && <small className="p-error">{errors.username.message}</small>}

                    {/* Password */}
                    <label htmlFor="password">Password</label>
                    <Password 
                        id="password" 
                        {...register("password", { required: "Password is required" })}
                        className="w-full"
                        feedback={false}
                        toggleMask
                    />
                    {errors.password && <small className="p-error">{errors.password.message}</small>}

                    <Divider />

                    {/* Login Button */}
                    <Button label="Login" type="submit" icon="pi pi-sign-in" loading={loading} className="w-full" />
                </form>
            </Card>
        </div>
    );
};

export default vetLogin;
