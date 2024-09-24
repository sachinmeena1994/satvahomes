import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { EffectFade, Navigation, Pagination, Autoplay } from "swiper/modules";

export default function App() {
  return (
    <div className="w-full h-[100%] relative overflow-hidden">
      <Swiper
        loop={true}
        spaceBetween={30}
        effect={"fade"}
        pagination={{
          clickable: true,
          dynamicBullets: true,
        }}
        modules={[EffectFade, Navigation, Pagination, Autoplay]}
        autoplay={{
          delay: 4000, // 4 seconds autoplay delay
          disableOnInteraction: false, // Autoplay continues after user interaction
        }}
        className="mySwiper w-full h-full"
        style={{
          "--swiper-pagination-color": "#000000a2", // Default color
          "--swiper-pagination-bullet-size": "11px", // Custom color
        }}
      >
        {[
          "https://satvahomes.com/wp-content/uploads/2020/07/slider5-1.jpg",
          "https://satvahomes.com/wp-content/uploads/2020/07/slider5-3.jpg",
          "https://satvahomes.com/wp-content/uploads/2020/07/slider5-2.jpg",
        ].map((imageUrl, index) => (
          <SwiperSlide key={index} className="h-[100%]">
            <img
              className="h-full w-full object-cover object-center"
              src={imageUrl}
              alt={`Slide ${index}`}
            />
            <div className="absolute z-10 left-[16%] lg:left-[18%] bottom-0 translate-y-[36%]">
              <h1 className="text-[30vw] lg:text-[24vw] tracking-tight font-light text-white">
                0{index+1}
              </h1>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Text-block */}
      <div className="absolute flex flex-col justify-start z-20 left-[6.5%] top-[12%] xs:left-[6.5%] xs:top-[12%] md:left-[6%] md:top-[9%] lg:left-[13%] lg:top-[18%]">
        <div className="flex gap-[3vw] xs:gap-[2vw] md:gap-[1vw] lg:gap-4 items-center mb-[3vw] xs:mb-[2.5vw] md:mb-[1.8vw] lg:mb-[2vw]">
          <div className="h-[9.8vw] w-[0.4vw] xs:h-[7.5vw] xs:w-[0.4vw] md:h-[5.4vw] md:w-[0.3vw] lg:h-[3.5vw] lg:w-[0.14vw] bg-black"></div>
          <h1 className="text-[3.8vw] xs:text-[2.85vw] md:text-[1.9vw] lg:text-[1.2vw] leading-[1.1] xs:leading-[1.1] md:leading-[1.1] lg:leading-[1.2]">
            Satva Homes <br />
            select
          </h1>
        </div>
        <div className="flex flex-col items-start mb-[1.5vw] xs:mb-[1.5vw] md:mb-[1.5vw] lg:mb-[1vw]">
          <h1 className="text-[2.6vw] xs:text-[1.8vw] md:text-[1.25vw] lg:text-[0.7vw] font-bold uppercase">
            Latest Style
          </h1>
          <div className="w-[8vw] h-[0.4vw] xs:h-[0.3vw] xs:w-[5.2vw] md:w-[3.4vw] md:h-[0.15vw] lg:w-[2.4vw] lg:h-[0.14vw] bg-black mt-[1.5vw] xs:mt-[0.8vw] md:mt-[1.2vw] lg:mt-[0.9vw]"></div>
        </div>

        <h1 className="text-[11vw] xs:text-[10vw] md:text-[7.4vw] lg:text-[5.1vw] -translate-x-[0.9vw] xs:-translate-x-[0.7vw] md:-translate-x-[0.7vw] lg:-translate-x-[0.4vw] font-normal leading-[1.05] xs:leading-[1.05] md:leading-[1.1] lg:leading-[1.1]">
          Free <br />
          Designs
        </h1>
      </div>
    </div>
  );
}
