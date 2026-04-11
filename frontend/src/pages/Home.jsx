import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const services = [
    {
      title: 'Luxury Rooms',
      desc: 'An oasis of calm featuring handcrafted furnishings and premium linens.',
      img: '/images/photo2.jpg',
      span: 'wide',
    },
    {
      title: 'Wedding Lawns',
      desc: 'Breathtaking venues for your most cherished milestones.',
      img: '/images/photo3.jpg',
      span: 'tall',
    },
    {
      title: 'Fine Dining',
      desc: 'Authentic flavors prepared by master chefs with modern flair.',
      img: '/images/photo4.jpg',
      span: 'tall',
    },
    {
      title: 'Modern Amenities',
      desc: 'State-of-the-art facilities for wellness and leisure.',
      img: '/images/photo1.jpg',
      span: 'wide',
    },
  ];

  return (
    <div className="home-page">
      {/* === Hero Section === */}
      <section className="hero">
        <div className="hero__bg">
          <img src="/images/photo3.jpg" alt="Hotel Khalsa Punjab" className="hero__img" />
          <div className="hero__overlay" />
        </div>
        <div className="hero__content animate-fade-in-up">
          <span className="hero__badge">Welcome to Hotel Khalsa Punjab</span>
          <h1 className="hero__title">Experience Royal Luxury</h1>
          <p className="hero__subtitle">
            Where timeless Punjabi heritage meets modern ethereal comfort. Discover a sanctuary of quiet luxury and world-class hospitality.
          </p>
          <div className="hero__cta">
            <Link to="/booking" className="btn-primary">Book Your Stay</Link>
            <Link to="/gallery" className="btn-outline">Explore Gallery</Link>
          </div>
        </div>
        <div className="hero__scroll">
          <span className="material-symbols-outlined">expand_more</span>
        </div>
      </section>

      {/* === Premium Offerings Bento Grid === */}
      <section className="offerings">
        <div className="offerings__header container">
          <div className="offerings__header-left">
            <span className="offerings__label">Exceptional Services</span>
            <h2 className="offerings__title">Our Premium Offerings</h2>
          </div>
        </div>
        <div className="offerings__grid container">
          {services.map((s, i) => (
            <div key={i} className={`offerings__card offerings__card--${s.span}`}>
              <img src={s.img} alt={s.title} className="offerings__card-img" />
              <div className="offerings__card-overlay">
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* === Heritage Section === */}
      <section className="heritage">
        <div className="heritage__inner container">
          <div className="heritage__images">
            <div className="heritage__frame heritage__frame--main">
              <img src="/images/photo1.jpg" alt="Heritage Facade" />
            </div>
            <div className="heritage__frame heritage__frame--accent">
              <img src="/images/photo4.jpg" alt="Interior detail" />
            </div>
          </div>
          <div className="heritage__text">
            <span className="heritage__label">Our Story</span>
            <h2 className="heritage__title">A Heritage of Hospitality</h2>
            <div className="heritage__body">
              <p>
                For generations, the name Khalsa has been synonymous with warmth, generosity, and an unwavering commitment to the guest's comfort. Hotel Khalsa Punjab carries this legacy forward into the modern era.
              </p>
              <p>
                Our philosophy is rooted in the traditional Punjabi spirit of hospitality, where every traveler is treated with the reverence of royalty. We invite you to experience a blend of historic grandeur and contemporary luxury that creates memories to last a lifetime.
              </p>
            </div>
            <Link to="/contact" className="heritage__cta">
              Learn about our heritage
              <span className="heritage__cta-line" />
            </Link>
          </div>
        </div>
      </section>

      {/* === Floating FAB === */}
      <div className="fab">
        <Link to="/booking" className="fab__btn" aria-label="Book Now">
          <span className="material-symbols-outlined">calendar_month</span>
        </Link>
      </div>
    </div>
  );
};

export default Home;
