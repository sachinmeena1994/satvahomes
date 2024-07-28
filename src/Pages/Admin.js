import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { fireDB } from "../firebase-config";
import { FaChevronUp, FaChevronDown } from "react-icons/fa";
import VendorDashboard from "../Components/VendorDashboard";
import CreateProduct from "../Components/CreateProduct";
import ProductManager from "../Components/ProductManager";
import BulkUpload from "../Components/BulkUpload";
import {
  FaUsers,
  FaPlusCircle,
  FaBullhorn,
  FaBoxOpen,
  FaUpload,
} from "react-icons/fa";
import { FaAd, FaProductHunt } from "react-icons/fa";

function Admin() {
  const [menuOption, setMenuOption] = useState("");
  const [users, setUsers] = useState([]);
  const [expandedUserIndex, setExpandedUserIndex] = useState(null);
  const [updatedUserIndex, setUpdatedUserIndex] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      const usersCollection = collection(fireDB, "users");
      const usersSnapshot = await getDocs(usersCollection);
      const usersData = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(usersData);
    };

    if (menuOption === "users") {
      fetchUsers();
    }
  }, [menuOption]);

  const handleEditRole = (index, newRole) => {
    const updatedUsers = [...users];
    updatedUsers[index].role = newRole;
    setUsers(updatedUsers);
    setUpdatedUserIndex(index); // Set the index of the user whose role is being edited
  };
  const handleUpdateRole = async (index) => {
    const userToUpdate = users[index];
    const usersCollection = collection(fireDB, "users");
    const q = query(usersCollection, where("email", "==", userToUpdate.email));

    try {
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0].ref; // Get the document reference
        await updateDoc(userDoc, { role: userToUpdate.role });
        alert("Role updated successfully!");
      } else {
        alert("User not found.");
      }
    } catch (error) {
      console.error("Error updating role: ", error);
      alert("Failed to update role.");
    }
    setUpdatedUserIndex(null); // Reset the updated user index after the update operation
  };
  const toggleUserDetails = (index) => {
    setExpandedUserIndex(index === expandedUserIndex ? null : index);
  };

  return (
    <div className="flex flex-row w-full border-opacity-50 h-screen">
      <aside
        className="w-1/4 bg-gradient-to-r from-[#0E6D55] to-[#1cca9e] p-6 text-white"
        style={{ height: "100vh" }}
      >
        <ul className="mt-4 space-y-2">
          <li
            className={`cursor-pointer py-3 px-4 rounded-lg flex items-center space-x-3 duration-200 ${
              menuOption === "users" ? "bg-[#174f41]" : "hover:bg-[#174f4166]"
            }`}
            onClick={() => setMenuOption("users")}
          >
            <FaUsers className="text-lg" />
            <span>Users</span>
          </li>
          <li
            className={`cursor-pointer py-3 px-4 rounded-lg flex items-center space-x-3 duration-200 ${
              menuOption === "createProduct"
                ? "bg-[#174f41]"
                : "hover:bg-[#174f4166]"
            }`}
            onClick={() => setMenuOption("createProduct")}
          >
            <FaPlusCircle className="text-lg" />
            <span>Create Product</span>
          </li>
          <li
            className={`cursor-pointer py-3 px-4 rounded-lg flex items-center space-x-3 duration-200 ${
              menuOption === "advertisement"
                ? "bg-[#174f41]"
                : "hover:bg-[#174f4166]"
            }`}
            onClick={() => setMenuOption("advertisement")}
          >
            <FaAd className="text-lg" />
            <span>Vendor</span>
          </li>
          <li
            className={`cursor-pointer py-3 px-4 rounded-lg flex items-center space-x-3 duration-200 ${
              menuOption === "manageProducts"
                ? "bg-[#174f41]"
                : "hover:bg-[#174f4166]"
            }`}
            onClick={() => setMenuOption("manageProducts")}
          >
            <FaBoxOpen className="text-lg" />
            <span>Manage Products</span>
          </li>
          <li
            className={`cursor-pointer py-3 px-4 rounded-lg flex items-center space-x-3 duration-200 ${
              menuOption === "bulkUpload"
                ? "bg-[#174f41]"
                : "hover:bg-[#174f4166]"
            }`}
            onClick={() => setMenuOption("bulkUpload")}
          >
            <FaUpload className="text-lg" />
            <span>Bulk Upload</span>
          </li>
        </ul>
      </aside>

      <main
        className="w-3/4 overflow-y-auto  bg-gray-50 p-6"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <div>
          {menuOption === "users" && (
            <div>
              {users.map((user, index) => (
                <div
                  key={index}
                  className="bg-white shadow-md rounded-lg p-6 mb-6 duration-200 transition-all transform hover:scale-102"
                >
                  <h3
                    className="text-xl font-semibold cursor-pointer flex items-center justify-between"
                    onClick={() => toggleUserDetails(index)}
                  >
                    Name : {user.name}
                    <FaChevronUp
                      className={`ml-1 ${
                        expandedUserIndex === index
                          ? "rotate-180 duration-300 text-[#0E6D55]"
                          : "duration-500"
                      }`}
                    />
                  </h3>
                  <div
                    className={`transition-max-height duration-500 ease-in-out overflow-hidden ${
                      expandedUserIndex === index
                        ? "max-h-screen mt-4"
                        : "max-h-0"
                    }`}
                  >
                    <div className="bg-gray-100 flex gap-1 p-4 mb-4 rounded-lg">
                      <h4 className="text-md font-semibold mb-2">Name :</h4>
                      <p>{user.name}</p>
                    </div>
                    <div className="bg-gray-100 flex gap-1 p-4 mb-4 rounded-lg">
                      <h4 className="text-md font-semibold mb-2">Email :</h4>
                      <p>{user.email}</p>
                    </div>
                    <div className="bg-gray-100 flex gap-2 items-center p-4 mb-4 rounded-lg">
                      <h4 className="text-md font-semibold mb-2">Role :</h4>
                      <div className="flex items-center">
                        <div className="pl-2 border border-zinc-200 rounded-lg mr-2 bg-white">
                          <select
                            className="rounded-lg py-2 pb-2 px-2 mr-4 border-none outline-none"
                            value={user.role}
                            onChange={(e) =>
                              handleEditRole(index, e.target.value)
                            }
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                            <option value="vendor">Vendor</option>
                            <option value="designer">Designer</option>
                          </select>
                        </div>
                        <button
                          className="bg-[#0e6d55e1] text-white px-4 py-2 duration-300 rounded-lg hover:bg-green-900 outline-none"
                          onClick={() => handleUpdateRole(index)}
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
          {menuOption === "advertisement" && (
            <div>
              <VendorDashboard />
            </div>
          )}
          {menuOption === "createProduct" && (
            <div>
              <CreateProduct />
            </div>
          )}
          {menuOption === "manageProducts" && (
            <div>
              <ProductManager />
            </div>
          )}
          {menuOption === "bulkUpload" && (
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
