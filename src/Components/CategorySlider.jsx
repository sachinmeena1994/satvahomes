import React from "react";
import { Link } from "react-router-dom";
import { MdArrowRight } from "react-icons/md";
import CategorySwiper from "./CategorySwiper";

const CategorySlider = () => {
  return (
    <div className="mt-10 gap-10 lg:gap-0 mb-20 xl:w-[76.5rem] mx-auto flex flex-col lg:items-center lg:flex-row lg:px-14 px-4">
      <div className="CategorySlideText lg:w-[25%] whitespace-wrap flex flex-col items-start">
        <h1 className="text-[#056E55] font-bold text-4xl">
          Download <br /> by categories
        </h1>
        <hr className="w-12 mt-8 bg-[#056E55] h-[2px]" />
        <div className="mt-8 flex text-zinc-500 gap-8">
          <svg
            className="w-12 h-12 text-[#056E55]"
            xmlns="http://www.w3.org/2000/svg"
            id="Capa_1"
            height="512"
            viewBox="0 0 512 512"
            width="512"
          >
            <g>
              <path d="m492 235.999h-21.519v-118.759c0-64.647-52.593-117.24-117.24-117.24h-194.482c-64.647 0-117.24 52.593-117.24 117.24v118.759h-21.519c-11.046 0-20 8.954-20 20v155.999c0 11.046 8.954 20 20 20h88.606l-26.358 50.787c-5.088 9.804-1.265 21.876 8.539 26.964 9.761 5.067 21.854 1.307 26.965-8.539l35.92-69.213h204.656l35.92 69.213c5.112 9.85 17.205 13.604 26.965 8.539 9.804-5.088 13.627-17.16 8.539-26.964l-26.358-50.787h88.606c11.046 0 20-8.954 20-20v-155.999c0-11.046-8.954-20-20-20zm-410.481-118.759c0-42.59 34.649-77.24 77.24-77.24h194.482c42.591 0 77.24 34.65 77.24 77.24v118.759h-18.481c-11.046 0-20 8.954-20 20v56h-272v-56c0-11.046-8.954-20-20-20h-18.481zm390.481 274.758c-52.382 0-377.882 0-432 0v-116h40v56c0 11.046 8.954 20 20 20h312c11.046 0 20-8.954 20-20v-56h40z"></path>
            </g>
          </svg>
          <h1>
            200 +<br />
            Unique designs
          </h1>
        </div>
        <div className="mt-12 hover:text-[#FF6F00] duration-300">
          <Link to="/" className="text-xs flex items-center gap-2 font-bold">
            <h1>ALL CATEGORIES</h1>
            <MdArrowRight className="text-lg" />
          </Link>
          <hr className="pr-5 mt-2 w-[94%] border-none h-[0.5px] hover:bg-[#FF6F00] bg-black" />
        </div>
      </div>
      <div className="mx-2 SlideCategory relative h-full md:h-[30vw] lg:h-[18vw] lg:w-[75%]">
        <CategorySwiper />
      </div>
    </div>
  );
};

export default CategorySlider;
