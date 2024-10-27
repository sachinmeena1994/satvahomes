import React, { useState, useEffect,useMemo } from "react";
import {
  collection,
  query,
  getDocs,
  where,
  addDoc,
  doc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

import { fireDB } from "../firebase-config";
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { useUser } from "../Context/Current-User-Context";
import Loader from '../Components/Loader'
import { districts } from "../state";
import { toast } from "react-toastify";
import CircularLoader from "../Components/CircularLoading";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];
const storage = getStorage();
const Vendor = () => {
  const [advertisements, setAdvertisements] = useState([]);
  const [selectedLegend, setSelectedLegend] = useState({});
  const { user } = useUser();
  const [expandedAdId, setExpandedAdId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState("");
  const [circularLoading, setcircularLoading] = useState(false);
  const [selectedCities, setSelectedCities] = useState([]);
  const [citiesInState, setCitiesInState] = useState([]);
  const [currentAd, setCurrentAd] = useState({
    id: "",
    name: "",
    advertise: "",
    adType: "",
    location: { state: "", city: [] },
  });

  const [deleteModalOpen, setDeleteModalOpen] = useState(false); // State to control delete modal visibility
const [adToDelete, setAdToDelete] = useState(null); // State to hold the selected ad to delete


const handleDeleteClick = (ad) => {
  setAdToDelete(ad);
  setDeleteModalOpen(true);
};


const confirmDeleteAd = async () => {
  setcircularLoading(true);
  try {
    const adsCollection = collection(fireDB, "advertisement");
    const q = query(adsCollection, where("email", "==", user.email));
    const adsSnapshot = await getDocs(q);

    if (!adsSnapshot.empty) {
      const userDocRef = adsSnapshot.docs[0].ref;
      const userAds = adsSnapshot.docs[0].data().advertisements || [];

      // Remove the ad from the advertisements array
      const updatedAdvertisements = userAds.filter(ad => ad.id !== adToDelete.id);

      // Update Firestore
      await updateDoc(userDocRef, { advertisements: updatedAdvertisements });
      setAdvertisements(updatedAdvertisements); // Update local state
      toast.success("Advertisement deleted successfully!");
      setcircularLoading(false);
    }
  } catch (error) {
    setcircularLoading(false);
    console.error("Error deleting advertisement:", error);
    toast.error("Failed to delete the advertisement.");
  }
  setDeleteModalOpen(false); // Close the modal
};


  useEffect(() => {
    if (state && districts[state]) {
      setCitiesInState(districts[state]);
    } else {
      setCitiesInState([]);
      setSelectedCities([]); // Clear selected cities when state changes
    }
  }, [state]);

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
        setLoading(false);
      }
    };
    fetchAdvertisements();
  }, [user,advertisements]);

  const initializeLegendSelection = (adsData) => {
    const legendState = {};
if(adsData.advertisement){
  adsData.forEach((ad) => {
    ad.advertisement.forEach((adItem) => {
      const label = `Ad Type ${adItem.adType}`;
      legendState[label] = true;
    });
  });
  setSelectedLegend(legendState);
}
  };

  const formatBarChartData = (downloads) => {
    if (!downloads || Object.keys(downloads).length === 0) {
      return []; // Return an empty array if no downloads data is available
    }
    return Object.entries(downloads).map(([city, count]) => ({
      city,
      count: parseInt(count, 10),
    }));
  };

  
  

  const getFilteredDownloadsData = () => {
    const totalDownloadsByAdType = {};
  
    advertisements.forEach((ad) => {
      if (ad.advertisements) { // Assuming 'advertisements' is the correct key
        ad.advertisements.forEach((adItem) => {
          const adTypeLabel = `Ad Type ${adItem.adType}`;
          
          // Sum downloads for each ad item
          const downloads = Object.values(adItem.downloads || {}).reduce(
            (total, count) => total + (parseInt(count, 10) || 0),
            0
          );
          
          // Accumulate downloads per ad type
          totalDownloadsByAdType[adTypeLabel] = (totalDownloadsByAdType[adTypeLabel] || 0) + downloads;
        });
      }
    });
  
    // Convert accumulated data into an array suitable for the Pie chart
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
    setState(ad.location?.state || ""); // Set initial state for modal based on current ad or default
    setSelectedCities(ad.location?.city || []); // Set initial selected cities if any
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
    setSelectedCities([]);
  };
