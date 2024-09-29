import React, { useState, useEffect } from "react";
import {
  getDocs,
  collection,
  doc,
  updateDoc,
} from "firebase/firestore";
import { fireDB, auth } from "../firebase-config";

const ManageVendors = () => {
  const [advertisements, setAdvertisements] = useState([]);

  useEffect(() => {
    const fetchAdvertisements = async () => {
      const user = auth.currentUser;
      if (user) {
        const adsCollection = collection(fireDB, "advertisement");
        const adsSnapshot = await getDocs(adsCollection);
        const adsData = adsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log(adsData);
        setAdvertisements(adsData);
      }
    };

    fetchAdvertisements();
  }, []);

  const toggleAdStatus = async (ad) => {
    const newStatus = !ad.isActive;
    const adDocRef = doc(fireDB, "advertisement", ad.id);

    await updateDoc(adDocRef, { isActive: newStatus });

    setAdvertisements((prevAds) =>
      prevAds.map((adItem) =>
        adItem.id === ad.id ? { ...adItem, isActive: newStatus } : adItem
      )
    );
  };

  return (
    <div className="container mx-auto mt-8 p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-700">
        Vendor Dashboard
      </h2>

      <div className="mb-6">
        <table className="mt-4 w-full table-auto border-collapse overflow-hidden shadow-lg rounded-lg">
          <thead>
            <tr className="bg-[#056E55] text-white text-left">
              <th>Name</th>
              <th className="px-4 py-3">Advertisement</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Downloads</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {advertisements.map((ad) => (
              <tr key={ad.id}>
                <td>{ad.name}</td>
                <td>
                  {Array.isArray(ad.advertise) ? (
                    ad.advertise.map((item, idx) => (
                      // <p key={idx}>{item.advertise}</p>
                      <img src={item.advertise} alt="ImageUrl"  className="object-cover h-20 w-20 "/>
                    ))
                  ) : (
                    <p>{ad.advertise}</p> // If it's a string, render directly
                  )}
                </td>
                <td>State: {ad.location.state}, Cities: {ad.location.city.join(", ")}</td>


                <td>
                  {Array.isArray(ad.advertise) ? (
                    ad.advertise.map((item, idx) => (
                      // <p key={idx}>{item.advertise}</p>
                      <td>{item.downloads}</td>
                    ))
                  ) : (
                    <p>{0}</p> // If it's a string, render directly
                  )}
                </td>
                {/*  */}
                <td>
                  <button
                    onClick={() => toggleAdStatus(ad)}
                    className={`px-4 py-2 rounded-lg text-white ${
                      ad.isActive ? "bg-green-500" : "bg-red-500"
                    }`}
                  >
                    {ad.isActive ? "Active" : "Inactive"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageVendors;
