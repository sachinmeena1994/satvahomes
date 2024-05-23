import React from "react";
import { FaXTwitter } from "react-icons/fa6";
import { BsInstagram } from "react-icons/bs";
import { FaFacebookF } from "react-icons/fa";
import { AiOutlineHome } from "react-icons/ai";
import { FaPinterest } from "react-icons/fa6";
import { FaLinkedin } from "react-icons/fa";


const Footer = () => {
  return (
    <div className="flex flex-col items-center justify-center md:flex-row md:justify-between mt-12 mb-12 mx-auto max-w-[80%]">
      <div className="footer-left flex gap-2">
        <a target="_blank" href='https://twitter.com/SatvaHomes?t=RBJwyCcuiyo90CfG-tQmeQ&s=09' className="p-3 rounded-full bg-zinc-300 hover:bg-zinc-200 duration-300">
          <FaXTwitter className="h-4 w-4" />
        </a>
        <a target="_blank" href="https://instagram.com/satvahomes?igshid=MzRlODBiNWFlZA==" className="p-3 rounded-full bg-zinc-300 hover:bg-red-300 duration-300">
          <BsInstagram className="h-4 w-4" />
        </a>
        <a target="_blank" href="https://www.facebook.com/profile.php?id=100083395065561&mibextid=ZbWKwL" className="p-3 rounded-full bg-zinc-300 hover:bg-blue-300 duration-300">
          <FaFacebookF className="h-4 w-4" />
        </a>
        <a target="_blank" href='/' className="p-3 rounded-full bg-zinc-300 hover:bg-[#056e5598] duration-300">
          <AiOutlineHome className="h-4 w-4" />
        </a>
        <a target="_blank" href="https://in.linkedin.com/company/satva-homes" className="p-3 rounded-full bg-zinc-300 hover:bg-blue-300 duration-300">
          <FaLinkedin className="h-4 w-4" />
        </a>
        <a target="_blank" href="https://pin.it/3kmvh3j" className="p-3 rounded-full bg-zinc-300 hover:bg-orange-300 duration-300">
          <FaPinterest className="h-4 w-4" />
        </a>
      </div>
      <div className="footer-right text-sm text-zinc-400 mt-5 md:mt-0">
        <h1>
          Copyright © <span>satvahomes</span> designed by ask
        </h1>
      </div>
    </div>
  );
};

export default Footer;
