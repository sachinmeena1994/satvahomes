import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { fireDB } from '../firebase-config';
import { FaChevronUp, FaChevronDown } from 'react-icons/fa';
import VendorDashboard from '../Components/VendorDashboard';
import CreateProduct from '../Components/CreateProduct';
import ProductManager from '../Components/ProductManager';
import BulkUpload from '../Components/BulkUpload';

function Admin() {
  const [menuOption, setMenuOption] = useState('');
  const [users, setUsers] = useState([]);
  const [expandedUserIndex, setExpandedUserIndex] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      const usersCollection = collection(fireDB, 'users');
      const usersSnapshot = await getDocs(usersCollection);
      const usersData = usersSnapshot.docs.map((doc) => doc.data());
      setUsers(usersData);
    };

    if (menuOption === 'users') {
      fetchUsers();
    }
  }, [menuOption]);

  const handleEditRole = (index, newRole) => {
    const updatedUsers = [...users];
    updatedUsers[index].role = newRole;
    setUsers(updatedUsers);
  };

  const handleUpdateRole = () => {
    // Handle update logic here
  };

  const toggleUserDetails = (index) => {
    setExpandedUserIndex(index === expandedUserIndex ? null : index);
  };

  return (
    <div className="flex flex-row w-full border-opacity-50 min-h-screen">
      <aside className="w-1/4 bg-gradient-to-r from-blue-400 to-blue-700 p-6 text-white" style={{ height: '100vh' }}>
        <ul className="mt-4">
          <li className={`cursor-pointer py-2 px-4 rounded-lg mb-2 ${menuOption === 'users' ? 'bg-blue-700' : 'hover:bg-blue-600'}`} onClick={() => setMenuOption('users')}>Users</li>
          <li className={`cursor-pointer py-2 px-4 rounded-lg mb-2 ${menuOption === 'createProduct' ? 'bg-blue-700' : 'hover:bg-blue-600'}`} onClick={() => setMenuOption('createProduct')}>Create Product</li>
          <li className={`cursor-pointer py-2 px-4 rounded-lg mb-2 ${menuOption === 'advertisement' ? 'bg-blue-700' : 'hover:bg-blue-600'}`} onClick={() => setMenuOption('advertisement')}>Vendor</li>
          <li className={`cursor-pointer py-2 px-4 rounded-lg mb-2 ${menuOption === 'manageProducts' ? 'bg-blue-700' : 'hover:bg-blue-600'}`} onClick={() => setMenuOption('manageProducts')}>Manage Products</li>
          <li className={`cursor-pointer py-2 px-4 rounded-lg mb-2 ${menuOption === 'bulkUpload' ? 'bg-blue-700' : 'hover:bg-blue-600'}`} onClick={() => setMenuOption('bulkUpload')}>Bulk Upload</li>
        </ul>
      </aside>
      <main className="w-3/4 bg-gray-50 p-6">
        <div>
          {menuOption === 'users' && (
            <div>
              {users.map((user, index) => (
                <div key={index} className="bg-white shadow-md rounded-lg p-6 mb-6 transition-transform transform hover:scale-102">
                  <h3
                    className="text-xl font-semibold cursor-pointer flex items-center justify-between"
                    onClick={() => toggleUserDetails(index)}
                  >
                    Name :  {user.name}
                    {expandedUserIndex === index ? (
                      <FaChevronUp className="ml-1" />
                    ) : (
                      <FaChevronDown className="ml-1" />
                    )}
                  </h3>
                  <div className={expandedUserIndex === index ? 'block mt-4' : 'hidden'}>
                    <div className="bg-gray-100 p-4 mb-4 rounded-lg">
                      <h4 className="text-md font-semibold mb-2">Name:</h4>
                      <p>{user.name}</p>
                    </div>
                    <div className="bg-gray-100 p-4 mb-4 rounded-lg">
                      <h4 className="text-md font-semibold mb-2">Email:</h4>
                      <p>{user.email}</p>
                    </div>
                    <div className="bg-gray-100 p-4 mb-4 rounded-lg">
                      <h4 className="text-md font-semibold mb-2">Role:</h4>
                      <div className="flex items-center">
                        <select
                          className="border rounded-md py-2 px-3 mr-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
                          value={user.role}
                          onChange={(e) => handleEditRole(index, e.target.value)}
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                          <option value="vendor">Vendor</option>
                          <option value="designer">Designer</option>
                        </select>
                        <button
                          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                          onClick={handleUpdateRole}
                        >
                          Update
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {menuOption === 'advertisement' && (
            <div>
              <VendorDashboard />
            </div>
          )}
          {menuOption === 'createProduct' && (
            <div>
              <CreateProduct />
            </div>
          )}
          {menuOption === 'manageProducts' && (
            <div>
              <ProductManager />
            </div>
          )}
          {menuOption === 'bulkUpload' && (
            <div>
              <BulkUpload />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Admin;
