import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFirestore, collection, query, getDocs } from 'firebase/firestore';

function ProductList() {
  const { category } = useParams();
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const db = getFirestore();
        const productsCollectionRef = collection(db, `products/${category}/${category}`);
        const q = query(productsCollectionRef);

        const querySnapshot = await getDocs(q);
        const productsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(productsData);
        console.log(productsData);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    if (category) {
      fetchProducts();
    }
  }, [category]);

  const handleProductClick = (productId) => {
    navigate(`/product/${category}/${productId}`);
  };

  return (
    <div>
      <h2>Products in category: {category}</h2>
      <ul>
        {products.map((product) => (
          <li key={product.id} onClick={() => handleProductClick(product.id)} style={{ cursor: 'pointer' }}>
            {product.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ProductList;
