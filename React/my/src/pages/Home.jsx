import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import About from "../components/About";
import Creators from "../components/Creators";
import Footer from "../components/Footer";
import "../styles/Home.css";

function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <About />
      <Creators />
      <Footer />
    </>
  );
}

export default Home;
