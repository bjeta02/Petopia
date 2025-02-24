import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Signup.css';
import logo from '../assets/logo.jpg';

const Signup = () => {
    const [clinicName, setClinicName] = useState('');
    const [address, setAddress] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [description, setDescription] = useState('');
    const [days, setDays] = useState('');
    const [openTime, setOpenTime] = useState('');
    const [closeTime, setCloseTime] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Validate form fields
    const validateForm = () => {
        const newErrors = {};
        if (!clinicName) newErrors.clinicName = 'Clinic Name is required';
        if (!address) newErrors.address = 'Address is required';
        if (!contactNumber) newErrors.contactNumber = 'Contact Number is required';
        if (!email) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Invalid email format';
        if (!password) newErrors.password = 'Password is required';
        if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
        
        return newErrors;
    };

    // Handle form submission
    const handleSubmit = async (event) => {
        event.preventDefault();
        setErrors({});
        setLoading(true);

        const formErrors = validateForm();
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            setLoading(false);
            return;
        }

        try {
            // Make API call to register the clinic and user
            const response = await axios.post("http://10.10.79.169:5000/api/users/register-clinic", {
                email,
                password,
                clinicName,
                address,
                contactNumber,
                description,
                days,
                open_time: openTime,
                close_time: closeTime,
                role: "clinic" // Set role as "clinic" for registration
            });

            console.log('Clinic Registered:', response.data);
            navigate('/login'); // Redirect to login page after successful signup
        } catch (error) {
            console.error('Registration failed:', error);
            setErrors({ signup: error.response?.data?.message || 'Registration failed. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-content-center align-items-center h-screen" >
            <div style={{ width: '700px', backgroundColor: 'white', height: '100%', padding: '20px' }}>
                {/* Logo Section */}
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                    <img src={logo} alt="Logo" style={{ width: '250px', height: 'auto' }} />
                </div>

                {/* Title Section */}
                <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '25px', fontWeight: 'bold', color: '#095d7e' }}>
                    Register Your Clinic
                </div>

                {Object.keys(errors).length > 0 && <Message severity="error" text="Please fill in all the required fields correctly" className="mb-3" />}

                <form onSubmit={handleSubmit} className="flex flex-column gap-4">
                    <InputField label="Clinic Name" value={clinicName} setValue={setClinicName} error={errors.clinicName} />
                    <InputField label="Address" value={address} setValue={setAddress} error={errors.address} />
                    <InputField label="Contact Number" value={contactNumber} setValue={setContactNumber} error={errors.contactNumber} />
                    <InputField label="Email Address" value={email} setValue={setEmail} error={errors.email} type="email" />
                    <InputField label="Description" value={description} setValue={setDescription} />
                    <InputField label="Operating Days" value={days} setValue={setDays} placeholder="e.g., Monday to Friday" />
                    <InputField label="Opening Time" value={openTime} setValue={setOpenTime} placeholder="e.g., 9:00 AM" />
                    <InputField label="Closing Time" value={closeTime} setValue={setCloseTime} placeholder="e.g., 6:00 PM" />
                    <InputField label="Password" value={password} setValue={setPassword} error={errors.password} type="password" />
                    <InputField label="Confirm Password" value={confirmPassword} setValue={setConfirmPassword} error={errors.confirmPassword} type="password" />

                    <Button 
                        type="submit"
                        label="Register Clinic"
                        className="w-full mt-6"
                        size="large"
                        loading={loading}
                        style={{ background: '#4ea87e', border: 'none', boxShadow: 'none', marginBottom: '50px'}}
                    />
                </form>
            </div>
        </div>
    );
};

// Reusable Input Field component
const InputField = ({ label, value, setValue, error, type = "text", placeholder = "" }) => (
    <div>
        <label className="block text-900 font-medium mb-3 mt-2">{label}</label>
        <InputText
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className={`w-full ${error ? 'p-invalid' : ''}`}
            placeholder={placeholder || `Enter ${label.toLowerCase()}`}
            type={type}
        />
        {error && <small className="p-error mb-2">{error}</small>}
    </div>
);

export default Signup;
