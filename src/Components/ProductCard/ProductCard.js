import React from "react";
import "./productCard.css";

function ProductCard({ image, title, description }) {
  const truncateDescription = (desc, length) => {
    if (!desc) return "";
    return desc.length > length ? desc.substring(0, length) + "..." : desc;
  };

  return (
    <div className="card">
      <img className="card-image" src={image} alt={title} />
      <div className="card-content">
        <p className="card-title">{title}</p>
      </div>
      <div className="card-overlay">
        <p className="card-title">{title}</p>
        <p className="card-description">{truncateDescription(description, 50)}</p>
      </div>
    </div>
  );
}

export default ProductCard;
