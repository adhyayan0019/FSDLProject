import './Gallery.css';

const Gallery = () => {
  const featuredSections = [
    {
      title: 'Royal Suites',
      desc: 'Designed for modern royalty, our suites blend traditional Phulkari motifs with contemporary minimalist silhouettes. A harmony of texture and light.',
      img: '/images/photo2.jpg',
      cta: 'Explore Interiors',
      layout: 'left',
    },
    {
      title: 'Exquisite Dining',
      desc: 'From sun-drenched breakfast terraces to moonlit courtyards, our culinary spaces are staged for moments of shared joy and epicurean discovery.',
      img: '/images/photo4.jpg',
      cta: 'View the Kitchens',
      layout: 'right',
    },
  ];

  const masonryImages = [
    { src: '/images/photo1.jpg', alt: 'Grand Entrance' },
    { src: '/images/photo2.jpg', alt: 'Luxury Suite' },
    { src: '/images/photo3.jpg', alt: 'Wedding Lawn' },
    { src: '/images/photo4.jpg', alt: 'Banquet Hall' },
    { src: '/images/photo1.jpg', alt: 'Exterior' },
    { src: '/images/photo3.jpg', alt: 'Garden' },
  ];

  return (
    <div className="gallery-page">
      {/* Hero Header */}
      <section className="gallery-hero container">
        <span className="gallery-hero__label">A Visual Narrative</span>
        <h1 className="gallery-hero__title">Our Gallery</h1>
        <p className="gallery-hero__subtitle">
          Step into a sanctuary where Punjabi heritage meets ethereal luxury. Every corner at Hotel Khalsa Punjab tells a story of gold-flecked history and whispered comfort.
        </p>
      </section>

      {/* Featured Sections */}
      {featuredSections.map((section, i) => (
        <section
          key={i}
          className={`gallery-featured ${section.layout === 'right' ? 'gallery-featured--alt' : ''}`}
        >
          <div className="gallery-featured__inner">
            <div className="gallery-featured__image-wrap">
              <img src={section.img} alt={section.title} className="gallery-featured__image" />
              <div className="gallery-featured__image-gradient" />
            </div>
            <div className="gallery-featured__text">
              <h2 className="gallery-featured__title">{section.title}</h2>
              <p className="gallery-featured__desc">{section.desc}</p>
              <span className="gallery-featured__cta">{section.cta}</span>
            </div>
          </div>
        </section>
      ))}

      {/* Masonry Grid */}
      <section className="gallery-masonry container">
        <div className="gallery-masonry__header">
          <h2>A Closer Look</h2>
          <div className="gallery-masonry__divider" />
        </div>
        <div className="gallery-masonry__grid">
          {masonryImages.map((img, i) => (
            <div key={i} className="gallery-masonry__item">
              <img src={img.src} alt={img.alt} />
            </div>
          ))}
        </div>
      </section>

      {/* Social Section */}
      <section className="gallery-social">
        <div className="gallery-social__inner">
          <span className="gallery-social__label">Capturing the Moment</span>
          <h2 className="gallery-social__title">Shared Heritage</h2>
          <p className="gallery-social__desc">
            Tag your experiences with <span className="gallery-social__tag">#HotelKhalsaPunjab</span> to be featured in our seasonal journal. Join our community of travelers and connoisseurs.
          </p>
          <div className="gallery-social__thumbs">
            {['/images/photo1.jpg', '/images/photo2.jpg', '/images/photo3.jpg', '/images/photo4.jpg'].map((src, i) => (
              <div key={i} className="gallery-social__thumb">
                <img src={src} alt={`Community photo ${i + 1}`} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Gallery;
