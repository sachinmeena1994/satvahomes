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
import { FaChevronUp, FaChevronDown, FaUser, FaEnvelope, FaUserTag, FaPen } from "react-icons/fa";
import { useUser } from '../Context/Current-User-Context';
import VendorDashboard from "../Components/VendorDashboard";
import CreateProduct from "../Components/CreateProduct";
import ProductManager from "../Components/ProductManager";
import BulkUpload from "../Components/BulkUpload";
import CategoryManager from "../Components/admin/ProductCatgeory"; 
import {
  FaUsers,
  FaPlusCircle,
  FaBullhorn,
  FaBoxOpen,
  FaUpload,
  FaAd
} from "react-icons/fa";
import ManageVendors from "../Components/ManageVendors";

function Admin() {
  const currentUser = useUser();

  const [menuOption, setMenuOption] = useState(""); // Start with an empty string
  const [users, setUsers] = useState([]);
  const [expandedUserIndex, setExpandedUserIndex] = useState(null);
  const [updatedUserIndex, setUpdatedUserIndex] = useState(null);

  // UseEffect to set the menu option after currentUser is available
  useEffect(() => {
    const getInitialMenuOption = () => {
      if (currentUser.userDetails?.role === "admin") return "users";
      if (currentUser.userDetails?.role === "designer") return "createProduct";
      if (currentUser.userDetails?.role === "vendor") return "advertisement";
      return "default"; // Fallback in case the role doesn't match any of the conditions
    };

    setMenuOption(getInitialMenuOption());
  }, [currentUser]); // Run this effect when currentUser changes

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
    fetchUsers();
  }, []);

  const handleEditRole = (index, newRole) => {
    const updatedUsers = [...users];
    updatedUsers[index].role = newRole;
    setUsers(updatedUsers);
    setUpdatedUserIndex(index);
  };

  const handleUpdateRole = async (index) => {
    const userToUpdate = users[index];
    const usersCollection = collection(fireDB, "users");
    const q = query(usersCollection, where("email", "==", userToUpdate.email));

    try {
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0].ref;
        await updateDoc(userDoc, { role: userToUpdate.role });
        alert("Role updated successfully!");
      } else {
        alert("User not found.");
      }
    } catch (error) {
      console.error("Error updating role: ", error);
      alert("Failed to update role.");
    }
    setUpdatedUserIndex(null);
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
          {currentUser.userDetails?.role === "user" &&
          <>
            <li className={`cursor-pointer py-3 px-4 rounded-lg flex items-center space-x-3 duration-200 ${
              menuOption === "productCategory" ? "bg-[#174f41]" : "hover:bg-[#174f4166]"
          }`} onClick={() => setMenuOption("productCategory")}>
               <FaPlusCircle className="text-lg" />
              <span className="text-lg">Product Category</span>
          </li>
            <li
              className={`cursor-pointer py-3 px-4 rounded-lg flex items-center space-x-3 duration-200 ${
                menuOption === "users" ? "bg-[#174f41]" : "hover:bg-[#174f4166]"
              }`}
              onClick={() => setMenuOption("users")}
            >
              <FaUsers className="text-lg" />
              <span>Users</span>
            </li>
            </>
          }
          {(currentUser.userDetails?.role === "user" || currentUser.userDetails?.role === "designer") &&
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
          }
          {currentUser.userDetails?.role === "vendor" &&
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
            </li>}
          {currentUser.userDetails?.role === "user" &&
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
            </li>}
          {(currentUser.userDetails?.role === "user" || currentUser.userDetails?.role === "designer") &&
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
            </li>}
            {currentUser.userDetails?.role === "user" &&
            <li
              className={`cursor-pointer py-3 px-4 rounded-lg flex items-center space-x-3 duration-200 ${
                menuOption === "manageProducts"
                  ? "bg-[#174f41]"
                  : "hover:bg-[#174f4166]"
              }`}
              onClick={() => setMenuOption("manageVendors")}
            >
              <FaBoxOpen className="text-lg" />
              <span>Manage Vendors</span>
            </li>}
        </ul>
      </aside>

      <main
        className="w-3/4 overflow-y-auto bg-gray-50 p-6"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <div>
        {menuOption === "productCategory" && <CategoryManager />}
          {menuOption === "users" && (
            <div>
              {users.map((user, index) => (
                <div
                  key={index}
                  className="bg-white shadow-lg border border-gray-200 rounded-lg p-6 mb-6 duration-200 transition-all transform hover:scale-102"
                >
                  <h3
                    className="text-xl font-semibold cursor-pointer flex items-center justify-between"
                    onClick={() => toggleUserDetails(index)}
                  >
                    <span className="flex items-center">
                      <FaUser className="mr-2 text-[#0E6D55]" /> {user.name}
                    </span>
                    <FaChevronUp
                      className={`ml-1 transition-transform ${
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
                    <div className="bg-gray-50 flex items-center gap-2 p-4 mb-4 rounded-lg border border-gray-200">
                      <FaUser className="text-[#0E6D55] mr-2" />
                      <h4 className="text-md font-semibold">Name :</h4>
                      <p>{user.name}</p>
                    </div>
                    <div className="bg-gray-50 flex items-center gap-2 p-4 mb-4 rounded-lg border border-gray-200">
                      <FaEnvelope className="text-[#0E6D55] mr-2" />
                      <h4 className="text-md font-semibold">Email :</h4>
                      <p>{user.email}</p>
                    </div>
                    <div className="bg-gray-50 flex items-center gap-2 p-4 mb-4 rounded-lg border border-gray-200">
                      <FaUserTag className="text-[#0E6D55] mr-2" />
                      <h4 className="text-md font-semibold">Role :</h4>
                      <div className="flex items-center">
                        <div className="pl-2 pr-2 border border-gray-200 rounded-md cursor-pointer relative">
                          {updatedUserIndex === index ? (
                            <select
                              className="border border-gray-300 rounded-lg p-1 focus:outline-none"
                              value={user.role}
                              onChange={(e) =>
                                handleEditRole(index, e.target.value)
                              }
                            >
                              <option value="admin">Admin</option>
                              <option value="designer">Designer</option>
                              <option value="vendor">Vendor</option>
                            </select>
                          ) : (
                            <span className="cursor-pointer">
                              {user.role}
                            </span>
                          )}
                          {updatedUserIndex === index ? (
                            <FaPen
                              className="text-[#0E6D55] ml-2"
                              onClick={() => handleUpdateRole(index)}
                            />
                          ) : (
                            <FaPen
                              className="text-[#0E6D55] ml-2"
                              onClick={() =>
                                setUpdatedUserIndex(index)
                              }
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {menuOption === "advertisement" && <VendorDashboard />}
          {menuOption === "createProduct" && <CreateProduct />}
          {menuOption === "manageProducts" && <ProductManager />}
          {menuOption === "bulkUpload" && <BulkUpload />}
          {menuOption === "manageVendors" && <ManageVendors />}
        </div>
      </main>
    </div>
  );
}

export default Admin;
