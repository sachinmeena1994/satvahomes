  import React, { useState, useEffect } from 'react';
  import { getFirestore, collection, getDoc, doc, updateDoc ,arrayRemove} from 'firebase/firestore';
  import { toast } from 'react-toastify';
  import { useProductCategory } from '../Context/Product-Category-Context';
  const ProductManager = () => {
    const { categories, loading } = useProductCategory();
    // const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [products, setProducts] = useState([]);
    const [editingProduct, setEditingProduct] = useState(null);
    const [deletingProduct, setDeletingProduct] = useState(null);
    const db = getFirestore();

  

    useEffect(() => {
      if (selectedCategory) {
        const fetchProducts = async () => {
          try {
            const productDocRef = doc(db, `products`, selectedCategory); // Reference to the document
            const productSnapshot = await getDoc(productDocRef);
    
            if (productSnapshot.exists()) {
              // If the document exists, get its data
              const productData = { id: productSnapshot.id, ...productSnapshot.data() };
              if(productData.products){
                setProducts(productData.products);
              }
   
            } else {
              console.log("No such document!");
              setProducts([]); // Clear products if no document found
            }
          } catch (error) {
            console.error("Error fetching document:", error);
          }
        };
    
        fetchProducts();
      }
    }, [selectedCategory,db]);
 
    const handleDelete = async (productId) => {
      try {
        // Find the product to remove
        const productToDelete = products.find(product => product.id === productId);
    
        if (productToDelete) {
          // Remove the product from the 'products' array in Firestore
          const categoryDocRef = doc(db, `products/${selectedCategory}`);
          await updateDoc(categoryDocRef, {
            products: arrayRemove(productToDelete)
          });
    
          // Update the local state by filtering out the deleted product
          setProducts(products.filter(product => product.id !== productId));
    
          toast.success('Product deleted successfully');
        } else {
          toast.error('Product not found');
        }
        
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
            onChange={(e) => {
              const selectedIndex =e.target.value;
                
                setSelectedCategory(selectedIndex)
              }
            }
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id} id>{category.name}</option>
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
