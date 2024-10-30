import React, { useState, useEffect } from "react";
import { getDocs, collection, doc, updateDoc } from "firebase/firestore";
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
      <h2 className="text-2xl font-bold mb-6 text-gray-700">Vendor Dashboard</h2>

      <div className="mb-6">
        <table className="mt-4 w-full table-auto border-collapse overflow-hidden shadow-lg rounded-lg">
          <thead>
            <tr className="bg-[#056E55] text-white text-left pl-2">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Advertisement</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Downloads</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {advertisements.map((ad) => (
              <tr key={ad.id} className="text-left border-b">
                <td className="pl-4 py-3">{ad.name}</td>
                
                {/* Advertisement Images */}
                <td className="flex flex-wrap gap-2">
                  {Array.isArray(ad.advertisements) && ad.advertisements.length > 0 ? (
                    ad.advertisements.map((item, idx) => (
                      <img
                        key={idx}
                        src={item.advertise}
                        alt={item.name || `Ad ${idx + 1}`}
                        className="object-cover m-1 h-20 w-20"
                      />
                    ))
                  ) : (
                    <p>No advertisement available</p>
                  )}
                </td>

                {/* Location */}
                <td className="pl-4">
                  <p>State: {ad.location?.state}</p>
                  <p>Cities: {ad.location?.city?.join(", ") || "N/A"}</p>
                </td>

                {/* Downloads */}
                <td className="pl-5">
                  {ad.advertisements && Array.isArray(ad.advertisements) && ad.advertisements.length > 0 ? (
                    ad.advertisements.map((item, idx) => (
                      <p key={idx}>
                        {Object.entries(item.downloads || {}).map(([city, count]) => (
                          <span key={city}>
                            {city}: {count}{" "}
                          </span>
                        ))}
                      </p>
                    ))
                  ) : (
                    <p>No downloads</p>
                  )}
                </td>

                {/* Status */}
                <td>
                  <button
                    onClick={() => toggleAdStatus(ad)}
                    className={`px-4 py-2 rounded-lg text-white ${
                      ad.isActive ? "bg-green-500" : "bg-gray-400"
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
