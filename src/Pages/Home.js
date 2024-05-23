import React from "react";
import ThreeComponent from "../Components/Hero";
import Loader from "../Components/Loader";
import CategoriesLinks from "../Components/CategoriesLinks";
import CategorySlider from "../Components/CategorySlider";

function Home() {
  return (
    <>
      <div className="bg-green-200 xl:h-[86.5vh] lg:h-[89.5vh] h-[65vw]"></div>
      <CategoriesLinks />
      <CategorySlider/>
    </>
    // <ThreeComponent/>
  );
}

export default Home;
