import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { RxHamburgerMenu, RxPerson } from "react-icons/rx";
import { IoArrowForwardCircleOutline } from "react-icons/io5";
import { useProductCategory } from "../Context/Product-Category-Context"; // Adjust the path as needed
import { auth } from "../firebase-config"; // Ensure you have Firebase auth configured
import { useUser } from "../Context/Current-User-Context";
import { BsPersonCircle } from "react-icons/bs";

const Testheader = () => {
  const { categories, loading } = useProductCategory();
  const [selectedCategory, setSelectedCategory] = useState("");
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, userDetails, load } = useUser();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleCategoryChange = (e) => {
    const selectedCategory = e.target.value;
    if (selectedCategory) {
      navigate(`/product-category/${selectedCategory}`);
    }
  };

  const handleLogout = () => {
    auth.signOut().then(() => {
      navigate("/login");
    });
  };

  return (
    <header className="bg-white">
      <div className="mx-auto text-white px-4 py-5 2xl:px-14 xl:py-8 flex justify-between lg:justify-start items-center relative">
        {/* Burger Menu */}
        <button
          onClick={toggleMenu}
          className="flex z-40 lg:hidden flex-col items-center justify-center w-fit h-fit space-y-[5px]"
        >
          <div
            className={`h-[1.3px] w-5 bg-black transition-transform duration-700 ease-in-out ${
              isOpen ? "transform rotate-45 translate-y-[7px]" : ""
            }`}
          />
          <div
            className={`h-[1.3px] w-5 bg-black transition-opacity duration-700 ease-in-out ${
              isOpen ? "opacity-0" : "opacity-100"
            }`}
          />
          <div
            className={`h-[1.3px] w-5 bg-black transition-transform duration-700 ease-in-out ${
              isOpen ? "transform -rotate-45 -translate-y-[6px]" : ""
            }`}
          />
        </button>
        <aside
          className={`lg:hidden fixed z-30 top-0 left-0 w-72 h-full bg-white shadow-lg transform transition-transform duration-700 ease-in-out ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="p-4 mt-16">
            <nav className="mt-4 flex flex-col items-center">
              <Link
                to="/faq"
                className={`block text-3xl font-semibold px-4 py-2 hover:text-[#056E55] duration-700 ${
                  location.pathname === "/faq" ? "text-[#056E55]" : "text-black"
                }`}
              >
                Faq
              </Link>
              <Link
                to="/about"
                className={`block text-3xl font-semibold px-4 py-2 hover:text-[#056E55] duration-700 ${
                  location.pathname === "/about"
                    ? "text-[#056E55]"
                    : "text-black"
                }`}
              >
                About
              </Link>
              {user!=null && <Link
                to="/admin"
                className={`block text-3xl font-semibold px-4 py-2 hover:text-[#056E55] duration-700 ${
                  location.pathname === "/contact"
                    ? "text-[#056E55]"
                    : "text-black"
                }`}
              >
                Admin
              </Link>}
              <Link
                to="/contact"
                className={`block text-3xl font-semibold px-4 py-2 hover:text-[#056E55] duration-700 ${
                  location.pathname === "/contact"
                    ? "text-[#056E55]"
                    : "text-black"
                }`}
              >
                Contact
              </Link>

              <div className="flex justify-center max-w-full">
                <select
                  className="w-[80%] bg-white text-3xl font-semibold text-black py-2 px-4 rounded-lg outline-none"
                  name="categories"
                  id="categories"
                  onChange={handleCategoryChange}
                  value={selectedCategory}
                >
                  <option className="text-gray-700 text-xl font-semibold" value="">
                    Categories
                  </option>
                  {categories.map((category) => (
                    <option
                      className="text-gray-700 text-[18px]"
                      key={category}
                      value={category}
                    >
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </nav>
          </div>
        </aside>

        <div
          className={`fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-20 transition-opacity duration-700 ${
            isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        ></div>

        {/* Logo */}
        <div>
          <Link to="/">
            <img
              className="h-10 object-cover"
              src="/images/logo-bgTransparent.png"
              alt="Satva Homes"
            />
          </Link>
        </div>

        {/* Links */}
        <div className="hidden ml-32 xl:ml-[5vw] lg:flex lg:items-center text-black text-[18px] gap-6 2xl:gap-10 font-medium">
          <Link
            to="/faq"
            className={`hover:text-[#056E55] duration-200 ${
              location.pathname === "/faq" ? "text-[#056E55]" : "text-black"
            }`}
          >
            Faq
          </Link>
          <Link
            to="/about"
            className={`hover:text-[#056E55] duration-200 ${
              location.pathname === "/about" ? "text-[#056E55]" : "text-black"
            }`}
          >
            About
          </Link>
          <Link
            to="/contact"
            className={`hover:text-[#056E55] duration-200 ${
              location.pathname === "/contact" ? "text-[#056E55]" : "text-black"
            }`}
          >
            Contact
          </Link>
        </div>

        {/* {Buttons} */}
        <div className="lg:absolute lg:right-0 2xl:mr-16 lg:mr-5 flex items-center gap-4">
          {user==null && <Link to="/login">
            <RxPerson className="block hover:text-[#056E55] duration-200 md:hidden text-zinc-900 text-2xl" />
          </Link>}
          {user!=null && user!=null && <button
            onClick={handleLogout}
            className=""
          >
            <BsPersonCircle className="block hover:text-[#056E55] text-zinc-700 duration-200 md:hidden text-2xl" />

          </button>}

          {user==null && <Link
            to="/login"
            className="hidden hover:text-zinc-100 hover:bg-[#056E55] bg-zinc-200 px-3 py-[10px] rounded-md text-[#056E55] duration-200 md:flex lg:gap-[2px] lg:items-center"
          >
            <IoArrowForwardCircleOutline className="text-2xl" />
            <h1 className="text-md mb-[1px] font-semibold">Login</h1>
          </Link>}
          {/* Category Dropdown */}
          {user !=null && <div className="border hidden lg:flex text-zinc-200 bg-[#0e6d55] rounded-md text-sm justify-between items-center gap-3">
            <select
              className="outline-none bg-transparent uppercase rounded font-bold text-sm p-3 mr-4"
              name="categories"
              id="categories"
              onChange={handleCategoryChange}
              value={selectedCategory}
            >
              <option className="text-zinc-700" value="">
                Select a category
              </option>
              {categories.map((category) => (
                <option
                  className="text-zinc-700"
                  key={category}
                  value={category}
                >
                  {category}
                </option>
              ))}
            </select>
          </div>}

          {/* Admin and Logout Buttons */}
          {user!=null && <Link
            to="/admin"
            className="hidden hover:text-zinc-100 hover:bg-[#056E55] bg-zinc-200 px-3 py-[10px] rounded-md text-[#056E55] duration-200 md:flex lg:gap-[2px] lg:items-center"
          >
            <h1 className="text-md mb-[1px] font-semibold">Admin</h1>
          </Link>}
          {user!=null && <button
            onClick={handleLogout}
            className="hidden hover:text-zinc-100 hover:bg-[#056E55] bg-zinc-200 px-3 py-[10px] rounded-md text-[#056E55] duration-200 md:flex lg:gap-[2px] lg:items-center"
          >
            <h1 className="text-md mb-[1px] font-semibold">Logout</h1>
          </button>}
        </div>
      </div>
      <hr className="bg-zinc-200 border-none h-[1px]" />
    </header>
  );
};

export default Testheader;