// Function to handle saving or updating an advertisement
// Function to handle saving or updating an advertisement
const handleSaveAd = async () => {
  let adImageUrl = currentAd.advertise; // Keep existing image URL if already present

  // Upload new image only if a file object is in `currentAd.advertise`
  if (currentAd.advertise instanceof File) {
    setcircularLoading(true)
    try {
      const imageRef = ref(storage, `advertisements/${new Date().getTime()}_${currentAd.name}`);
      const uploadResult = await uploadBytes(imageRef, currentAd.advertise);
      adImageUrl = await getDownloadURL(uploadResult.ref);
    } catch (error) {
      console.error("Error uploading image or retrieving URL:", error);
      setcircularLoading(false)

      return; // Exit if there’s an error
    }
  }

  // Merge new selected cities with existing downloads, adding any new cities with count 0
  const updatedDownloads = { ...currentAd.downloads };
  selectedCities.forEach(city => {
    if (!updatedDownloads[city]) {
      updatedDownloads[city] = 0; // Initialize count for new cities
    }
  });

  const newAd = {
    id: editMode ? currentAd.id : new Date().getTime().toString(), // Use existing ID if editing
    name: currentAd.name,
    adType: currentAd.adType,
    advertise: adImageUrl,
    location: { state, city: selectedCities },
    downloads: updatedDownloads, // Use updated downloads with merged cities
    createdAt: new Date().toISOString(),
  };

  try {
    setcircularLoading(true)
    
    const adsCollection = collection(fireDB, "advertisement");
    const q = query(adsCollection, where("email", "==", user.email));
    const adsSnapshot = await getDocs(q);

    if (!adsSnapshot.empty) {
      const userDocRef = adsSnapshot.docs[0].ref;
      const userAds = adsSnapshot.docs[0].data().advertisements || [];

      let updatedAdvertisements;

      if (editMode) {
        // Replace the ad in the advertisements array if editing
        updatedAdvertisements = userAds.map(ad => ad.id === newAd.id ? newAd : ad);
      } else {
        // Add the new advertisement if not editing
        updatedAdvertisements = [...userAds, newAd];
      }

      // Update the document with the modified advertisements array
      await updateDoc(userDocRef, {
        advertisements: updatedAdvertisements,
      });

      // Update local state
      setAdvertisements(updatedAdvertisements);
    } else {
      // Add new document if no existing advertisements are found for the user
      await addDoc(adsCollection, {
        email: user.email,
        name: user.displayName || "Anonymous",
        isActive: true,
        advertisements: [newAd],
      });
      setAdvertisements((prev) => [...prev, newAd]);
    }

    toast.success("Advertisement saved successfully!");
      setcircularLoading(false)
      handleModalClose();
  } catch (error) {
    setcircularLoading(false)

    console.error("Error saving advertisement:", error);
    toast.error("Failed to save the advertisement.");
  }
};

// Commented out the payment function for later integration
// const handlePayment = async (adData) => {
//   const options = {
//     key: "rzp_live_L1Bw0era4Ek6O7",
//     key_secret: "T3XWsJxig5vOcFLyh3BIFCHf",
//     amount: payment * 100,
//     currency: "INR",
//     name: "Satva Home",
//     description: "Advertisement Fee",
//     handler: async function (response) {
//       const paymentId = response.razorpay_payment_id;
      
//       const adInfo = {
//         ...adData,
//         paymentId,
//         date: new Date().toLocaleString("en-US", {
//           month: "short",
//           day: "2-digit",
//           year: "numeric",
//         }),
//         status: "paid",
//       };

//       try {
//         if (editMode) {
//           const adDocRef = doc(fireDB, "advertisement", adInfo.id);
//           await updateDoc(adDocRef, adInfo);
//           setAdvertisements((prev) =>
//             prev.map((ad) => (ad.id === adInfo.id ? adInfo : ad))
//           );
//         } else {
//           const adRef = collection(fireDB, "advertisement");
//           const docRef = await addDoc(adRef, adInfo);
//           setAdvertisements([...advertisements, { ...adInfo, id: docRef.id }]);
//         }
//         handleModalClose();
//         toast.success("Advertisement added successfully");
//       } catch (error) {
//         console.error("Error saving advertisement:", error);
//       }
//     },
//     prefill: {
//       name: user?.displayName || "Vendor Name",
//       email: user?.email || "vendor@example.com",
//       contact: "9999999999",
//     },
//     theme: {
//       color: "#3399cc",
//     },
//   };

//   const rzp1 = new window.Razorpay(options);
//   rzp1.open();
// };

