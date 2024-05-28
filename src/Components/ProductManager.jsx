import React, { useState, useEffect } from 'react';
import { getFirestore, collection, query, getDocs, where, doc, deleteDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';

const ProductManager = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [products, setProducts] = useState([]);
  const db = getFirestore();

  useEffect(() => {
    const fetchCategories = async () => {
      const categoriesCollection = collection(db, "products");
      const categoriesSnapshot = await getDocs(categoriesCollection);
      const categoriesData = categoriesSnapshot.docs.map((doc) => doc.id);
      setCategories(categoriesData);
    };

    fetchCategories();
  }, [db]);

  useEffect(() => {
    if (selectedCategory) {
      const fetchProducts = async () => {
        const productsCollection = collection(db, `products/${selectedCategory}/${selectedCategory}`);
        const productsSnapshot = await getDocs(productsCollection);
        const productsData = productsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setProducts(productsData);
      };

      fetchProducts();
    }
  }, [selectedCategory, db]);

  const handleDelete = async (productId) => {
    try {
      await deleteDoc(doc(db, `products/${selectedCategory}/${selectedCategory}`, productId));
      setProducts(products.filter(product => product.id !== productId));
      toast.success('Product deleted successfully');
    } catch (error) {
      console.error('Error deleting product: ', error);
      toast.error('Error deleting product');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Product Manager</h1>
      <div className="mb-4">
        <label className="mr-2">Select Category:</label>
        <select 
          className="border border-gray-300 p-2 rounded" 
          value={selectedCategory} 
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">Select a category</option>
          {categories.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>
      <div>
        {products.map((product) => (
          <div key={product.id} className="border p-4 mb-4 rounded">
            <h2 className="text-lg font-bold">{product.name}</h2>
            <p>{product.description}</p>
            <p>Price: ₹{product.price}</p>
            <button 
              className="bg-red-500 text-white py-2 px-4 rounded mr-2" 
              onClick={() => handleDelete(product.id)}
            >
              Delete
            </button>
            <button className="bg-blue-500 text-white py-2 px-4 rounded">Edit</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductManager;
