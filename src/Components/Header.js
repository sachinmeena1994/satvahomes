import React, { useState, useEffect } from "react";
import { FaUser } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";

import { getFirestore, collection, getDocs } from "firebase/firestore";

function Header() {
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
      <div className="container mx-auto text-white px-4 py-8 flex items-center">
        {/* Logo */}
        <div className="mr-auto md:w-48 flex-shrink-0">
          <Link to="/">
            <img
              className="h-8 md:h-10"
              src="/images/logo-bgTransparent.png"
              alt="Satva Homes"
            />
          </Link>
        </div>

        {/* Search */}
        <div className="w-full max-w-xs xl:max-w-lg 2xl:max-w-2xl bg-gray-100 rounded-md hidden xl:flex items-center">
          {/* Wrap select element with Link */}

          <select
            className="bg-transparent uppercase font-bold text-sm p-4 mr-4"
            name=""
            id=""
            onChange={handleCategoryChange}
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          {/* <input className="border-l border-gray-300 bg-transparent font-semibold text-sm pl-4" type="text" placeholder="I'm searching for ..." />
          <FaSearch className="h-5 px-4 text-gray-500" /> */}
        </div>

        {/* Buttons */}
        <nav className="contents">
          <ul className="ml-4 xl:w-48 flex items-center justify-end">
            <li className="ml-2 lg:ml-4 relative inline-block">
              <a href="">
                <FaUser className="h-9 lg:h-10 p-2 text-gray-500" />
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;
