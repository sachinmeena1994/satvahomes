import React from "react";
import { Link } from "react-router-dom";
import { useProductCategory } from "../Context/Product-Category-Context"; // Adjust the path as needed

const CategoriesLinks = () => {
  const { categories, loading } = useProductCategory();

  if (loading) {
    return <div>Loading...</div>;
  }

  // Debugging: Log categories to check their structure
  console.log("Categories:", categories);

  return (
    <div className="mt-20 mx-3">
      <h1 className="text-[#056E55] font-bold text-center text-4xl">
        Checkout Our 100% Free Design Resource.
      </h1>
      {/* Category list */}
      <div className="xl:w-[76.5rem] mx-auto flex flex-col items-center">
        <div className="flex justify-center mt-12 flex-col gap-10 md:flex-row md:flex-wrap md:gap-5 w-full">
          {categories.map((category) => (
            <Link
              to={`/product-category/${category.name}`}
              key={category.name} // Ensure 'name' is unique
              className="w-full bg-[#0C3C30] flex-shrink-0 md:w-[17%]"
            >
              <img
                src={category.logo} // Ensure 'logo' is a valid URL or path
                alt={category.name} // Good use of 'name' for accessibility
              />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoriesLinks;
