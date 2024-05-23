import React, { useState, useEffect } from "react";
import { FaUser } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { RxHamburgerMenu } from "react-icons/rx";
import { PiBag } from "react-icons/pi";
import { IoIosHeartEmpty } from "react-icons/io";
import { GoSearch } from "react-icons/go";
import { IoArrowForwardCircleOutline } from "react-icons/io5";
import { IoIosArrowDown } from "react-icons/io";
import { GrUserAdmin } from "react-icons/gr";

import { getFirestore, collection, getDocs } from "firebase/firestore";

function Testheader() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    // Function to fetch product categories from Firestore
    const fetchCategories = async () => {
      const db = getFirestore();
      const categoriesCollection = collection(db, "products");
      const categoriesSnapshot = await getDocs(categoriesCollection);
      const categoriesData = categoriesSnapshot.docs.map((doc) => doc.id);
      setCategories(categoriesData);
    };

    fetchCategories();
  }, []);

  const handleCategoryChange = (e) => {
    const selectedCategory = e.target.value;
    if (selectedCategory) {
      navigate(`/product-category/${selectedCategory}`);
    }
  };

  return (
    <header className="bg-white">
      <div className=" mx-auto text-white px-4 py-5 2xl:px-14 xl:py-8 flex justify-between lg:justify-start items-center relative">
        {/* Burger Menu */}
        <div className="lg:hidden">
          <RxHamburgerMenu className="text-2xl text-zinc-500 " />
        </div>

        {/* Logo */}
        <div>
          <Link to="/">
            <img
              className="h-10 object-cover"
              src="/images/logo-bgTransparent.png"
              alt="Satva Homes"
            ></img>
          </Link>
        </div>

        {/* Links */}
        <div className="hidden ml-32 xl:ml-[5vw] lg:flex lg:items-center text-black text-[18px] gap-6 2xl:gap-10 font-medium">
          <Link className="hover:text-[#056E55] duration-200" to="/">
            Faq
          </Link>
          <Link className="hover:text-[#056E55] duration-200" to="/">
            About
          </Link>
          <Link className="hover:text-[#056E55] duration-200" to="/">
            Contact
          </Link>
        </div>

        {/* Search */}

        {/* {Buttons} */}
        <div className="lg:absolute lg:right-0 2xl:mr-16 lg:mr-5 flex items-center gap-4">
          <div className="hidden relative border-[1px] min-w-[10vw] py-3 border-zinc-300 rounded xl:flex justify-center xl:ml-[25vw] items-center px-3 pl-4">
            <div className="text-zinc-500 text-sm justify-between flex items-center gap-3">
              <h1 className="hover:text-[#056E55] font-semibold cursor-pointer duration-200">
                All Category
              </h1>
              <IoIosArrowDown className="mt-1" />
            </div>
            <div className="hidden min-w-[12vw] rounded h-52 z-20 absolute bg-red-100 top-16">

            </div>

          </div>
          <Link to="/">
            <GrUserAdmin className="hidden hover:text-[#056E55] duration-200 lg:hidden text-zinc-900 text-2xl" />
          </Link>
          <GoSearch className="hidden lg:block xl:hidden text-zinc-900 text-2xl" />
          <Link
            to="/"
            className="hidden text-zinc-900 hover:text-[#056E55] duration-200 lg:flex lg:gap-[2px] lg:items-center"
          >
            <IoArrowForwardCircleOutline className=" text-2xl" />
            <h1 className=" text-md mb-[1px]">Login</h1>
          </Link>
          <Link to="/">
            <IoIosHeartEmpty className="hidden hover:text-[#056E55] duration-200 lg:block text-zinc-900 text-2xl" />
          </Link>
          <Link to="/" className="relative">
            <PiBag className="text-zinc-900 text-2xl hover:text-[#056E55] duration-200" />
            <div className="absolute -top-[50%] -right-[40%] px-2 py-[1px] rounded-full bg-green-800 flex items-center">
              <h1 className="flex items-center text-[0.6rem]">0</h1>
            </div>
          </Link>
        </div>
      </div>
      <hr className="bg-zinc-200 border-none h-[1px]" />
    </header>
  );
}

export default Testheader;
