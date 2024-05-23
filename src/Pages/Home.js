import React from "react";
import ThreeComponent from "../Components/Hero";
import Loader from "../Components/Loader";
import CategoriesLinks from "../Components/CategoriesLinks";
import CategorySlider from "../Components/CategorySlider";
import ContactUs from "../Components/ContactUs";

function Home() {
  return (
    <>
      <div className="bg-green-200 xl:h-[86.5vh] lg:h-[89.5vh] sm:h-[68.5vw] h-[85vw]"></div>
      <CategoriesLinks />
      <CategorySlider/>
      <ContactUs/>
    </>
    // <ThreeComponent/>
  );
}

export default Home;
