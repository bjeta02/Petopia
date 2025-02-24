import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import axios from 'axios';
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import './Login.css'; // Add your custom styles here
import logo from '../assets/logo.jpg'; // Replace with your logo path

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const validateForm = () => {
        const newErrors = {};
        if (!email) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Invalid email format';
        
        if (!password) newErrors.password = 'Password is required';
        else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
        
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await axios.post('http://localhost:5000/api/users/login', { email, password });
            const { id, clinic_id, role, token } = response.data;

            // Store user data
            localStorage.setItem('userId', id);
            localStorage.setItem('clinicId', clinic_id || '');
            localStorage.setItem('role', role);
            localStorage.setItem('token', token);
            
            setIsLoggedIn(true);

            // Redirect based on role
            if (role === 'clinic') {
                navigate('/dashboard');
            } else if (role === 'pet_owner') {
                navigate('/home');
            } else {
                navigate('/');
            }
        } catch (err) {
            setError(err.response ? err.response.data.message : 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-content-center align-items-center h-screen bg-blue-50">
            <Card className="shadow-5 p-6 w-full sm:w-10 md:w-6 lg:w-4">
                <div className="flex justify-content-center mb-4" style={{marginTop: '-30px'}}>
                    <img src={logo} alt="Logo" style={{ width: '200px', height: 'auto' }} />
                </div>

                {errors.login && <Message severity="error mb-3" text={errors.login} />}

                <form onSubmit={handleSubmit} className="flex flex-column gap-4">
                    <div>
                        <label htmlFor="email" className="block text-900 font-medium mb-1">Email</label>
                        <span className="p-input-icon-left w-full">
                            <i className="pi pi-envelope" style={{marginLeft: '10px'}} />
                            <InputText 
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={`w-full ${errors.email ? 'p-invalid' : ''}`}
                                placeholder="Enter your email"
                                style={{textIndent: '23px'}}
                            />
                        </span>
                        {errors.email && <small className="p-error mb-2">{errors.email}</small>}
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-900 font-medium mb-1">Password</label>
                        <div className="p-input-icon-left w-full mb-2" style={{ position: 'relative' }}>
                            <i className="pi pi-lock" style={{ marginLeft: '10px' }} />
                            <InputText
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={`w-full ${errors.password ? 'p-invalid' : ''}`}
                                placeholder="Enter your password"
                                style={{ textIndent: '23px' }}
                            />
                        </div>
                        {errors.password && <small className="p-error mb-2">{errors.password}</small>}
                    </div>

                    <Button 
                        type="Submit"
                        label="Login"
                        className="w-full"
                        loading={loading}
                        style={{
                            background: '#4ea87e',
                            border: 'none',
                            boxShadow: 'none'
                        }}
                    />

                    <div className="flex justify-content-center">
                        <span className="text-gray-600 hover:text-gray-800 font-semibold italic no-underline transition duration-200 ease-in-out">
                            Not registered yet? 
                        </span>
                        <a 
                            href="/signup" 
                            className="font-semibold italic no-underline transition duration-200 ease-in-out cursor-pointer ml-1"
                            style={{ color: '#4ea87e' }}
                        >
                            Register
                        </a>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default Login;