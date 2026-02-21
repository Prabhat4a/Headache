import React from "react";
import { Link } from "react-router-dom";

const Creators = () => {
  const creators = [
    {
      name: "Prabhat Kumar Behera",
      role: "Frontend Developer",
      image: "/prabhat.jpg",
      socials: {
        instagram: "https://www.instagram.com/prabhat4a/",
        github: "https://github.com/Prabhat4a",
        linkedin: "https://www.linkedin.com/in/prabhat-kumar-behera-a806a3363/",
      },
    },
    {
      name: "Jitu Senapati",
      role: "UI/UX Designer",
      image: "/jitu.jpeg",
      socials: {
        instagram: "#",
        github: "https://github.com/JituSenapati",
        linkedin: "https://www.linkedin.com/in/jitu-senapati-702854363/",
      },
    },
    {
      name: "N.Eswar Sunny",
      role: "Backend Developer",
      image: "/Sunny.jpg",
      socials: {
        instagram: "https://www.instagram.com/the_e_square_/",
        github: "https://github.com/NESWAR-SUNNY",
        linkedin: "https://www.linkedin.com/in/n-eswar-sunny-483a1937b/",
      },
    },
    {
      name: "Aryan Kumar Rajak",
      role: "Content Strategist",
      image: "/Aryan.jpg",
      socials: {
        instagram: "https://www.instagram.com/aryan_kumar_rajak/",
        github: "https://github.com/AryanKumarRajak",
        linkedin: "https://www.linkedin.com/in/aryan-kumar-rajak-702854363/",
      },
    },
    {
      name: "Sudhansu Sekhara Sunani",
      role: "Marketing Lead",
      image: "/sudhansu.jpeg",
      socials: {
        instagram:
          "https://www.instagram.com/sudhansu_sudhansu_sekhara_sunani/",
        github: "https://github.com/Sudhansu-Sekhara-Sunani",
        linkedin:
          "https://www.linkedin.com/in/sudhansu-sudhansu-sekhara-sunani-702854363/",
      },
    },
  ];

  const firstRow = creators.slice(0, 3);
  const secondRow = creators.slice(3, 5);

  const CreatorCard = ({ creator }) => (
    <div className="creator-card">
      <div className="creator-image">
        <img src={creator.image} alt={creator.name} />
      </div>
      <h3 className="creator-name">{creator.name}</h3>
      <p className="creator-role">{creator.role}</p>
      <div className="creator-socials">
        <a
          href={creator.socials.instagram}
          className="social-link"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
        >
          <i className="bx bxl-instagram"></i>
        </a>
        <a
          href={creator.socials.github}
          className="social-link"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
        >
          <i className="bx bxl-github"></i>
        </a>
        <a
          href={creator.socials.linkedin}
          className="social-link"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
        >
          <i className="bx bxl-linkedin"></i>
        </a>
        <a href="#" className="social-link" aria-label="STUVO">
          <img src="/logo.png" alt="STUVO" />
        </a>
      </div>
    </div>
  );

  return (
    <section className="creators-section" id="creators">
      <h2 className="creators-title">Meet the Creators</h2>

      <div className="creators-wrapper">
        <div className="creators-row">
          {firstRow.map((creator, index) => (
            <CreatorCard creator={creator} key={index} />
          ))}
        </div>

        <div className="creators-row second">
          {secondRow.map((creator, index) => (
            <CreatorCard creator={creator} key={index} />
          ))}
        </div>
      </div>

      <div className="cta-section">
        <h3 className="cta-title">
          Create your account and experience STUVO5 for yourself
        </h3>
        <Link to="/register" className="cta-button">
          Join STUVO5
        </Link>
      </div>
    </section>
  );
};

export default Creators;
