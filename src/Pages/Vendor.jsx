import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  getDocs,
  where,
  addDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { fireDB } from "../firebase-config";
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { useUser } from "../Context/Current-User-Context";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const Vendor = () => {
  const [advertisements, setAdvertisements] = useState([]);
  const [selectedLegend, setSelectedLegend] = useState({});
  const { user } = useUser();
  const [expandedAdId, setExpandedAdId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentAd, setCurrentAd] = useState({
    id: "",
    name: "",
    advertise: "",
    adType: "",
    location: { state: "", city: [] },
  });

  useEffect(() => {
    const fetchAdvertisements = async () => {
      if (user) {
        const adsCollection = collection(fireDB, "advertisement");
        const q = query(adsCollection, where("email", "==", user.email));
        const adsSnapshot = await getDocs(q);
        const adsData = adsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAdvertisements(adsData);
        initializeLegendSelection(adsData);
      }
    };
    fetchAdvertisements();
  }, [user]);

  const initializeLegendSelection = (adsData) => {
    const legendState = {};
    adsData.forEach((ad) => {
      ad.advertise.forEach((adItem) => {
        const label = `Ad Type ${adItem.adType}`;
        legendState[label] = true;
      });
    });
    setSelectedLegend(legendState);
  };

  const formatBarChartData = (downloads) => {
    return Object.entries(downloads).map(([city, count]) => ({
      city,
      count: parseInt(count, 10),
    }));
  };

  const getFilteredDownloadsData = () => {
    const totalDownloadsByAdType = {};
    advertisements.forEach((ad) => {
      ad.advertise.forEach((adItem) => {
        const adTypeLabel = `Ad Type ${adItem.adType}`;
        const downloads = Object.values(adItem.downloads || {}).reduce(
          (total, count) => total + parseInt(count, 10),
          0
        );
        totalDownloadsByAdType[adTypeLabel] = (totalDownloadsByAdType[adTypeLabel] || 0) + downloads;
      });
    });
    return Object.entries(totalDownloadsByAdType).map(([name, value]) => ({ name, value }));
  };

  const toggleCardExpand = (adId) => {
    setExpandedAdId(expandedAdId === adId ? null : adId);
  };

  const handleAddEditAd = (ad = {}) => {
    setEditMode(!!ad.id);
    setCurrentAd(ad.id ? ad : {
      id: "",
      name: "",
      advertise: "",
      adType: "",
      location: { state: "", city: [] },
    });
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setCurrentAd({
      id: "",
      name: "",
      advertise: "",
      adType: "",
      location: { state: "", city: [] },
    });
  };

  const handleSaveAd = async () => {
    try {
      if (editMode) {
        const adDocRef = doc(fireDB, "advertisement", currentAd.id);
        await updateDoc(adDocRef, currentAd);
        setAdvertisements((prev) =>
          prev.map((ad) => (ad.id === currentAd.id ? currentAd : ad))
        );
      } else {
        const newAdData = { ...currentAd, email: user.email };
        const adRef = collection(fireDB, "advertisement");
        const docRef = await addDoc(adRef, newAdData);
        setAdvertisements([...advertisements, { ...newAdData, id: docRef.id }]);
      }
      handleModalClose();
    } catch (error) {
      console.error("Error saving ad:", error);
    }
  };

  return (
    <div className="container mx-auto mt-6 p-4 flex">
      <div className="w-3/4">
        <h2 className="text-2xl font-bold mb-6">Vendor Dashboard</h2>
        
        <button
          onClick={() => handleAddEditAd()}
          className="bg-blue-500 text-white px-4 py-2 rounded mb-6"
        >
          Add New Advertisement
        </button>
        
        {advertisements.length > 0 ? (
          advertisements.map((ad) => (
            <div key={ad.id} className="mb-6">
              <h3 className="text-lg font-bold mb-2">{ad.name}</h3>

              {ad.advertise.map((adItem) => (
                <div key={adItem.id} className="bg-white shadow-md rounded-lg mb-4 p-4">
                  <div className="flex items-center justify-between mb-4">
                    <p className="font-semibold">Ad Type: {adItem.adType}</p>
                    <div>
                      <button
                        className="bg-green-500 text-white px-3 py-1 rounded mr-2"
                        onClick={() => toggleCardExpand(adItem.id)}
                      >
                        {expandedAdId === adItem.id ? "Collapse" : "Expand"}
                      </button>
                      <button
                        className="bg-yellow-500 text-white px-3 py-1 rounded mr-2"
                        onClick={() => handleAddEditAd(adItem)}
                      >
                        Edit
                      </button>
                    </div>
                  </div>

                  {expandedAdId === adItem.id && (
                    <div className="mt-4 flex items-center">
                      <div className="w-1/2">
                        <img
                          src={adItem.advertise}
                          alt={`Ad Type ${adItem.adType}`}
                          className="w-full h-32 object-cover rounded"
                          style={{ width: "100%", height: "150px" }}
                        />
                      </div>
                      <div className="w-1/2 ml-4">
                        <h4 className="text-center font-bold mb-2">Ad Downloads by City</h4>
                        <BarChart
                          width={300}
                          height={150}
                          data={formatBarChartData(adItem.downloads)}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="city" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" fill="#8884d8" />
                        </BarChart>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))
        ) : (
          <p>No advertisements found</p>
        )}
      </div>

      <div className="w-1/4 flex justify-center items-center">
        <ResponsiveContainer width={400} height={400}>
          <PieChart>
            <Pie
              data={getFilteredDownloadsData()}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={100}
              outerRadius={150}
              fill="#8884d8"
              label={false}
            >
              {getFilteredDownloadsData().map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend
              payload={getFilteredDownloadsData().map((entry, index) => ({
                id: entry.name,
                type: "square",
                value: entry.name,
                color: COLORS[index % COLORS.length],
                inactive: !selectedLegend[entry.name],
              }))}
            />
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-lg font-semibold"
              style={{ fontSize: '28px', fill: '#333' }}
            >
              {`Total: ${getFilteredDownloadsData().reduce((acc, item) => acc + item.value, 0)}`}
            </text>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg w-1/3">
            <h3 className="text-lg font-semibold mb-4">
              {editMode ? "Edit Advertisement" : "Add New Advertisement"}
            </h3>
            <input
              type="text"
              placeholder="Name"
              value={currentAd.name}
              onChange={(e) =>
                setCurrentAd({ ...currentAd, name: e.target.value })
              }
              className="w-full mb-4 p-2 border rounded"
            />
            <input
              type="text"
              placeholder="Ad Type"
              value={currentAd.adType}
              onChange={(e) =>
                setCurrentAd({ ...currentAd, adType: e.target.value })
              }
              className="w-full mb-4 p-2 border rounded"
            />
            <input
              type="text"
              placeholder="State"
              value={currentAd.location.state}
              onChange={(e) =>
                setCurrentAd({
                  ...currentAd,
                  location: { ...currentAd.location, state: e.target.value },
                })
              }
              className="w-full mb-4 p-2 border rounded"
            />
            <input
              type="text"
              placeholder="Cities (comma separated)"
              value={currentAd.location.city.join(", ")}
              onChange={(e) =>
                setCurrentAd({
                  ...currentAd,
                  location: { ...currentAd.location, city: e.target.value.split(",") },
                })
              }
              className="w-full mb-4 p-2 border rounded"
            />
            <label htmlFor="image-upload" className="block mb-2 font-medium">
              Advertisement Image
            </label>
            <input
              type="file"
              id="image-upload"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setCurrentAd((prev) => ({
                      ...prev,
                      advertise: reader.result,
                    }));
                  };
                  reader.readAsDataURL(file);
                }
              }}
              className="w-full mb-4"
            />
            <div className="flex justify-end gap-4">
              <button
                onClick={handleModalClose}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAd}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                {editMode ? "Save Changes" : "Add Advertisement"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vendor;
