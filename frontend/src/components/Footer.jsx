import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-grid">
          {/* Brand Column */}
          <div className="footer-brand">
            <div className="footer-logo">Hotel Khalsa Punjab</div>
            <p className="footer-desc">
              Redefining the luxury stay experience with rooted heritage and ethereal design.
            </p>
            <div className="footer-social">
              <a href="#" className="social-icon" aria-label="Website">
                <span className="material-symbols-outlined">public</span>
              </a>
              <a href="#" className="social-icon" aria-label="Share">
                <span className="material-symbols-outlined">share</span>
              </a>
              <a href="#" className="social-icon" aria-label="Email">
                <span className="material-symbols-outlined">mail</span>
              </a>
            </div>
          </div>

          {/* Location Column */}
          <div className="footer-col">
            <h4 className="footer-heading">Locations</h4>
            <ul className="footer-contact-list">
              <li>
                <span className="material-symbols-outlined footer-icon">location_on</span>
                <span>Main Road, Ahilyanagar,<br/>Maharashtra 414001, India</span>
              </li>
              <li>
                <span className="material-symbols-outlined footer-icon">call</span>
                <span>+91 98765 43210</span>
              </li>
              <li>
                <span className="material-symbols-outlined footer-icon">mail</span>
                <span>info@hotelkhalsapunjab.com</span>
              </li>
            </ul>
          </div>

          {/* Explore Column */}
          <div className="footer-col">
            <h4 className="footer-heading">Explore</h4>
            <div className="footer-links-grid">
              <Link to="/">Home</Link>
              <Link to="/gallery">Gallery</Link>
              <Link to="/booking">Booking</Link>
              <Link to="/contact">Contact</Link>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Hotel Khalsa Punjab. All Rights Reserved.</p>
          <p className="footer-badge">Member of Heritage Collections</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
