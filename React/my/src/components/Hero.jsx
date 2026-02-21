import { useEffect } from "react";

function Hero() {
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const heroContent = document.querySelector(".hero-content");

      if (heroContent) {
        const opacity = Math.max(0, 1 - scrolled / 300);
        const translate = scrolled * 0.3;
        heroContent.style.opacity = opacity;
        heroContent.style.transform = `translateY(${translate}px)`;
      }

      const parallaxElements = document.querySelectorAll(".grid-column");
      parallaxElements.forEach((column) => {
        const speed = parseFloat(column.getAttribute("data-speed")) || 0.3;
        const yPos = -(scrolled * speed * 0.5);
        column.style.setProperty("--parallax-offset", `${yPos}px`);
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="hero">
      {/* Hero Top Content */}
      <div className="hero-content">
        <div className="hero-logo-main">
          <img src="/logo.png" alt="STUVO" className="hero-logo-icon" />
          <h1 className="hero-title">STUVO5</h1>
        </div>
      </div>

      {/* Hero Images Grid */}
      <div className="hero-images-container">
        <div className="parallax-grid">
          <div className="grid-column col-1" data-speed="0.3">
            <div className="grid-item">
              <img src="/books.jpg" alt="Books" />
            </div>
            <div className="grid-item">
              <img src="/focous.jpeg" alt="Focus" />
            </div>
            <div className="grid-item">
              <img src="/students.jpg" alt="Students" />
            </div>
          </div>

          <div className="grid-column col-2" data-speed="0.5">
            <div className="grid-item">
              <img src="/study core.jpg" alt="Study Core" />
            </div>
            <div className="grid-item">
              <img src="/book-2.jpg" alt="Book" />
            </div>
            <div className="grid-item">
              <img src="/coding.jpeg" alt="Coding" />
            </div>
          </div>

          <div className="grid-column col-3" data-speed="0.2">
            <div className="grid-item">
              <img src="/cotation.jpeg" alt="Now or Never" />
            </div>
            <div className="grid-item">
              <img src="/laptops.jpg" alt="Laptops" />
            </div>
            <div className="grid-item">
              <img src="/levelup.jpeg" alt="Level Up" />
            </div>
          </div>

          <div className="grid-column col-4" data-speed="0.4">
            <div className="grid-item">
              <img src="/mark.jpeg" alt="Grades" />
            </div>
            <div className="grid-item">
              <img src="/desk.jpeg" alt="Desk" />
            </div>
            <div className="grid-item">
              <img src="/chemistry.png" alt="Study" />
            </div>
          </div>

          <div className="grid-column col-5" data-speed="0.35">
            <div className="grid-item">
              <img src="/physics.png" alt="Library" />
            </div>
            <div className="grid-item">
              <img src="/flexing.jpg" alt="Coding" />
            </div>
            <div className="grid-item">
              <img src="/rocket.png" alt="Focus" />
            </div>
          </div>
        </div>

        <div className="hero-fade"></div>
      </div>
      {/* Hero Images Grid 
        <div className="scroll-indicator">
          <i className="bx bx-chevron-down"></i>
        </div>*/}
    </section>
  );
}

export default Hero;
