import React from "react";
import { Link } from "react-router-dom";
import { MdArrowForwardIos } from "react-icons/md";

const TraverseNav = ({ pathname }) => {
  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  return (
    <div className="bg-transparent h-[30vh] gap-5 flex flex-col items-center justify-center">
      <h1 className="text-white text-center text-5xl font-semibold">{capitalizeFirstLetter(pathname)}</h1>
      <div className="flex items-center gap-3">
        <Link to='/' className="text-lg hover:text-white duration-300 text-zinc-100">Home </Link>
        <MdArrowForwardIos className="text-xs text-zinc-100"/>
        <h1 className="select-none text-lg font-normal text-white">{capitalizeFirstLetter(pathname)}</h1>
      </div>
    </div>
  );
};

export default TraverseNav;
