import React from "react";
import { Link } from "react-router-dom";
import { useProductCategory } from "../Context/Product-Category-Context"; // Adjust the path as needed

const CategoriesLinks = () => {
  const { categories, loading } = useProductCategory();

  // Define a mapping of category names to image URLs
  const categoryImages = {
    "Shoe Rack": "https://satvahomes.com/wp-content/uploads/2024/03/WhatsApp-Image-2024-03-11-at-19.51.21-12-768x768.jpeg",
    "TV": "https://satvahomes.com/wp-content/uploads/2024/03/WhatsApp-Image-2024-03-11-at-19.51.21-1024x1024.jpeg",
    "Partition Unit": "https://satvahomes.com/wp-content/uploads/2024/03/WhatsApp-Image-2024-03-11-at-19.51.21-8-1024x1024.jpeg",
    "Wall Panel": "https://satvahomes.com/wp-content/uploads/2024/03/WhatsApp-Image-2024-03-11-at-19.51.21-10-1024x1024.jpeg",
    "Pooja Unit": "https://satvahomes.com/wp-content/uploads/2024/03/WhatsApp-Image-2024-03-11-at-19.51.21-18-1024x1024.jpeg",
    "Bar Unit": "https://satvahomes.com/wp-content/uploads/2024/03/WhatsApp-Image-2024-03-11-at-19.51.21-1-1024x1024.jpeg",
    "Crockery Unit": "https://satvahomes.com/wp-content/uploads/2024/03/WhatsApp-Image-2024-03-11-at-19.51.21-21-768x768.jpeg",
    "Dressing Table Unit": "https://satvahomes.com/wp-content/uploads/2024/03/WhatsApp-Image-2024-03-11-at-19.51.21-9-768x768.jpeg",
    "Study Table Unit": "https://satvahomes.com/wp-content/uploads/2024/03/WhatsApp-Image-2024-03-11-at-19.51.21-17-768x768.jpeg",
    "Wardobe": "https://satvahomes.com/wp-content/uploads/2024/03/WhatsApp-Image-2024-03-11-at-19.51.21-3-768x768.jpeg"
  };

  // Define a default image for categories that don't have a specific image
  const defaultImage = "https://satvahomes.com/wp-content/uploads/2024/03/default-image.jpeg";

  if (loading) {
    return <div>Loading...</div>;
  }

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
              to={`/product-category/${category}`}
              key={category}
              className="w-full bg-[#0C3C30] flex-shrink-0 md:w-[17%]"
            >
              <img
                src={categoryImages[category] || defaultImage}
                alt={category}
              />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoriesLinks;
