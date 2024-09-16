  import React, { useState, useEffect } from 'react';
  import { getFirestore, collection, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
  import { toast } from 'react-toastify';

  const ProductManager = () => {
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [products, setProducts] = useState([]);
    const [editingProduct, setEditingProduct] = useState(null);
    const [deletingProduct, setDeletingProduct] = useState(null);
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
        setDeletingProduct(null);
      } catch (error) {
        console.error('Error deleting product: ', error);
        toast.error('Error deleting product');
      }
    };

    const handleEdit = (product) => {
      setEditingProduct(product);
    };

    const handleUpdate = async () => {
      try {
        const productDocRef = doc(db, `products/${selectedCategory}/${selectedCategory}`, editingProduct.id);
        await updateDoc(productDocRef, editingProduct);
        setProducts(products.map(product => product.id === editingProduct.id ? editingProduct : product));
        setEditingProduct(null);
        toast.success('Product updated successfully');
      } catch (error) {
        console.error('Error updating product: ', error);
        toast.error('Error updating product');
      }
    };

    // const truncateDescription = (description, length = 100) => {
    //   if (description.length <= length) return description;
    //   return description.substring(0, length) + '...';
    // };
    const truncateDescription = (description, length = 100) => {
      if (!description) return ''; // Handle undefined or null description
      return description.length > length ? `${description.substring(0, length)}...` : description;
    };

    return (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Product Manager</h1>
        <div className="mb-6">
          <label className="mr-2 text-lg font-medium">Select Category:</label>
          <select 
            className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.nam} value={category.name}>{category.name}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-md transition-transform transform hover:scale-105">
              <h2 className="text-2xl font-semibold mb-2 text-gray-800">{product.name}</h2>
              <p className="text-gray-600 mb-4">{truncateDescription(product.description)} <span className="text-blue-500 cursor-pointer" onClick={() => handleEdit(product)}>Read more</span></p>
              <p className="text-gray-800 font-medium mb-4">Price: ₹{product.price}</p>
              <div className="flex space-x-4">
                <button 
                  className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded transition-colors duration-300" 
                  onClick={() => setDeletingProduct(product)}
                >
                  Delete
                </button>
                <button 
                  className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition-colors duration-300" 
                  onClick={() => handleEdit(product)}
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>

        {editingProduct && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4">Edit Product</h2>
              <div className="mb-4">
                <label className="block text-gray-700">Name:</label>
                <input 
                  type="text" 
                  className="border rounded p-2 w-full" 
                  value={editingProduct.name} 
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Description:</label>
                <textarea 
                  className="border rounded p-2 w-full" 
                  value={editingProduct.description} 
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Price:</label>
                <input 
                  type="number" 
                  className="border rounded p-2 w-full" 
                  value={editingProduct.price} 
                  onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                />
              </div>
              <div className="flex space-x-4">
                <button 
                  className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded" 
                  onClick={handleUpdate}
                >
                  Update
                </button>
                <button 
                  className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded" 
                  onClick={() => setEditingProduct(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {deletingProduct && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4">Confirm Delete</h2>
              <p>Are you sure you want to delete the product: <strong>{deletingProduct.name}</strong>?</p>
              <div className="flex space-x-4 mt-4">
                <button 
                  className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded" 
                  onClick={() => handleDelete(deletingProduct.id)}
                >
                  Delete
                </button>
                <button 
                  className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded" 
                  onClick={() => setDeletingProduct(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  export default ProductManager;
