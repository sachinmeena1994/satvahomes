import React, { useRef, useState, useEffect } from "react";
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";
import { IoIosArrowBack } from "react-icons/io";
import { IoIosArrowForward } from "react-icons/io";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";

// import required modules
import { Navigation } from "swiper/modules";
import { Link } from "react-router-dom";
import { useProductCategory } from "../Context/Product-Category-Context";

export default function CategorySwiper() {
  const { categories, loading } = useProductCategory();
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const swiperRef = useRef(null);

  const categoryImages = {
    "Shoe Rack": "https://satvahomes.com/wp-content/uploads/2023/09/shoe-rack-finel-render_Scene-11.Denoiser.png",
    "TV": "https://satvahomes.com/wp-content/uploads/2023/09/TVUC01.jpg",
    "Partition Unit": "https://satvahomes.com/wp-content/uploads/2023/09/11-2.png",
    "Wall Panel": "https://satvahomes.com/wp-content/uploads/2023/09/7.png",
    "Pooja Unit": "https://satvahomes.com/wp-content/uploads/2023/09/puja-deco-render_Scene-14.png",
    "Bar Unit": "https://satvahomes.com/wp-content/uploads/2023/09/7.png",
    "Crockery Unit": "https://satvahomes.com/wp-content/uploads/2023/09/12-1.png",
    "Dressing Table Unit":"https://satvahomes.com/wp-content/uploads/2023/09/study-deco_Scene-4.png",
    "Study Table Unit":"https://satvahomes.com/wp-content/uploads/2023/09/7.png",
    "Wardobe": "https://satvahomes.com/wp-content/uploads/2023/09/WRUC01.png",
  };

  useEffect(() => {
    if (swiperRef.current) {
      swiperRef.current.params.navigation.prevEl = prevRef.current;
      swiperRef.current.params.navigation.nextEl = nextRef.current;
      swiperRef.current.navigation.init();
      swiperRef.current.navigation.update();
    }
  }, []);
  return (
    <>
      <Swiper
        spaceBetween={10}
        breakpoints={{
          // When the viewport is >= 640px wide
          768: {
            slidesPerView: 2,
            spaceBetween: 20,
          },
          // When the viewport is < 640px wide
          0: {
            slidesPerView: 1,
            spaceBetween: 10,
          },
        }}
        navigation={{
          prevEl: prevRef.current,
          nextEl: nextRef.current,
        }}
        onBeforeInit={(swiper) => {
          swiperRef.current = swiper;
        }}
        modules={[Navigation]}
        // loop={true} // Enable infinite loop
        className="mySwiper h-[100%]"
      >

          {categories.map((category,i) => (
            <SwiperSlide key={i} className="overflow-hidden border border-zinc-200">
            <Link>
              <img
                className="h-[80%] w-[100%] object-cover transition-transform duration-500 ease-in-out transform hover:scale-105"
                src={categoryImages[category]}
                alt=""
              />
              <h1 className="h-[50px] md:h-[20%] font-bold text-xl text-zinc-600 flex justify-center items-center z-2 relative bg-white">
                {category}
              </h1>
            </Link>
            </SwiperSlide>
          ))}
        {/* <SwiperSlide className="overflow-hidden border border-zinc-200">
          <Link>
            <img
              className="h-[80%] w-[100%] object-cover transition-transform duration-500 ease-in-out transform hover:scale-105"
              src="https://satvahomes.com/wp-content/uploads/2023/09/7.png"
              alt=""
            />
            <h1 className="h-[50px] md:h-[20%] font-bold text-xl text-zinc-600 flex justify-center items-center z-2 relative bg-white">
              Bar
            </h1>
          </Link>
        </SwiperSlide>
        <SwiperSlide className="overflow-hidden border border-zinc-200">
          <Link>
            <img
              className="h-[80%] w-[100%] object-cover transition-transform duration-500 ease-in-out transform hover:scale-105"
              src="https://satvahomes.com/wp-content/uploads/2023/09/7.png"
              alt=""
            />
            <h1 className="h-[50px] md:h-[20%] font-bold text-xl text-zinc-600 flex justify-center items-center z-2 relative bg-white">
              Bar
            </h1>
          </Link>
        </SwiperSlide>
        <SwiperSlide className="overflow-hidden border border-zinc-200">
          <Link>
            <img
              className="h-[80%] w-[100%] object-cover transition-transform duration-500 ease-in-out transform hover:scale-105"
              src="https://satvahomes.com/wp-content/uploads/2023/09/7.png"
              alt=""
            />
            <h1 className="h-[50px] md:h-[20%] font-bold text-xl text-zinc-600 flex justify-center items-center z-2 relative bg-white">
              Bar
            </h1>
          </Link>
        </SwiperSlide>
        <SwiperSlide className="overflow-hidden border border-zinc-200">
          <Link>
            <img
              className="h-[80%] w-[100%] object-cover transition-transform duration-500 ease-in-out transform hover:scale-105"
              src="https://satvahomes.com/wp-content/uploads/2023/09/7.png"
              alt=""
            />
            <h1 className="h-[50px] md:h-[20%] font-bold text-xl text-zinc-600 flex justify-center items-center z-2 relative bg-white">
              Bar
            </h1>
          </Link>
        </SwiperSlide>
        <SwiperSlide className="overflow-hidden border border-zinc-200">
          <Link>
            <img
              className="h-[80%] w-[100%] object-cover transition-transform duration-500 ease-in-out transform hover:scale-105"
              src="https://satvahomes.com/wp-content/uploads/2023/09/7.png"
              alt=""
            />
            <h1 className="h-[50px] md:h-[20%] font-bold text-xl text-zinc-600 flex justify-center items-center z-2 relative bg-white">
              Bar
            </h1>
          </Link>
        </SwiperSlide>
        <SwiperSlide className="overflow-hidden border border-zinc-200">
          <Link>
            <img
              className="h-[80%] w-[100%] object-cover transition-transform duration-500 ease-in-out transform hover:scale-105"
              src="https://satvahomes.com/wp-content/uploads/2023/09/7.png"
              alt=""
            />
            <h1 className="h-[50px] md:h-[20%] font-bold text-xl text-zinc-600 flex justify-center items-center z-2 relative bg-white">
              Bar
            </h1>
          </Link>
        </SwiperSlide>
        <SwiperSlide className="overflow-hidden border border-zinc-200">
          <Link>
            <img
              className="h-[80%] w-[100%] object-cover transition-transform duration-500 ease-in-out transform hover:scale-105"
              src="https://satvahomes.com/wp-content/uploads/2023/09/7.png"
              alt=""
            />
            <h1 className="h-[50px] md:h-[20%] font-bold text-xl text-zinc-600 flex justify-center items-center z-2 relative bg-white">
              Bar
            </h1>
          </Link>
        </SwiperSlide>
        <SwiperSlide className="overflow-hidden border border-zinc-200">
          <Link>
            <img
              className="h-[80%] w-[100%] object-cover transition-transform duration-500 ease-in-out transform hover:scale-105"
              src="https://satvahomes.com/wp-content/uploads/2023/09/7.png"
              alt=""
            />
            <h1 className="h-[50px] md:h-[20%] font-bold text-xl text-zinc-600 flex justify-center items-center z-2 relative bg-white">
              Bar
            </h1>
          </Link>
        </SwiperSlide>
        <SwiperSlide className="overflow-hidden border border-zinc-200">
          <Link>
            <img
              className="h-[80%] w-[100%] object-cover transition-transform duration-500 ease-in-out transform hover:scale-105"
              src="https://satvahomes.com/wp-content/uploads/2023/09/7.png"
              alt=""
            />
            <h1 className="h-[50px] md:h-[20%] font-bold text-xl text-zinc-600 flex justify-center items-center z-2 relative bg-white">
              Bar
            </h1>
          </Link>
        </SwiperSlide> */}
      </Swiper>
      <div className="absolute top-[45%] transform -translate-x-1/2 -translate-y-1/2 left-0 z-10">
        <button
          ref={prevRef}
          className="bg-[#056D55] flex items-center justify-center rounded-full text-white p-2"
        >
          <IoIosArrowBack className="w-5 h-5" />
        </button>
      </div>
      <div className="absolute top-[45%] transform translate-x-1/2 -translate-y-1/2 right-0 z-10">
        <button
          ref={nextRef}
          className="bg-[#056D55] flex items-center justify-center rounded-full text-white p-2"
        >
          <IoIosArrowForward className="w-5 h-5" />
        </button>
      </div>
    </>
  );
}
