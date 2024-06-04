import React from "react";
import TraverseNav from "../Components/TraverseNav";
import { useLocation } from "react-router-dom";
import { FaXTwitter } from "react-icons/fa6";
import { BsInstagram } from "react-icons/bs";
import { FaFacebookF } from "react-icons/fa";
import { AiOutlineHome } from "react-icons/ai";
import { FaPinterest } from "react-icons/fa6";
import { FaLinkedin } from "react-icons/fa";

const Contact = () => {
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
      <div className="min-h-screen bg-white border-b pt-12 flex flex-col items-center">
        <div className="w-full gap-4 flex flex-col lg:flex-row max-w-[88rem] mx-auto px-4">
          <div className="address-div lg:w-[33%] border-2 border-black pl-8 pt-16 pr-14 pb-32">
            <h1 className="font-bold text-sm mb-1 text-[#A3A3B8]">
              SATVA HOMES
            </h1>
            <h1 className="font-bold text-4xl text-[#056E55]">
              Get in touch !
            </h1>
            <div className="bg-[#FF8C34] mt-7 mb-6 h-[1.5px] w-12"></div>

            <p className="text-sm text-zinc-500">
              Penthouse, 7-21, Sri Krishna Devaraya Colony, S VIJAYA NILAYAM,
              Sri Durga Colony, Madeenaguda, Hyderabad, Telangana 500049
              <br />
              <br />
              <br />
              <span className="text-black">
                Email: satvahomes8@gmail.com <br />
                Ph: 6262537375 , 9032297144
              </span>
            </p>
            <h1 className="font-bold mt-4 border-b pb-3 border-[#056E55] w-fit text-xs text-[#056E55]">
              FOLLOW US
            </h1>
            {/* Links */}
            <div className="footer-left mt-10 flex gap-2">
              <a
                target="_blank"
                href="https://twitter.com/SatvaHomes?t=RBJwyCcuiyo90CfG-tQmeQ&s=09"
                className="p-3 rounded-full bg-white border border-black hover:bg-zinc-200 duration-300"
              >
                <FaXTwitter className="h-4 w-4" />
              </a>
              <a
                target="_blank"
                href="https://instagram.com/satvahomes?igshid=MzRlODBiNWFlZA=="
                className="p-3 rounded-full bg-white border border-black hover:bg-red-300 duration-300"
              >
                <BsInstagram className="h-4 w-4" />
              </a>
              <a
                target="_blank"
                href="https://www.facebook.com/profile.php?id=100083395065561&mibextid=ZbWKwL"
                className="p-3 rounded-full bg-white border border-black hover:bg-blue-300 duration-300"
              >
                <FaFacebookF className="h-4 w-4" />
              </a>
              <a
                target="_blank"
                href="https://satvahomes.com"
                className="p-3 rounded-full bg-white border border-black hover:bg-[#056e5598] duration-300"
              >
                <AiOutlineHome className="h-4 w-4" />
              </a>
              <a
                target="_blank"
                href="https://in.linkedin.com/company/satva-homes"
                className="p-3 rounded-full bg-white border border-black hover:bg-blue-300 duration-300"
              >
                <FaLinkedin className="h-4 w-4" />
              </a>
              <a
                target="_blank"
                href="https://pin.it/3kmvh3j"
                className="p-3 rounded-full bg-white border border-black hover:bg-orange-300 duration-300"
              >
                <FaPinterest className="h-4 w-4" />
              </a>
            </div>
          </div>
          <div className="map-div lg:w-[67%]">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d487083.0066007439!2d78.13091015625!3d17.49146750000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb91bd4f80fb9b%3A0x779ca94e24738b51!2sSatva%20Homes%20Interior%20Design%20Studio!5e0!3m2!1sen!2sus!4v1717468917139!5m2!1sen!2sus"
              className="w-full min-h-[34rem] h-full"
              frameBorder="0"
              allowFullScreen=""
              aria-hidden="false"
              tabIndex="0"
            ></iframe>
          </div>
        </div>
        <div className="contact-form-div w-full max-w-[90vw] xs:max-w-[70vw] md:max-w-[60vw] lg:max-w-[50vw] xl:max-w-[40vw] my-20">
          <div className="flex mb-12 flex-col gap-4 items-center">
            <h1 className="text-center font-semibold text-4xl text-[#056E55]">
              Have an question ? Contact us !
            </h1>
            <div className="bg-[#056E55] h-[2px] w-12"></div>
          </div>
          <form action="#" class="space-y-8 w-full">
            <div>
              <label
                for="name"
                class="block mb-2 text-sm font-medium text-zinc-700 dark:text-gray-300"
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 dark:shadow-sm-light outline-none"
                placeholder="your name"
                required
              />
            </div>
            <div>
              <label
                for="email"
                class="block mb-2 text-sm font-medium text-zinc-700 dark:text-gray-300"
              >
                Your email
              </label>
              <input
                type="email"
                id="email"
                class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 dark:shadow-sm-light outline-none"
                placeholder="name@flowbite.com"
                required
              />
            </div>
            <div>
              <label
                for="subject"
                class="block mb-2 text-sm font-medium text-zinc-700 dark:text-gray-300"
              >
                Subject
              </label>
              <input
                type="text"
                id="subject"
                class="block p-3 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 dark:shadow-sm-light outline-none"
                placeholder="Let us know how we can help you"
                required
              />
            </div>
            <div class="sm:col-span-2">
              <label
                for="message"
                class="block mb-2 text-sm font-medium text-zinc-700 dark:text-gray-400"
              >
                Your message ( optional )
              </label>
              <textarea
                id="message"
                rows="6"
                class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg shadow-sm border border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 resize-none outline-none"
                placeholder="Leave a comment..."
              ></textarea>
            </div>
            <button
              type="submit"
              class="py-3 px-5 text-sm font-medium text-center bg-[#056E55] text-white rounded-lg bg-primary-700 sm:w-fit hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 outline-none"
            >
              Send message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
