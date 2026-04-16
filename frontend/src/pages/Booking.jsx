import { useState } from 'react';
import { Calendar, Users, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AvailabilityCalendar from '../components/AvailabilityCalendar';
import './Booking.css';

const Booking = () => {
  const { API_URL } = useAuth(); // NEW: Get API context
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    checkIn: '',
    checkOut: '',
    roomType: 'Luxury Suite',
    guests: 1,
    specialRequests: ''
  });

  const [status, setStatus] = useState({ loading: false, success: false, error: null });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: false, error: null });

    try {
      const response = await fetch(`${API_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Booking failed. Please try again.');
      }

      setStatus({ loading: false, success: true, error: null });
      setFormData({
        name: '', email: '', phone: '', checkIn: '', checkOut: '', roomType: 'Luxury Suite', guests: 1, specialRequests: ''
      });

      // Auto hide success message
      setTimeout(() => setStatus(prev => ({ ...prev, success: false })), 5000);

    } catch (err) {
      setStatus({ loading: false, success: false, error: err.message });
    }
  };

  return (
    <div className="booking-page animate-fade-in pt-32">

      <div className="container booking-container">
        <div className="booking-form-wrapper glass-panel">
          <h2 className="form-title">Booking Form</h2>

          {status.success && (
            <div className="alert-success">
              Your booking has been successfully confirmed. Our team will contact you shortly!
            </div>
          )}

          {status.error && (
            <div className="alert-error">
              {status.error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="booking-form">
            <div className="form-grid">

              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input type="text" name="name" className="form-control" value={formData.name} onChange={handleChange} required placeholder="Enter your full name" />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input type="email" name="email" className="form-control" value={formData.email} onChange={handleChange} required placeholder="Enter your email" />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input type="tel" name="phone" className="form-control" value={formData.phone} onChange={handleChange} required placeholder="10-digit mobile number" />
              </div>

              <div className="form-group">
                <label className="form-label">Number of Guests *</label>
                <div className="input-with-icon">
                  <Users className="input-icon" size={18} />
                  <input type="number" name="guests" className="form-control" min="1" max="10" value={formData.guests} onChange={handleChange} required />
                </div>
              </div>

              <div className="form-group full-width">
                <label className="form-label">Accommodation Type *</label>
                <div className="input-with-icon">
                  <Home className="input-icon" size={18} />
                  <select name="roomType" className="form-control" value={formData.roomType} onChange={handleChange} required>
                    <option value="Luxury Suite">Luxury Suite</option>
                    <option value="Premium Room">Premium Room</option>
                    <option value="Family Room">Family Room</option>
                    <option value="Wedding Lawn Setup">Wedding Lawn Setup</option>
                    <option value="Banquet Hall">Banquet Hall</option>
                  </select>
                </div>
              </div>

              <div className="form-group full-width">
                <label className="form-label">Select Booking Dates *</label>
                <div className="calendar-instruction">Please select both Check-In and Check-Out dates on the calendar.</div>
                <AvailabilityCalendar 
                    roomType={formData.roomType} 
                    checkIn={formData.checkIn} 
                    checkOut={formData.checkOut} 
                    onChange={handleChange} 
                />
              </div>



              <div className="form-group full-width">
                <label className="form-label">Special Requests (Optional)</label>
                <textarea name="specialRequests" className="form-control" rows="4" value={formData.specialRequests} onChange={handleChange} placeholder="Any specific requirements..."></textarea>
              </div>

            </div>

            <button type="submit" className="btn-primary form-submit-btn" disabled={status.loading}>
              {status.loading ? 'Processing...' : 'Confirm Booking'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Booking;