// Updated handlePayment function to handle payment and save ad on success
let payment =1
const handlePayment = async (adData) => {
  const options = {
    key: "rzp_live_L1Bw0era4Ek6O7",
    key_secret: "T3XWsJxig5vOcFLyh3BIFCHf",
    amount: payment * 100,
    currency: "INR",
    name: "Satva Home",
    description: "Advertisement Fee",
    handler: async function (response) {
      const paymentId = response.razorpay_payment_id;
      
      // Adding payment info to ad data
      const adInfo = {
        ...adData,
        paymentId,
        date: new Date().toLocaleString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        }),
        status: "paid",
      };

      try {
        // Save the advertisement only after successful payment
        if (editMode) {
          const adDocRef = doc(fireDB, "advertisement", adInfo.id);
          await updateDoc(adDocRef, adInfo);
          setAdvertisements((prev) =>
            prev.map((ad) => (ad.id === adInfo.id ? adInfo : ad))
          );
        } else {
          const adRef = collection(fireDB, "advertisement");
          const docRef = await addDoc(adRef, adInfo);
          setAdvertisements([...advertisements, { ...adInfo, id: docRef.id }]);
        }
        handleModalClose();
        toast.success("Advertisement added successfully");
      } catch (error) {
        console.error("Error saving advertisement:", error);
      }
    },
    prefill: {
      name: user?.displayName || "Vendor Name",
      email: user?.email || "vendor@example.com",
      contact: "9999999999",
    },
    theme: {
      color: "#3399cc",
    },
  };

  const rzp1 = new window.Razorpay(options);
  rzp1.open();
};

  const handleCitySelection = (event) => {
    const { value } = event.target;
    setSelectedCities((prevSelectedCities) =>
      prevSelectedCities.includes(value)
        ? prevSelectedCities.filter((city) => city !== value)
        : [...prevSelectedCities, value]
    );
  };

  if (loading) {
    return <Loader />;
  }
  if (circularLoading) {
    return <CircularLoader />; // Show circular loader during async operations
  }

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
        {ad.advertisements && ad.advertisements.map((adItem) => (
          <div key={adItem.id} className="bg-white shadow-md rounded-lg mb-4 p-4">
            {/* Ad Name as Card Title */}
            <h3 className="text-lg font-bold mb-2">{adItem.name}</h3>

            <div className="flex items-center justify-between mb-4">
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
                <button
  className="bg-red-500 text-white px-3 py-1 rounded"
  onClick={() => handleDeleteClick(adItem)} // Trigger delete confirmation
>
  Delete
</button>
              </div>
            </div>

            {/* Collapsible Section with Ad Type */}
           {/* Collapsible Section with Ad Type */}
{expandedAdId === adItem.id && (
  <div className="mt-4">
    <div className="flex items-center">
      {/* Display Image with Fixed Size */}
      <div className="w-1/2">
        <img
          src={adItem.advertise}
          alt={`Ad Type ${adItem.adType}`}
          className="w-full h-48 object-cover rounded"
          style={{ width: "100%", height: "150px" }}
        />
      </div>

      {/* Ad Type and Bar Chart */}
      <div className="w-1/2 ml-4">
        <p className="text-center font-bold mb-2">Ad Type: {adItem.adType}</p>
        <h4 className="text-center font-bold mb-2">Ad Downloads by City</h4>
        {adItem.downloads && Object.keys(adItem.downloads).length > 0 ? (
         <div className="w-full flex justify-center mt-4">
         <ResponsiveContainer width="90%" height={250}>
           <BarChart data={formatBarChartData(adItem.downloads)} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
             <CartesianGrid strokeDasharray="3 3" />
             <XAxis dataKey="city" tick={{ fontSize: 12 }} />
             <YAxis tick={{ fontSize: 12 }} />
             <Tooltip />
             <Bar dataKey="count" fill="#8884d8" />
           </BarChart>
         </ResponsiveContainer>
       </div>
        ) : (
          <p className="text-center text-gray-500">No downloads data available</p>
        )}
      </div>
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


      <div className="w-1/4 flex flex-col items-center">
        <h2 className="text-center font-bold mb-4">Total Downloads</h2>
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
      label={({ name, value }) => `${name}: ${value}`} // Add a label showing name and value
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
      style={{ fontSize: '20px', fill: '#333' }}
    >
      {`Total: ${getFilteredDownloadsData().reduce((acc, item) => acc + item.value, 0)}`}
    </text>
  </PieChart>
</ResponsiveContainer>

      </div>

      {isModalOpen && (
  <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-800 bg-opacity-75">
    <div className="bg-white p-8 rounded-xl w-1/3 shadow-2xl relative">
      <h3 className="text-2xl font-bold mb-6 text-gray-700 text-center">
        {editMode ? "Edit Advertisement" : "Add New Advertisement"}
      </h3>
      
      {/* Close Button */}
      <button
        onClick={handleModalClose}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition"
      >
        ✕
      </button>
      
      <input
        type="text"
        placeholder="Advertisement Name"
        value={currentAd.name}
        onChange={(e) => setCurrentAd({ ...currentAd, name: e.target.value })}
        className="w-full mb-4 p-3 border border-gray-300 rounded-lg bg-gray-100 focus:ring-2 focus:ring-blue-400 text-gray-700"
      />
      
      {/* Ad Type Dropdown */}
      <div className="mb-4">
        <label className="block mb-2 font-bold text-gray-600">Select Ad Type</label>
        <select
          className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 focus:ring-2 focus:ring-blue-400 text-gray-700"
          value={currentAd.adType}
          onChange={(e) => setCurrentAd({ ...currentAd, adType: e.target.value })}
        >
          <option value="">Select Ad Type</option>
          <option value="1">Ad Type 1</option>
          <option value="2">Ad Type 2</option>
          <option value="3">Ad Type 3</option>
          <option value="4">Ad Type 4</option>
        </select>
      </div>
      
      {/* State Selection */}
      <div className="mb-4">
        <label className="block mb-2 font-bold text-gray-600">Select State</label>
        <select
          className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 focus:ring-2 focus:ring-blue-400 text-gray-700"
          value={state}
          onChange={(e) => setState(e.target.value)}
        >
          <option value="">Select State</option>
          {Object.keys(districts).map((stateName) => (
            <option key={stateName} value={stateName}>
              {stateName}
            </option>
          ))}
        </select>
      </div>
      
      {/* Cities Selection */}
      <div className="mb-4">
        <label className="block mb-2 font-bold text-gray-600">Select Cities</label>
        <select
          className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 focus:ring-2 focus:ring-blue-400 text-gray-700"
          multiple
          value={selectedCities}
          onChange={handleCitySelection}
        >
          {citiesInState.map((cityName) => (
            <option key={cityName} value={cityName}>
              {cityName}
            </option>
          ))}
        </select>
      </div>
      
      {/* Display Selected Cities */}
      {selectedCities.length > 0 && (
        <div className="mb-4">
          <label className="block mb-2 font-bold text-gray-600">Selected Cities:</label>
          <div className="flex flex-wrap gap-2">
            {selectedCities.map((city) => (
              <span
                key={city}
                className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold"
              >
                {city}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {/* Image Upload */}
      <div className="mb-4">
  <label htmlFor="image-upload" className="block mb-2 font-bold text-gray-600">
    Advertisement Image
  </label>
  <div className="flex items-center justify-center h-24 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer transition">
    <input
      type="file"
      id="image-upload"
      onChange={(e) => {
        const file = e.target.files[0];
        if (file) {
          setCurrentAd((prev) => ({
            ...prev,
            advertise: file,  // Store the raw file object
          }));
        }
      }}
      className="hidden"
    />
    <label htmlFor="image-upload" className="text-gray-500 text-sm font-semibold">
      {currentAd.advertise ? "Image Selected" : "Click to Upload Image"}
    </label>
  </div>
</div>

      
      {/* Action Buttons */}
      <div className="flex justify-end gap-4 mt-6">
        <button
          onClick={handleModalClose}
          className="bg-gray-300 px-6 py-2 rounded-lg hover:bg-gray-400 transition text-gray-800 font-semibold"
        >
          Cancel
        </button>
        <button
          onClick={handleSaveAd}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
        >
          {editMode ? "Save Changes" : "Add Advertisement"}
        </button>
      </div>
    </div>
  </div>
)}

{deleteModalOpen && (
  <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-800 bg-opacity-75">
    <div className="bg-white p-8 rounded-xl w-1/3 shadow-2xl relative">
      <h3 className="text-2xl font-bold mb-6 text-gray-700 text-center">
        Confirm Deletion
      </h3>
      <p className="text-center mb-6">Are you sure you want to delete this advertisement?</p>
      <div className="flex justify-end gap-4">
        <button
          onClick={() => setDeleteModalOpen(false)} // Close modal on cancel
          className="bg-gray-300 px-6 py-2 rounded-lg hover:bg-gray-400 transition text-gray-800 font-semibold"
        >
          Cancel
        </button>
        <button
          onClick={confirmDeleteAd} // Confirm delete
          className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition font-semibold"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
)}




    </div>
  );
};

export default Vendor;
