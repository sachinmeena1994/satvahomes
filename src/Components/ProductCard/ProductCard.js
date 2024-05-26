import React from "react";
import "./productCard.css";

function ProductCard({ image, title }) {
  return (
    <div className="card">
      <img className="card-image" src={image} alt={title} />
      <div className="card-content">
        <p className="card-title">{title}</p>
      </div>
    </div>
  );
}

export default ProductCard;
