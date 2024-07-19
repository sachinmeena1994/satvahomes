import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getFirestore, collection, query, getDocs } from "firebase/firestore";
import ProductCard from "../Components/ProductCard/ProductCard"; // Adjust the import path as needed
import TraverseNav from "../Components/TraverseNav";
import Loader from "../Components/Loader";

function ProductList() {
  const { category } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
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
      } finally {
        setLoading(false);
      }
    };

    if (category) {
      fetchProducts();
    }
  }, [category]);

  const handleProductClick = (productId) => {
    navigate(`/product/${category}/${productId}`);
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div>
      <div
        className="mb-10"
        style={{
          backgroundImage: "url('/images/bgCommonImageFaqContact.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <TraverseNav pathname={category} /> 
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
