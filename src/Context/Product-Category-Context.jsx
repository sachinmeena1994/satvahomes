// Product-Category-Context.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const ProductCategoryContext = createContext();

export const useProductCategory = () => {
  return useContext(ProductCategoryContext);
};

export const ProductCategoryProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const db = getFirestore();
        const categoriesCollection = collection(db, "products");
        const categoriesSnapshot = await getDocs(categoriesCollection);
        const categoriesData = categoriesSnapshot.docs.map((doc) => doc.id);
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <ProductCategoryContext.Provider value={{ categories, loading }}>
      {children}
    </ProductCategoryContext.Provider>
  );
};
