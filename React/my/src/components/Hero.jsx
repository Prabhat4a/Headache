import React, { useEffect, useRef } from "react";

const Hero = () => {
  const heroContentRef = useRef(null);
  const parallaxGridRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.pageYOffset;

      // Fade out hero content
      if (heroContentRef.current) {
        const opacity = Math.max(0, 1 - scrolled / 300);
        const translate = scrolled * 0.3;
        heroContentRef.current.style.opacity = opacity;
        heroContentRef.current.style.transform = `translateY(${translate}px)`;
      }

      // Parallax effect on grid columns
      const columns = parallaxGridRef.current?.querySelectorAll(".grid-column");
      columns?.forEach((column) => {
        const speed = parseFloat(column.getAttribute("data-speed")) || 0.3;
        const yPos = -(scrolled * speed * 0.5);
        column.style.setProperty("--parallax-offset", `${yPos}px`);
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToAbout = () => {
    const aboutSection = document.getElementById("about");
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const heroImages = {
    col1: [
      { src: "/books.jpg", alt: "Books" },
      { src: "/focous.jpeg", alt: "Focus" },
      { src: "/students.jpg", alt: "Students" },
    ],
    col2: [
      { src: "/study core.jpg", alt: "Study Core" },
      { src: "/book-2.jpg", alt: "Book" },
      { src: "/coding.jpeg", alt: "Coding" },
    ],
    col3: [
      { src: "/cotation.jpeg", alt: "Now or Never" },
      { src: "/laptops.jpg", alt: "Laptops" },
      { src: "/levelup.jpeg", alt: "Level Up" },
    ],
    col4: [
      { src: "/mark.jpeg", alt: "Grades" },
      { src: "/desk.jpeg", alt: "Desk" },
      { src: "/chemistry.png", alt: "Chemistry" },
    ],
    col5: [
      { src: "/physics.png", alt: "Physics" },
      { src: "/flexing.jpg", alt: "Flexing" },
      { src: "/rocket.png", alt: "Rocket" },
    ],
  };

  return (
    <section className="hero">
      <div className="hero-content" ref={heroContentRef}>
        <div className="hero-logo-main">
          <img src="/logo.png" alt="STUVO" className="hero-logo-icon" />
          <h1 className="hero-title">STUVO5</h1>
        </div>
      </div>

      <div className="hero-images-container">
        <div className="parallax-grid" ref={parallaxGridRef}>
          <div className="grid-column col-1" data-speed="0.3">
            {heroImages.col1.map((img, idx) => (
              <div className="grid-item" key={`col1-${idx}`}>
                <img src={img.src} alt={img.alt} />
              </div>
            ))}
          </div>
          <div className="grid-column col-2" data-speed="0.5">
            {heroImages.col2.map((img, idx) => (
              <div className="grid-item" key={`col2-${idx}`}>
                <img src={img.src} alt={img.alt} />
              </div>
            ))}
          </div>
          <div className="grid-column col-3" data-speed="0.2">
            {heroImages.col3.map((img, idx) => (
              <div className="grid-item" key={`col3-${idx}`}>
                <img src={img.src} alt={img.alt} />
              </div>
            ))}
          </div>
          <div className="grid-column col-4" data-speed="0.4">
            {heroImages.col4.map((img, idx) => (
              <div className="grid-item" key={`col4-${idx}`}>
                <img src={img.src} alt={img.alt} />
              </div>
            ))}
          </div>
          <div className="grid-column col-5" data-speed="0.35">
            {heroImages.col5.map((img, idx) => (
              <div className="grid-item" key={`col5-${idx}`}>
                <img src={img.src} alt={img.alt} />
              </div>
            ))}
          </div>
        </div>
        <div className="hero-fade"></div>
      </div>

      <div
        className="scroll-indicator"
        onClick={scrollToAbout}
        style={{ cursor: "pointer" }}
      >
        <i className="bx bx-chevron-down"></i>
      </div>
    </section>
  );
};

export default Hero;
