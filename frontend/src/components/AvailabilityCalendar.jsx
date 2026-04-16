import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './AvailabilityCalendar.css';

const AvailabilityCalendar = ({ roomType, checkIn, checkOut, onChange }) => {
    const { API_URL } = useAuth();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [availability, setAvailability] = useState({ totalCapacity: 5, dailyUsage: {}, dailyMax: {} });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchAvailability();
    }, [currentDate, roomType]);

    const fetchAvailability = async () => {
        const month = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_URL}/api/bookings/availability?roomType=${encodeURIComponent(roomType)}&month=${month}&year=${year}`);
            if (res.ok) {
                const data = await res.json();
                setAvailability(data);
            } else {
                // fallback - treat as available with default capacity
                setAvailability({ totalCapacity: 5, dailyUsage: {}, dailyMax: {} });
            }
        } catch (err) {
            console.error("Failed to fetch availability", err);
            setError("Could not load availability. Dates may still be selected.");
            // On error, default to available so user can still select
            setAvailability({ totalCapacity: 5, dailyUsage: {}, dailyMax: {} });
        }
        setLoading(false);
    };

    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const getCapacityForDate = (dateStr) => {
        // dailyMax from backend: per-date capacity (0 = explicitly blocked, 5+ = available)
        if (availability.dailyMax && availability.dailyMax[dateStr] !== undefined) {
            return availability.dailyMax[dateStr];  // respect 0 — do NOT override it
        }
        // Fall back to totalCapacity; if no inventory configured yet use 5 as default
        return (availability.totalCapacity !== undefined && availability.totalCapacity !== null)
            ? availability.totalCapacity
            : 5;
    };

    const renderDays = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const days = [];
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="cal-day cal-empty"></div>);
        }

        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const usage = availability.dailyUsage ? (availability.dailyUsage[dateStr] || 0) : 0;
            const capacity = getCapacityForDate(dateStr);
            const remaining = Math.max(0, capacity - usage);

            const thisDate = new Date(year, month, d);
            const isPast = thisDate < today;
            const isFullyBooked = remaining <= 0 && !isPast;
            const isSelected = dateStr === checkIn || dateStr === checkOut;
            const isBetween = checkIn && checkOut && dateStr > checkIn && dateStr < checkOut;

            // Selecting checkout: allow clicking any future date after checkIn
            // (even if that date is fully booked — availability validated on submit)
            const isSelectingCheckout = checkIn && !checkOut;
            const isAfterCheckIn = isSelectingCheckout && dateStr > checkIn;

            let dayClass = 'cal-day';
            if (isPast) {
                dayClass += ' cal-past';
            } else if (isAfterCheckIn) {
                // When picking checkout: show all future-after-checkin dates as selectable
                dayClass += isFullyBooked ? ' cal-full cal-checkout-selectable' : ' cal-avail';
            } else if (isFullyBooked) {
                dayClass += ' cal-full';
            } else {
                dayClass += ' cal-avail';
            }
            if (isSelected) dayClass += ' cal-selected';
            if (isBetween) dayClass += ' cal-between';

            // Clickable: not past, AND (available OR picking checkout after check-in)
            const isClickable = !isPast && (!isFullyBooked || isAfterCheckIn);

            days.push(
                <div
                    key={d}
                    className={dayClass}
                    onClick={() => isClickable && handleDateClick(dateStr)}
                    title={isPast ? 'Past date' : isAfterCheckIn && isFullyBooked ? 'Select as Check-Out' : isFullyBooked ? 'Fully Booked' : `${remaining} rooms available`}
                >
                    <span className="cal-num">{d}</span>
                    {!isPast && (
                        <span className="cal-badge">
                            {isAfterCheckIn && isFullyBooked ? 'CO' : isFullyBooked ? 'Full' : remaining}
                        </span>
                    )}
                </div>
            );
        }
        return days;
    };


    const handleDateClick = (dateStr) => {
        if (!checkIn || (checkIn && checkOut)) {
            // Start new selection
            onChange({ target: { name: 'checkIn', value: dateStr } });
            onChange({ target: { name: 'checkOut', value: '' } });
        } else {
            // Already have check-in, now set checkout
            if (dateStr > checkIn) {
                onChange({ target: { name: 'checkOut', value: dateStr } });
            } else if (dateStr < checkIn) {
                // Clicked before checkIn - swap
                onChange({ target: { name: 'checkOut', value: checkIn } });
                onChange({ target: { name: 'checkIn', value: dateStr } });
            } else {
                // Same date - reset
                onChange({ target: { name: 'checkIn', value: dateStr } });
                onChange({ target: { name: 'checkOut', value: '' } });
            }
        }
    };

    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

    const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    return (
        <div className="avail-cal">
            {/* Header */}
            <div className="avail-header">
                <button type="button" className="avail-nav" onClick={prevMonth}>&#8249;</button>
                <h4 className="avail-month">{monthName}</h4>
                <button type="button" className="avail-nav" onClick={nextMonth}>&#8250;</button>
            </div>

            {/* Legend */}
            <div className="avail-legend">
                <span><span className="leg-dot leg-avail"></span>Available</span>
                <span><span className="leg-dot leg-full"></span>Fully Booked</span>
                <span><span className="leg-dot leg-past"></span>Past</span>
                <span><span className="leg-dot leg-sel"></span>Selected</span>
            </div>

            {error && <div className="avail-error">{error}</div>}

            {loading ? (
                <div className="avail-loading">Loading availability...</div>
            ) : (
                <div className="avail-grid">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="avail-weekday">{day}</div>
                    ))}
                    {renderDays()}
                </div>
            )}

            {/* Selection Display */}
            <div className="avail-selection">
                <div className="avail-sel-item">
                    <span>Check-In</span>
                    <strong>{checkIn || '—'}</strong>
                </div>
                <div className="avail-sel-arrow">→</div>
                <div className="avail-sel-item">
                    <span>Check-Out</span>
                    <strong>{checkOut || '—'}</strong>
                </div>
            </div>
            {checkIn && !checkOut && (
                <p className="avail-hint">Now click a date to select Check-Out</p>
            )}
        </div>
    );
};

export default AvailabilityCalendar;
