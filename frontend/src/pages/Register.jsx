import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import './LoginRegister.css';

const Register = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' });
    const [error, setError] = useState(null);
    const { API_URL } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const res = await fetch(`${API_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            navigate('/login');
            
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="auth-page animate-fade-in container">
            <div className="auth-form-wrapper glass-panel">
                <h2 className="form-title">Register</h2>
                {error && <div className="alert-error">{error}</div>}
                <form onSubmit={handleSubmit} className="booking-form">
                    <div className="form-group full-width">
                        <label className="form-label">Full Name</label>
                        <input type="text" name="name" className="form-control" onChange={handleChange} required />
                    </div>
                    <div className="form-group full-width">
                        <label className="form-label">Email</label>
                        <input type="email" name="email" className="form-control" onChange={handleChange} required />
                    </div>
                    <div className="form-group full-width">
                        <label className="form-label">Phone</label>
                        <input type="tel" name="phone" className="form-control" onChange={handleChange} required />
                    </div>
                    <div className="form-group full-width">
                        <label className="form-label">Password</label>
                        <input type="password" name="password" className="form-control" onChange={handleChange} required />
                    </div>
                    <button type="submit" className="btn-primary form-submit-btn">Register</button>
                    <p style={{marginTop: '20px', textAlign: 'center'}}>Already have an account? <Link to="/login" style={{color: 'gold'}}>Login Here</Link></p>
                </form>
            </div>
        </div>
    );
};

export default Register;
