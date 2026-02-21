import React from "react";
import "../styles/Home.css";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import About from "../components/About";
import Creators from "../components/Creators";
import Footer from "../components/Footer";

const Home = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        background: "#050505",
      }}
    >
      <Navbar />
      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Hero />
        <About />
        <Creators />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
