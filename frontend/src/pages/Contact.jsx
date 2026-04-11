import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import './Contact.css';

const Contact = () => {
  return (
    <div className="contact-page animate-fade-in pt-32">
      <div className="flex flex-col items-center justify-center text-center pb-16">
        <div className="container">
          <h1 className="font-editorial italic text-5xl md:text-6xl text-primary mb-4">Contact Us</h1>
          <p className="text-gray-600 text-lg">We are here to make your stay memorable. Reach out to us.</p>
        </div>
      </div>

      <div className="container contact-container">
        <div className="contact-info-grid">
          
          <div className="contact-card glass-panel">
            <div className="contact-icon-wrapper">
              <MapPin size={24} />
            </div>
            <h3>Location</h3>
            <p>Main Road, Ahilyanagar<br/>Maharashtra 414001, India</p>
          </div>

          <div className="contact-card glass-panel">
            <div className="contact-icon-wrapper">
              <Phone size={24} />
            </div>
            <h3>Phone</h3>
            <p>+91 98765 43210<br/>+91 12345 67890</p>
          </div>

          <div className="contact-card glass-panel">
            <div className="contact-icon-wrapper">
              <Mail size={24} />
            </div>
            <h3>Email</h3>
            <p>info@hotelkhalsapunjab.com<br/>bookings@hotelkhalsapunjab.com</p>
          </div>

          <div className="contact-card glass-panel">
            <div className="contact-icon-wrapper">
              <Clock size={24} />
            </div>
            <h3>Hours</h3>
            <p>Reception: 24/7 Hours<br/>Restaurant: 7:00 AM - 11:00 PM</p>
          </div>

        </div>

        <div className="contact-bottom glass-panel">
           <div className="map-placeholder">
             <h2>Find Us On The Map</h2>
             <div className="map-box">
                {/* Fake map to keep aesthetically pleasing without external deps */}
                <div className="fake-map">
                   <div className="map-marker"><MapPin size={40} color="var(--color-primary)" fill="white"/></div>
                   <p className="map-text">Hotel Khalsa Punjab<br/>Ahilyanagar</p>
                </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
