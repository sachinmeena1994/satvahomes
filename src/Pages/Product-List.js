import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import ProductCard from "../Components/ProductCard/ProductCard"; // Adjust the import path as needed
import TraverseNav from "../Components/TraverseNav";
import Loader from "../Components/Loader";

function ProductList() {
  const { category } = useParams();
  const [products, setProducts] = useState([]);
  const [categoryName,setCatgeoryName ]= useState();

  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProductById = async () => {
      try {
        const db = getFirestore();
        
        // Reference the specific document in the 'products' collection using the category as the document ID
        const productDocRef = doc(db, "products", category);
        
        // Fetch the document
        const productDoc = await getDoc(productDocRef);
        
        if (productDoc.exists()) {
          // Document found, extract the data
          const productData = { id: productDoc.id, ...productDoc.data() };
          setCatgeoryName(productData.name)
          // Check if the 'products' array exists within the document data
          if (productData.products && productData.products.length > 0) {
            setProducts(productData.products); // Update state with products array
          } else {
            // If no products are present, set an empty array
            setProducts([]);
          }
        } else {
          console.error("No product found with the given ID.");
          setProducts([]); // No product found, set products to an empty array
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    if (category) {
      fetchProductById();
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
        <TraverseNav pathname={categoryName} />
      </div>

      {/* Conditionally render content based on whether products exist */}
      {products.length > 0 ? (
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
      ) : (
        // Message to display when no products are available
        <div className="flex justify-center items-center h-64">
          <h2 className="text-gray-500 text-lg">Nothing to display</h2>
        </div>
      )}
    </div>
  );
}

export default ProductList;
