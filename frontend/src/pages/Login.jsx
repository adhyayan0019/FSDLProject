import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import './LoginRegister.css';

const Login = () => {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [error, setError] = useState(null);
    const { login, API_URL } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const res = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            login(data.user, data.token);
            if (data.user.role === 'admin') navigate('/admin');
            else navigate('/profile');
            
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="auth-page animate-fade-in container">
            <div className="auth-form-wrapper glass-panel">
                <h2 className="form-title">Login</h2>
                {error && <div className="alert-error">{error}</div>}
                <form onSubmit={handleSubmit} className="booking-form">
                    <div className="form-group full-width">
                        <label className="form-label">Email</label>
                        <input type="email" name="email" className="form-control" onChange={handleChange} required />
                    </div>
                    <div className="form-group full-width">
                        <label className="form-label">Password</label>
                        <input type="password" name="password" className="form-control" onChange={handleChange} required />
                    </div>
                    <button type="submit" className="btn-primary form-submit-btn">Login</button>
                    <p style={{marginTop: '20px', textAlign: 'center'}}>Don't have an account? <Link to="/register" style={{color: 'gold'}}>Register Here</Link></p>
                </form>
            </div>
        </div>
    );
};

export default Login;
