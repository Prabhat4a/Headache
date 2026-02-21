import { useNavigate } from "react-router-dom";

// Creators Section Component
function Creators() {
  const navigate = useNavigate();

  const handleRegisterClick = () => {
    navigate("/register");
  };

  return (
    <section className="creators-section" id="creators">
      <h2 className="creators-title">Meet the Creators</h2>

      <div className="creators-wrapper">
        {/* First Row */}
        <div className="creators-row">
          {/* Creator 1 */}
          <div className="creator-card">
            <div className="creator-image">
              <img src="/prabhat.jpg" alt="Prabhat Kumar Behera" />
            </div>
            <h3 className="creator-name">Prabhat Kumar Behera</h3>
            <p className="creator-role">Frontend Developer</p>

            <div className="creator-socials">
              <a
                href="https://www.instagram.com/prabhat4a/"
                className="social-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="bx bxl-instagram"></i>
              </a>
              <a
                href="https://github.com/Prabhat4a"
                className="social-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="bx bxl-github"></i>
              </a>
              <a
                href="https://www.linkedin.com/in/prabhat-kumar-behera-a806a3363/"
                className="social-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="bx bxl-linkedin"></i>
              </a>
              <a href="#" className="social-link">
                <img src="/logo.png" alt="STUVO" />
              </a>
            </div>
          </div>

          {/* Creator 2 */}
          <div className="creator-card">
            <div className="creator-image">
              <img src="/jitu.jpeg" alt="Jitu Senapati" />
            </div>
            <h3 className="creator-name">Jitu Senapati</h3>
            <p className="creator-role">UI/UX Designer</p>

            <div className="creator-socials">
              <a href="#" className="social-link">
                <i className="bx bxl-instagram"></i>
              </a>
              <a
                href="https://github.com/JituSenapati"
                className="social-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="bx bxl-github"></i>
              </a>
              <a
                href="https://www.linkedin.com/in/jitu-senapati-702854363/"
                className="social-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="bx bxl-linkedin"></i>
              </a>
              <a href="#" className="social-link">
                <img src="/logo.png" alt="STUVO" />
              </a>
            </div>
          </div>

          {/* Creator 3 */}
          <div className="creator-card">
            <div className="creator-image">
              <img src="/Sunny.jpg" alt="N Eswar Sunny" />
            </div>
            <h3 className="creator-name">N. Eswar Sunny</h3>
            <p className="creator-role">Backend Developer</p>

            <div className="creator-socials">
              <a
                href="https://www.instagram.com/the_e_square_/"
                className="social-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="bx bxl-instagram"></i>
              </a>
              <a
                href="https://github.com/NESWAR-SUNNY"
                className="social-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="bx bxl-github"></i>
              </a>
              <a
                href="https://www.linkedin.com/in/n-eswar-sunny-483a1937b/"
                className="social-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="bx bxl-linkedin"></i>
              </a>
              <a href="#" className="social-link">
                <img src="/logo.png" alt="STUVO" />
              </a>
            </div>
          </div>
        </div>

        {/* Second Row */}
        <div className="creators-row second">
          {/* Creator 4 */}
          <div className="creator-card">
            <div className="creator-image">
              <img src="/Aryan.jpg" alt="Aryan Kumar Rajak" />
            </div>
            <h3 className="creator-name">Aryan Kumar Rajak</h3>
            <p className="creator-role">Content Strategist</p>

            <div className="creator-socials">
              <a
                href="https://www.instagram.com/aryan_kumar_rajak/"
                className="social-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="bx bxl-instagram"></i>
              </a>
              <a
                href="https://github.com/AryanKumarRajak"
                className="social-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="bx bxl-github"></i>
              </a>
              <a
                href="https://www.linkedin.com/in/aryan-kumar-rajak-702854363/"
                className="social-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="bx bxl-linkedin"></i>
              </a>
              <a href="#" className="social-link">
                <img src="/logo.png" alt="STUVO" />
              </a>
            </div>
          </div>

          {/* Creator 5 */}
          <div className="creator-card">
            <div className="creator-image">
              <img src="/sudhansu.jpeg" alt="Sudhansu Sekhara Sunani" />
            </div>
            <h3 className="creator-name">Sudhansu Sekhara Sunani</h3>
            <p className="creator-role">Marketing Lead</p>

            <div className="creator-socials">
              <a
                href="https://www.instagram.com/sudhansu_sudhansu_sekhara_sunani/"
                className="social-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="bx bxl-instagram"></i>
              </a>
              <a
                href="https://github.com/Sudhansu-Sekhara-Sunani"
                className="social-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="bx bxl-github"></i>
              </a>
              <a
                href="https://www.linkedin.com/in/sudhansu-sudhansu-sekhara-sunani-702854363/"
                className="social-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="bx bxl-linkedin"></i>
              </a>
              <a href="#" className="social-link">
                <img src="/logo.png" alt="STUVO" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Call To Action */}
      <div className="cta-section">
        <h3 className="cta-title">
          Create your account and experience STUVO5 for yourself
        </h3>
        <button className="cta-button" onClick={handleRegisterClick}>
          Join STUVO5
        </button>
      </div>
    </section>
  );
}

export default Creators;
