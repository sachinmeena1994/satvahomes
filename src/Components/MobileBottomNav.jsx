import React from "react";
import { CiShop } from "react-icons/ci";
import { Link } from "react-router-dom";
import { BsPerson } from "react-icons/bs";
import { CiMail } from "react-icons/ci";

const MobileBottomNav = () => {
  const shadowStyle = {
    boxShadow:
      "0 -4px 15px rgba(0, 0, 0, 0.07), 0 -2px 5px rgba(0, 0, 0, 0.03)",
    zIndex: 10,
  };

  return (
    <div
      style={shadowStyle}
      className="flex shadow-2xl shadow-gray-500 bottom-0 bg-white fixed md:hidden justify-between px-[14%] items-center w-[100%] mx-auto py-2"
    >
      <Link className="text-3xl">
        <CiShop></CiShop>
      </Link>
      <Link className="text-3xl">
        <BsPerson></BsPerson>
      </Link>
      <Link className="text-3xl">
        <CiMail></CiMail>
      </Link>
    </div>
  );
};

export default MobileBottomNav;
