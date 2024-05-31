import React, { useState, useEffect } from "react";
import { FaUser } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { RxHamburgerMenu } from "react-icons/rx";
import { PiBag } from "react-icons/pi";
import { IoIosHeartEmpty } from "react-icons/io";
import { GoSearch } from "react-icons/go";
import { IoArrowForwardCircleOutline } from "react-icons/io5";
import { IoIosArrowDown } from "react-icons/io";
import { RxPerson } from "react-icons/rx";

import { getFirestore, collection, getDocs } from "firebase/firestore";

function Testheader() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

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
        {/* <div className="lg:hidden">
          <RxHamburgerMenu className="text-2xl text-zinc-500 " />
        </div> */}
        <button
          onClick={toggleMenu}
          className="flex z-40 lg:hidden flex-col items-center justify-center w-fit h-fit space-y-[5px]"
        >
          <div
            className={`h-[1.3px] w-5 bg-black transition-transform duration-300 ease-in-out ${
              isOpen ? "transform rotate-45 translate-y-[7px]" : ""
            }`}
          />
          <div
            className={`h-[1.3px] w-5 bg-black transition-opacity duration-300 ease-in-out ${
              isOpen ? "opacity-0" : "opacity-100"
            }`}
          />
          <div
            className={`h-[1.3px] w-5 bg-black transition-transform duration-300 ease-in-out ${
              isOpen ? "transform -rotate-45 -translate-y-[6px]" : ""
            }`}
          />
        </button>
        <aside
          className={`lg:hidden fixed z-30 top-0 left-0 w-72 h-full bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="p-4 mt-16">
            <nav className="mt-4 flex flex-col items-center">
              <Link
                href="#"
                className="block text-3xl font-semibold px-4 py-2 text-gray-700 hover:text-[#056E55] duration-300"
              >
                Home
              </Link>
              <Link
                href="#"
                className="block text-3xl font-semibold px-4 py-2 text-gray-700 hover:text-[#056E55] duration-300"
              >
                About
              </Link>
              <Link
                href="#"
                className="block text-3xl font-semibold px-4 py-2 text-gray-700 hover:text-[#056E55] duration-300"
              >
                Contact
              </Link>
            </nav>
          </div>
        </aside>

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
          <Link to="/">
            <RxPerson className="block hover:text-[#056E55] duration-200 md:hidden text-zinc-900 text-2xl" />
          </Link>

          <Link
            to="/login"
            className="hidden hover:text-zinc-100 hover:bg-[#056E55] bg-zinc-200 px-3 py-[10px] rounded-md text-[#056E55] duration-200 md:flex lg:gap-[2px] lg:items-center"
          >
            <IoArrowForwardCircleOutline className=" text-2xl" />
            <h1 className=" text-md mb-[1px] font-semibold">Login</h1>
          </Link>
          {/* Category Dropdown */}
          <div className=" border hidden lg:flex text-zinc-200 bg-[#0e6d55] rounded-md text-sm justify-between items-center gap-3">
            <select
              className="outline-none bg-transparent uppercase rounded font-bold text-sm p-3 mr-4"
              name="categories"
              id="categories"
              onChange={handleCategoryChange}
              value={selectedCategory}
            >
              <option className="text-zinc-500" value="">
                Select a category
              </option>
              {categories.map((category) => (
                <option
                  className="text-zinc-500"
                  key={category}
                  value={category}
                >
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <hr className="bg-zinc-200 border-none h-[1px]" />
    </header>
  );
}

export default Testheader;
