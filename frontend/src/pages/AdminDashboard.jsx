import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const { token, user, API_URL } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [metrics, setMetrics] = useState({ totalBookings: 0, pendingBookings: 0, confirmedBookings: 0 });
    const [filters, setFilters] = useState({ date: '', roomType: '', search: '' });

    const fetchDashboardData = async () => {
        try {
            // Fetch Metrics
            const mRes = await fetch(`${API_URL}/api/admin/metrics`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const mData = await mRes.json();
            if (mRes.ok) setMetrics(mData);

            // Fetch Bookings
            const queryParams = new URLSearchParams(filters).toString();
            const bRes = await fetch(`${API_URL}/api/admin/bookings?${queryParams}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const bData = await bRes.json();
            if (bRes.ok) setBookings(bData);

        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (token && user?.role === 'admin') {
            fetchDashboardData();
        }
    }, [token, user, filters]); // Re-fetch when filters change !

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const confirmBooking = async (id) => {
        if (!window.confirm('Are you sure you want to confirm this booking and send SMS?')) return;
        try {
            await fetch(`${API_URL}/api/admin/bookings/${id}/confirm`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchDashboardData(); // refresh
            alert("Confirmed!");
        } catch (err) {
            console.error('Failed to confirm', err);
        }
    };

    if (!user || user.role !== 'admin') return <div style={{padding: '100px', textAlign: 'center'}}>Access Denied. Admin only.</div>;

    return (
        <div className="admin-dashboard container animate-fade-in">
            <h1 className="page-title" style={{marginTop: '40px', marginBottom: '20px'}}>Admin Dashboard</h1>
            
            <div className="metrics-grid">
                <div className="metric-card glass-panel">
                    <h3>Total Bookings</h3>
                    <p>{metrics.totalBookings}</p>
                </div>
                <div className="metric-card glass-panel">
                    <h3>Pending</h3>
                    <p>{metrics.pendingBookings}</p>
                </div>
                <div className="metric-card glass-panel">
                    <h3>Confirmed</h3>
                    <p>{metrics.confirmedBookings}</p>
                </div>
            </div>

            <div className="dashboard-content glass-panel">
                <h2>Manage Bookings</h2>
                
                <div className="filters-row">
                    <input type="text" name="search" placeholder="Search name/email/phone..." value={filters.search} onChange={handleFilterChange} className="form-control" />
                    <input type="date" name="date" value={filters.date} onChange={handleFilterChange} className="form-control" />
                    <select name="roomType" value={filters.roomType} onChange={handleFilterChange} className="form-control">
                        <option value="">All Rooms</option>
                        <option value="Luxury Suite">Luxury Suite</option>
                        <option value="Premium Room">Premium Room</option>
                        <option value="Family Room">Family Room</option>
                        <option value="Wedding Lawn Setup">Wedding Lawn Setup</option>
                        <option value="Banquet Hall">Banquet Hall</option>
                    </select>
                </div>

                <div className="table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Phone</th>
                                <th>Room</th>
                                <th>Dates</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map(b => (
                                <tr key={b.id}>
                                    <td>{b.name}</td>
                                    <td>{b.phone}</td>
                                    <td>{b.roomType}</td>
                                    <td>{b.checkIn} to {b.checkOut}</td>
                                    <td><span className={`status-badge ${b.status}`}>{b.status}</span></td>
                                    <td>
                                        {b.status === 'pending' && (
                                            <button className="confirm-btn" onClick={() => confirmBooking(b.id)}>Confirm</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
