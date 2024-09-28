import React from "react";
import TraverseNav from "../Components/TraverseNav";
import { useLocation } from "react-router-dom";

const About = () => {
  const location = useLocation();
  const path = location.pathname.substring(1);

  return (
    <div
      style={{
        backgroundImage: "url('/images/bgCommonImageFaqContact.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <TraverseNav pathname={path} />
      <div className="min-h-screen bg-white pt-12 pb-24 flex flex-col items-center">
        <div className="w-full max-w-6xl mx-auto px-4">
          <img
            className="w-full object-cover object-center hover:opacity-[76%] duration-500"
            src="/images/aboutimg1.jpg"
            alt=""
          />
        </div>
        <div className="flex mt-24 md:gap-10 gap-10 flex-col md:flex-row w-full max-w-6xl mx-auto px-4">
          <div className="left-text w-full md:w-[60%]">
            <h1 className="text-[#FF6F00]">WE DESIGNED IT FOR FUTURE</h1>
            <h1 className="text-[#056E55] my-4 text-4xl font-bold">
              About Satva Homes
            </h1>
            <div className="bg-[#CFCFCF] mt-6 mb-6 h-[2px] w-12"></div>
            <p className="text-sm text-justify text-zinc-500">
              At Satva Homes, we believe that the pursuit of beautiful and
              functional interior design should be an inclusive journey for all.
              Our main motto is simple yet profound: access to design should be
              free for everyone. <br />
              <br /> <b>Our Mission:</b> Satva Homes is on a mission to
              democratize interior design by making it accessible to every
              stratum of society. We envision a world where distinctive and
              aesthetically pleasing homes are within reach for individuals from
              all walks of life. <br />
              <br />
              <b>Free Access to Design:</b> Central to our ethos is the firm
              belief that everyone deserves access to high-quality interior
              designs without barriers. We understand that a well-designed space
              enhances the quality of life, and we are committed to making this
              enhancement universally available.
              <br />
              <br />
              <b className="text-lg text-zinc-600">What Sets Us Apart:</b>
              <br />
              <br />
              <b>Comprehensive Designs:</b> Satva Homes offers meticulously
              crafted interior designs, ranging from shoe racks and TV units to
              bar counters and wardrobes. <br />
              <br />
              <b>PDFs for All:</b> Our designs are compiled into comprehensive
              PDFs, which are provided to our customers at no cost. We firmly
              believe that the creative process should be open and accessible to
              all, irrespective of budget constraints. <br />
              <br />
              <b>Inclusive Information:</b> Within our PDFs, you’ll find a
              wealth of valuable information, including detailed material
              specifications, immersive 3D renders, and written and visual
              depictions of construction steps. Additionally, our PDFs feature
              an extensive directory of reputable vendors and skilled laborers,
              ensuring a holistic resource for your interior design endeavors.{" "}
              <br />
              <br />
              <b>Your Design Journey Begins Here:</b> Whether you’re a
              homeowner, a design enthusiast, or someone embarking on their
              first interior design project, Satva Homes is your partner in
              creating distinctive and personalized living spaces. Explore our
              designs, download our PDFs, and embark on a design journey that’s
              open and accessible to everyone. <br />
              <br />
              Welcome to Satva Homes, where the beauty of design knows no
              boundaries.
            </p>
          </div>
          <div className="md:mt-3 mt-0 md:[40%]">
            <img
              className="object-cover "
              src="/images/aboutimg2.jpg"
              alt=""
            />
          </div>
        </div>
      </div>
      <hr />
    </div>
  );
};

export default About;
