import React, { useState, useEffect } from 'react';
import { collection, addDoc, deleteDoc, doc, getDocs,updateDoc } from "firebase/firestore";
import { fireDB } from "../../firebase-config";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

function CategoryManager() {
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState("");
    const [newCategoryLogo, setNewCategoryLogo] = useState(null);

    useEffect(() => {
        const fetchCategories = async () => {
            const querySnapshot = await getDocs(collection(fireDB, "products"));
            setCategories(querySnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name, logo: doc.data().logo })));
        };

        fetchCategories();
    }, []);

    const handleLogoChange = (e) => {
        setNewCategoryLogo(e.target.files[0]);
    };

    const handleAddCategory = async () => {
        if (newCategory.trim() !== "") {
            let logoUrl = "";
            if (newCategoryLogo) {
                const storageRef = ref(getStorage(), `categoryLogos/${newCategoryLogo.name}`);
                await uploadBytes(storageRef, newCategoryLogo);
                logoUrl = await getDownloadURL(storageRef);
            }

            const docRef = await addDoc(collection(fireDB, "products"), { name: newCategory, logo: logoUrl });
             // Step 2: Update the newly created document with its own ID
    await updateDoc(doc(fireDB, "products", docRef.id), {
        id: docRef.id,
      });
            setCategories([...categories, { id: docRef.id, name: newCategory, logo: logoUrl }]);
            setNewCategory("");
            setNewCategoryLogo(null);
        }
    };

    const handleRemoveCategory = async (id) => {
        if (window.confirm("Are you sure you want to delete this category?")) {
            await deleteDoc(doc(fireDB, "products", id));
            setCategories(categories.filter(category => category.id !== id));
        }
    };

    return (
        <div className="container mx-auto mt-4 p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Manage Categories</h2>
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <input
                    type="text"
                    placeholder="Enter new category name"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="flex-grow p-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="flex-grow p-2 border border-gray-300 rounded shadow-sm"
                />
                <button
                    onClick={handleAddCategory}
                    className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition-colors duration-150"
                >
                    Add Category
                </button>
            </div>

            <ul className="space-y-2">
                {categories.map((category) => (
                    <li key={category.id} className="flex justify-between items-center bg-gray-100 p-3 rounded shadow-sm">
                        <div className="flex items-center gap-4">
                            {category.logo && <img src={category.logo} alt={category.name} style={{ width: '50px', height: '50px', borderRadius: '50%' }} />}
                            <span className="text-gray-800">{category.name}</span>
                        </div>
                        <button
                            onClick={() => handleRemoveCategory(category.id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition-colors duration-150"
                        >
                            Remove
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default CategoryManager;
