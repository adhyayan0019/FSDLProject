import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import './AdminDashboard.css';

const ROOM_TYPES = [
    { key: 'Luxury Suite',       defaultCap: 5 },
    { key: 'Premium Room',       defaultCap: 5 },
    { key: 'Family Room',        defaultCap: 5 },
    { key: 'Wedding Lawn Setup', defaultCap: 1 },
    { key: 'Banquet Hall',       defaultCap: 1 },
];

const toDateStr = (d) => d.toISOString().split('T')[0];
const addDays   = (base, n) => { const d = new Date(base); d.setDate(d.getDate() + n); return d; };

const AdminDashboard = () => {
    const { token, user, API_URL } = useAuth();

    const [bookings, setBookings] = useState([]);
    const [metrics, setMetrics]   = useState({ totalBookings: 0, pendingBookings: 0, confirmedBookings: 0 });
    const [filters, setFilters]   = useState({ date: '', roomType: '', search: '' });
    const [globalCaps, setGlobalCaps] = useState(() =>
        Object.fromEntries(ROOM_TYPES.map(r => [r.key, r.defaultCap]))
    );
    const [dateCaps, setDateCaps] = useState({});
    const [invDate, setInvDate] = useState(toDateStr(new Date()));
    const [saving, setSaving] = useState({});
    const [saveMsg, setSaveMsg] = useState({ text: '', type: 'success' });
    const [windowStart, setWindowStart] = useState(new Date());
    const DATE_WINDOW = 14;

    const fetchDashboardData = useCallback(async () => {
        try {
            const headers = { Authorization: `Bearer ${token}` };
            const mRes = await fetch(`${API_URL}/api/admin/metrics`, { headers });
            if (mRes.ok) setMetrics(await mRes.json());

            const qp = new URLSearchParams(filters).toString();
            const bRes = await fetch(`${API_URL}/api/admin/bookings?${qp}`, { headers });
            if (bRes.ok) setBookings(await bRes.json());

            const iRes = await fetch(`${API_URL}/api/admin/inventory`, { headers });
            if (iRes.ok) {
                const iData = await iRes.json();
                const newGlobal = { ...Object.fromEntries(ROOM_TYPES.map(r => [r.key, r.defaultCap])) };
                const newDate  = {};
                iData.forEach(item => {
                    if (item.totalCapacity !== undefined) newGlobal[item.roomType] = item.totalCapacity;
                    if (item.dateCapacities && typeof item.dateCapacities === 'object') {
                        newDate[item.roomType] = item.dateCapacities;
                    }
                });
                setGlobalCaps(newGlobal);
                setDateCaps(newDate);
            }
        } catch (err) { console.error(err); }
    }, [token, filters, API_URL]);

    useEffect(() => {
        if (token && user?.role === 'admin') fetchDashboardData();
    }, [fetchDashboardData, token, user]);

    const getCapForDate = (roomType, dateStr) => {
        if (dateCaps[roomType] && dateCaps[roomType][dateStr] !== undefined) {
            return dateCaps[roomType][dateStr];
        }
        return globalCaps[roomType] ?? 5;
    };

    const setCapForDate = (roomType, dateStr, value) => {
        const v = Math.max(0, Number(value) || 0);
        setDateCaps(prev => ({
            ...prev,
            [roomType]: { ...(prev[roomType] || {}), [dateStr]: v }
        }));
    };

    const showMsg = (text, type = 'success') => {
        setSaveMsg({ text, type });
        setTimeout(() => setSaveMsg({ text: '', type: 'success' }), 3000);
    };

    const saveCapForDate = async (roomType, dateStr) => {
        const cap = getCapForDate(roomType, dateStr);
        const key = `${roomType}__${dateStr}`;
        setSaving(p => ({ ...p, [key]: true }));
        try {
            const res = await fetch(`${API_URL}/api/admin/inventory`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ roomType, date: dateStr, capacity: cap })
            });
            const data = await res.json();
            if (res.ok) {
                showMsg(`✓ ${roomType} → ${dateStr}: ${cap} rooms saved`);
                fetchDashboardData();
            } else {
                showMsg(`✗ Error: ${data.error || 'Save failed'}`, 'error');
            }
        } catch (e) {
            showMsg('✗ Network error', 'error');
        }
        setSaving(p => ({ ...p, [key]: false }));
    };

    const saveGlobalCap = async (roomType) => {
        const cap = globalCaps[roomType];
        const key = `global__${roomType}`;
        setSaving(p => ({ ...p, [key]: true }));
        try {
            const res = await fetch(`${API_URL}/api/admin/inventory`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ roomType, totalCapacity: cap })
            });
            if (res.ok) {
                showMsg(`✓ ${roomType} global capacity: ${cap} rooms`);
                fetchDashboardData();
            } else {
                showMsg('✗ Save failed', 'error');
            }
        } catch (e) { showMsg('✗ Network error', 'error'); }
        setSaving(p => ({ ...p, [key]: false }));
    };

    const handleFilterChange = (e) =>
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const confirmBooking = async (id) => {
        if (!window.confirm('Confirm this booking?')) return;
        try {
            await fetch(`${API_URL}/api/admin/bookings/${id}/confirm`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchDashboardData();
            alert('Confirmed!');
        } catch (err) { console.error(err); }
    };

    const windowDates = Array.from({ length: DATE_WINDOW }, (_, i) =>
        toDateStr(addDays(windowStart, i))
    );

    if (!user || user.role !== 'admin')
        return <div style={{ padding: '120px', textAlign: 'center' }}>Access Denied. Admin only.</div>;

    return (
        <div className="admin-dashboard container animate-fade-in" style={{ paddingTop: '100px' }}>
            <h1 className="page-title" style={{ marginBottom: '24px' }}>Admin Dashboard</h1>

            {/* Metrics */}
            <div className="metrics-grid">
                <div className="metric-card glass-panel"><h3>Total Bookings</h3><p>{metrics.totalBookings}</p></div>
                <div className="metric-card glass-panel"><h3>Pending</h3><p>{metrics.pendingBookings}</p></div>
                <div className="metric-card glass-panel"><h3>Confirmed</h3><p>{metrics.confirmedBookings}</p></div>
            </div>

            {/* Inventory */}
            <div className="inv-panel" style={{ marginBottom: '24px' }}>
                <h2 className="inv-title">Inventory Configuration</h2>
                <p className="inv-sub">Set room counts per date. Up/Down arrows change count, then click Save. Unset dates use Global Default.</p>

                {saveMsg.text && (
                    <div className={`inv-msg inv-msg--${saveMsg.type}`}>{saveMsg.text}</div>
                )}

                {/* Global Defaults */}
                <div className="inv-section">
                    <h3 className="inv-section-title">Global Default Capacity (All dates unless overridden)</h3>
                    <div className="inv-global-grid">
                        {ROOM_TYPES.map(room => (
                            <div key={room.key} className="inv-global-card">
                                <div className="inv-room-name">{room.key}</div>
                                <div className="inv-ctrl-row">
                                    <button
                                        className="inv-arrow-btn"
                                        onClick={() => setGlobalCaps(p => ({ ...p, [room.key]: Math.max(0, (p[room.key] || 0) - 1) }))}
                                    >▼</button>
                                    <span className="inv-count">{globalCaps[room.key] ?? 5}</span>
                                    <button
                                        className="inv-arrow-btn"
                                        onClick={() => setGlobalCaps(p => ({ ...p, [room.key]: (p[room.key] || 0) + 1 }))}
                                    >▲</button>
                                    <button
                                        className="inv-save-btn"
                                        onClick={() => saveGlobalCap(room.key)}
                                        disabled={!!saving[`global__${room.key}`]}
                                    >{saving[`global__${room.key}`] ? '…' : 'Save'}</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Date-Specific */}
                <div className="inv-section">
                    <div className="inv-date-header">
                        <h3 className="inv-section-title" style={{ margin: 0 }}>Date-Specific Override</h3>
                        <div className="inv-date-nav">
                            <label className="inv-label">Jump to:</label>
                            <input
                                type="date"
                                value={invDate}
                                onChange={e => { setInvDate(e.target.value); setWindowStart(new Date(e.target.value + 'T00:00:00')); }}
                                className="inv-date-input"
                            />
                            <button className="inv-nav-btn" onClick={() => setWindowStart(d => addDays(d, -7))}>◀ Prev</button>
                            <button className="inv-nav-btn" onClick={() => { setWindowStart(new Date()); setInvDate(toDateStr(new Date())); }}>Today</button>
                            <button className="inv-nav-btn" onClick={() => setWindowStart(d => addDays(d, 7))}>Next ▶</button>
                        </div>
                    </div>

                    <div className="inv-table-wrapper">
                        <table className="inv-table">
                            <thead>
                                <tr>
                                    <th className="inv-th-room">Room Type</th>
                                    {windowDates.map(dateStr => {
                                        const d   = new Date(dateStr + 'T00:00:00');
                                        const isToday = dateStr === toDateStr(new Date());
                                        return (
                                            <th key={dateStr} className={`inv-th-date ${isToday ? 'inv-th-today' : ''}`}>
                                                <div className="inv-date-num">{d.getDate()}</div>
                                                <div className="inv-date-day">{d.toLocaleString('default', { weekday: 'short' })}, {d.toLocaleString('default', { month: 'short' })}</div>
                                            </th>
                                        );
                                    })}
                                </tr>
                            </thead>
                            <tbody>
                                {ROOM_TYPES.map((room, ri) => (
                                    <tr key={room.key} className={ri % 2 === 0 ? 'inv-tr-even' : 'inv-tr-odd'}>
                                        <td className="inv-td-room">{room.key}</td>
                                        {windowDates.map(dateStr => {
                                            const cap = getCapForDate(room.key, dateStr);
                                            const isOverride = dateCaps[room.key] && dateCaps[room.key][dateStr] !== undefined;
                                            const key = `${room.key}__${dateStr}`;
                                            return (
                                                <td key={dateStr} className={`inv-td-date ${isOverride ? 'inv-td-override' : ''}`}>
                                                    <button className="inv-arrow-sm" onClick={() => setCapForDate(room.key, dateStr, cap + 1)}>▲</button>
                                                    <span className="inv-td-count">{cap}</span>
                                                    <button className="inv-arrow-sm" onClick={() => setCapForDate(room.key, dateStr, cap - 1)}>▼</button>
                                                    <button
                                                        className="inv-td-save"
                                                        onClick={() => saveCapForDate(room.key, dateStr)}
                                                        disabled={!!saving[key]}
                                                    >{saving[key] ? '…' : 'Save'}</button>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p className="inv-hint">🟨 Yellow cells = custom override set for that date</p>
                </div>
            </div>

            {/* Bookings */}
            <div className="dashboard-content glass-panel">
                <h2>Manage Bookings</h2>
                <div className="filters-row">
                    <input type="text" name="search" placeholder="Search name/email/phone..." value={filters.search} onChange={handleFilterChange} className="form-control" />
                    <input type="date" name="date" value={filters.date} onChange={handleFilterChange} className="form-control" />
                    <select name="roomType" value={filters.roomType} onChange={handleFilterChange} className="form-control">
                        <option value="">All Rooms</option>
                        {ROOM_TYPES.map(r => <option key={r.key} value={r.key}>{r.key}</option>)}
                    </select>
                </div>
                <div className="table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr><th>Name</th><th>Phone</th><th>Room</th><th>Dates</th><th>Status</th><th>Action</th></tr>
                        </thead>
                        <tbody>
                            {bookings.length === 0
                                ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: '#888' }}>No bookings found.</td></tr>
                                : bookings.map(b => (
                                    <tr key={b.id}>
                                        <td>{b.name}</td>
                                        <td>{b.phone}</td>
                                        <td>{b.roomType}</td>
                                        <td>{b.checkIn} → {b.checkOut}</td>
                                        <td><span className={`status-badge ${b.status}`}>{b.status}</span></td>
                                        <td>{b.status === 'pending' && <button className="confirm-btn" onClick={() => confirmBooking(b.id)}>Confirm</button>}</td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
