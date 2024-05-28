import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getFirestore, collection, query, getDocs } from "firebase/firestore";
import ProductCard from "../Components/ProductCard/ProductCard"; // Adjust the import path as needed

function ProductList() {
  const { category } = useParams();
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const db = getFirestore();
        const productsCollectionRef = collection(
          db,
          `products/${category}/${category}`
        );
        const q = query(productsCollectionRef);

        const querySnapshot = await getDocs(q);
        const productsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(productsData);
        console.log(productsData);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    if (category) {
      fetchProducts();
    }
  }, [category]);

  console.log("products:::", products);

  const handleProductClick = (productId) => {
    navigate(`/product/${category}/${productId}`);
  };

  return (
    <div>
      <div className="mb-10">
        <div className="relative h-48 sm:h-64 md:h-72 lg:h-60 w-full bg-cover bg-center">
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <div className="relative z-10 flex flex-col items-center justify-center h-full text-white px-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
              Category : {category}
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl mt-2">
              Home &gt; Living Room &gt; {category}
            </p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-6">
        {products.map((product) => (
          <div
            key={product.id}
            style={{ cursor: "pointer" }}
            onClick={() => handleProductClick(product.id)}
          >
            <ProductCard
              image={product.productImages && product.productImages[0]}
              title={product.name}
              description={product.description}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductList;
