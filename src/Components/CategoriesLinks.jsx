import React from "react";
import { Link } from "react-router-dom";

const CategoriesLinks = () => {
  return (
    <div className="mt-20 mx-3">
      <h1 className="text-[#056E55] font-bold text-center text-4xl">
        Checkout Our 100% Free Design Resource.
      </h1>
      {/* Category list */}
      <div className="xl:w-[76.5rem] mx-auto flex flex-col items-center">
        {/* <hr className="w-12 mt-6 bg-[#056E55] h-[2px]" /> */}
        <div className="flex justify-center mt-12 flex-col gap-10 md:flex-row md:flex-wrap md:gap-5 w-full">
          <Link to="/" className="w-full bg-[#0C3C30] flex-shrink-0 md:w-[17%]">
            <img
              src="https://satvahomes.com/wp-content/uploads/2024/03/WhatsApp-Image-2024-03-11-at-19.51.21-12-768x768.jpeg"
              alt=""
            />
          </Link>
          <Link to="/" className="w-full bg-[#0C3C30] flex-shrink-0 md:w-[17%]">
            <img
              src="https://satvahomes.com/wp-content/uploads/2024/03/WhatsApp-Image-2024-03-11-at-19.51.21-1024x1024.jpeg"
              alt=""
            />
          </Link>
          <Link to="/" className="w-full bg-[#0C3C30] flex-shrink-0 md:w-[17%]">
            <img
              src="https://satvahomes.com/wp-content/uploads/2024/03/WhatsApp-Image-2024-03-11-at-19.51.21-8-1024x1024.jpeg"
              alt=""
            />
          </Link>
          <Link to="/" className="w-full bg-[#0C3C30] flex-shrink-0 md:w-[17%]">
            <img
              src="https://satvahomes.com/wp-content/uploads/2024/03/WhatsApp-Image-2024-03-11-at-19.51.21-10-1024x1024.jpeg"
              alt=""
            />
          </Link>
          <Link to="/" className="w-full bg-[#0C3C30] flex-shrink-0 md:w-[17%]">
            <img
              src="https://satvahomes.com/wp-content/uploads/2024/03/WhatsApp-Image-2024-03-11-at-19.51.21-18-1024x1024.jpeg"
              alt=""
            />
          </Link>
          <Link to="/" className="w-full bg-[#0C3C30] flex-shrink-0 md:w-[17%]">
            <img
              src="https://satvahomes.com/wp-content/uploads/2024/03/WhatsApp-Image-2024-03-11-at-19.51.21-1-1024x1024.jpeg"
              alt=""
            />
          </Link>
          <Link to="/" className="w-full bg-[#0C3C30] flex-shrink-0 md:w-[17%]">
            <img
              src="https://satvahomes.com/wp-content/uploads/2024/03/WhatsApp-Image-2024-03-11-at-19.51.21-21-768x768.jpeg"
              alt=""
            />
          </Link>
          <Link to="/" className="w-full bg-[#0C3C30] flex-shrink-0 md:w-[17%]">
            <img
              src="https://satvahomes.com/wp-content/uploads/2024/03/WhatsApp-Image-2024-03-11-at-19.51.21-9-768x768.jpeg"
              alt=""
            />
          </Link>
          <Link to="/" className="w-full bg-[#0C3C30] flex-shrink-0 md:w-[17%]">
            <img
              src="https://satvahomes.com/wp-content/uploads/2024/03/WhatsApp-Image-2024-03-11-at-19.51.21-17-768x768.jpeg"
              alt=""
            />
          </Link>
          <Link to="/" className="w-full bg-[#0C3C30] flex-shrink-0 md:w-[17%]">
            <img
              src="https://satvahomes.com/wp-content/uploads/2024/03/WhatsApp-Image-2024-03-11-at-19.51.21-3-768x768.jpeg"
              alt=""
            />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CategoriesLinks;
