import React, { useState } from 'react';
import axios from 'axios';
import './signup.css'; // Import the CSS file for styling

const SignupForm = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Form Data:', formData); // Debugging: Log the form data
        try {
            const res = await axios.post('http://localhost:5000/signup', formData);
            alert(res.data.msg);
        } catch (error) {
            if (error.response) {
                console.error('Error Response:', error.response.data); // Debugging: Log the error response
                alert(error.response.data.msg);
            } else {
                console.error('Error:', error);
                alert('Something went wrong, please try again.');
            }
        }
    };

    return (
        <div>
            <h2>Signup Form</h2>
            <form onSubmit={handleSubmit}>
                <label>
                    Username:
                    <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
                </label>
                <br />
                <label>
                    Email:
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </label>
                <br />
                <label>
                    Password:
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </label>
                <br />
                <button type="submit">Sign Up</button>
            </form>
        </div>
    );
};

export default SignupForm;