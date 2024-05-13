import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

function ProductList() {
  const { category } = useParams();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // Function to fetch products from Firestore based on category
    const fetchProducts = async () => {
      try {
        const db = getFirestore();
        const productsCollectionRef = collection(db, `products/${category}/${category}`);
        const q = query(productsCollectionRef);

        const querySnapshot = await getDocs(q);
        const productsData = querySnapshot.docs.map(doc => doc.data());
        setProducts(productsData);
        console.log(productsData)
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    if (category) {
      fetchProducts();
    }
  }, [category]);

  return (
    <div>
      <h2>Products in category: {category}</h2>
      <ul>
        {products.map((product, index) => (
          <li key={index}>{product.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default ProductList;
