import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { fireDB } from '../firebase-config';
import { FaChevronUp, FaChevronDown } from 'react-icons/fa';

import PDFGenerator from '../Components/PDFGenerator';
import CreateProduct from '../Components/CreateProduct';


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
    <div className="flex flex-row w-full border-opacity-50">
      <aside className="w-1/4 bg-gray-200 p-6" style={{ height: "100vh" }}>
        <ul className="mt-4">
          <li className="cursor-pointer" onClick={() => setMenuOption('users')}>Users</li>
          <li className="cursor-pointer" onClick={() => setMenuOption('createProduct')}>Create Product</li>
          <li className="cursor-pointer" onClick={() => setMenuOption('createPDF')}>Create PDF</li>
          {/* Add more menu options as needed */}
        </ul>
      </aside>
      <main className="w-3/4 bg-white p-6">
        {/* <h2 className="text-lg font-semibold">{menuOption === 'users' ? 'Users' : 'Add Products'}</h2> */}
        <div>
          {menuOption === 'users' && (
            <div>
              {users.map((user, index) => (
                <div key={index} className="card bg-gray-100 p-4 mb-4">
                  <h3 className="text-lg font-semibold cursor-pointer flex items-center" onClick={() => toggleUserDetails(index)}>
                    {user.name}
                    {expandedUserIndex === index ? <FaChevronUp className="ml-1" /> : <FaChevronDown className="ml-1" />}
                  </h3>
                  <div className={expandedUserIndex === index ? 'block' : 'hidden'}>
                    <div className="card bg-gray-100 p-2 mb-2">
                      <h4 className="text-md font-semibold">Name:</h4>
                      <p>{user.name}</p>
                    </div>
                    <div className="card bg-gray-100 p-2 mb-2">
                      <h4 className="text-md font-semibold">Email:</h4>
                      <p>{user.email}</p>
                    </div>
                    {/* <div className="card bg-gray-100 p-2 mb-2">
                      <h4 className="text-md font-semibold">ID:</h4>
                      <p>{user.id}</p>
                    </div> */}
                    {/* <div className="card bg-gray-100 p-2 mb-2">
                      <h4 className="text-md font-semibold">Location:</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-sm font-semibold">City:</p>
                          <p>{user.location.city}</p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold">State:</p>
                          <p>{user.location.state}</p>
                        </div>
                      </div>
                    </div> */}
                    <div className="card bg-gray-100 p-2 mb-2">
                      <h4 className="text-md font-semibold">Role:</h4>
                      <div className="flex items-center">
                        <select
                          className="border rounded-md py-1 px-2 mr-2"
                          value={user.role}
                          onChange={(e) => handleEditRole(index, e.target.value)}
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                          <option value="vendor">Vendor</option>
                          <option value="designer">Designer</option>
                        </select>
                        <button className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600" onClick={handleUpdateRole}>Update</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {menuOption =="createPDF" &&(
 <div>
<PDFGenerator/>
</div>
          )}
               {menuOption =="createProduct" &&(
 <div>
<CreateProduct/>
</div>
          )}
          {/* Add more content based on menu option */}
        </div>
      </main>
    </div>
  );
}

export default Admin;
