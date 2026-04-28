import Hero from "../../components/common/Hero";
import Gallery from "../../pages/public/Gallery";



const Home = () => {
  return (
    <>
      <Hero/>

      <Gallery isSection={true} />
    </>
  );
};

export default Home;
