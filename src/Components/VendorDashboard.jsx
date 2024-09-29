import React, { useState, useEffect } from "react";
import {
  getFirestore,
  collection,
  query,
  getDocs,
  where,
  doc,
  updateDoc,
  addDoc,
} from "firebase/firestore";
import { toast } from "react-toastify";
import { fireDB, auth } from "../firebase-config";
import { districts } from "../state";

const VendorDashboard = () => {
  const [advertisements, setAdvertisements] = useState([]);

  const [newCity, setNewCity] = useState("");
  const [newState, setNewState] = useState("");
  const [cities, setCities] = useState([]);
  const [selectedAd, setSelectedAd] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editAd, setEditAd] = useState({
    id: "",
    name: "",
    advertise: "",
    location: { state: "", city: [] },
  });

  const tierOptions = {
    platinum: 40,
    gold: 30,
    silver: 20,
    bronze: 10,
  };
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedPlanToShow, setSelectedPlanToShow] = useState(null);
  const [showModal, setShowModal] = useState(false); // Modal visibility state

  const [newAd, setNewAd] = useState({
    name: "",
    advertise: "",
    location: { state: "", city: [] },
    tierValue: tierOptions.bronze,
  });
  const [payment, setPayment] = useState(0);


  useEffect(() => {
    const fetchAdvertisements = async () => {
      const user = auth.currentUser;
      if (user) {
        const adsCollection = collection(fireDB, "advertisement");
        const q = query(adsCollection, where("email", "==", user.email));
        const adsSnapshot = await getDocs(q);
        const adsData = adsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAdvertisements(adsData);
      }
    };

    fetchAdvertisements();
  }, []);

  useEffect(() => {
    if (newState) {
      setCities(districts[newState] || []);
    } else {
      setCities([]);
    }
  }, [newState]);

  useEffect(() => {
    if (editAd.location.state) {
      setCities(districts[editAd.location.state] || []);
    } else {
      setCities([]);
    }
  }, [editAd.location.state]);

  const handleUpdateAd = async () => {
    const adDocRef = doc(fireDB, "advertisement", editAd.id);

    await updateDoc(adDocRef, editAd);

    setAdvertisements((prevAds) =>
      prevAds.map((ad) => (ad.id === editAd.id ? editAd : ad))
    );

    setIsEditing(false);
    setSelectedAd(null);
    setEditAd({
      id: "",
      name: "",
      advertise: "",
      location: { state: "", city: [] },
    });

    toast.success("Advertisement updated successfully");
  };

  const handleEditAd = (ad) => {
    setEditAd({
      id: ad.id,
      name: ad.name,
      advertise: ad.advertise,
      location: ad.location,
    });
    setSelectedAd(ad.id);
    setIsEditing(true);
    setIsAdding(false);
  };

  const handlePayment = async () => {
    const options = {
      key: "rzp_live_L1Bw0era4Ek6O7",
      key_secret: "T3XWsJxig5vOcFLyh3BIFCHf",
      amount: payment * 100,
      currency: "INR",
      name: "Satva Home",
      description: "Advertisement Fee",
      handler: async function (response) {
        const paymentId = response.razorpay_payment_id;
        const user = auth.currentUser;

        const adInfo = {
          ...newAd,
          email: user.email,
          paymentId,
          date: new Date().toLocaleString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
          }),
          status: "paid",
        };

        try {
          const adRef = collection(fireDB, "advertisement");
          await addDoc(adRef, adInfo);

          setAdvertisements([...advertisements, adInfo]);

          setNewAd({
            name: "",
            advertise: "",
            location: { state: "", city: [] },
          });

          toast.success("Advertisement added successfully");
        } catch (error) {
          console.error("Error adding advertisement:", error);
        }
      },
      prefill: {
        name: "Vendor Name",
        email: "vendor@example.com",
        contact: "9999999999",
      },
      theme: {
        color: "#3399cc",
      },
    };

    const rzp1 = new window.Razorpay(options);
    rzp1.open();
  };

  const handleNewAdCityChange = (e) => {
    setNewAd({
      ...newAd,
      location: {
        ...newAd.location,
        city: e.target.value.split(","),
      },
    });
  };

  const handleEditAdCityChange = (e) => {
    setEditAd({
      ...editAd,
      location: {
        ...editAd.location,
        city: e.target.value.split(","),
      },
    });
  };

  // Function to handle input changes
  // const handleInputChange = (e) => {
  //   const { name, value } = e.target;
  //   setNewAd((prev) => ({ ...prev, [name]: value }));
  // };

  // Function to handle tier selection
  const handleTierChange = (e) => {
    const selectedTier = e.target.value;
    const value = tierOptions[selectedTier] || 0; // Default to 0 if no match
    setNewAd((prev) => ({ ...prev, tierValue: value }));
  };

  const plans = [
    {
      name: "Monthly",
      price: newAd.tierValue, // Monthly plan keeps the base price
      description: "Billed monthly",
    },
    {
      name: "Quarterly",
      price: (newAd.tierValue * 3 * 0.95).toFixed(2), // Quarterly plan with 5% discount
      description: "Billed every 3 months",
    },
    {
      name: "Yearly",
      price: (newAd.tierValue * 12 * 0.90).toFixed(2), // Yearly plan with 10% discount
      description: "Billed annually",
    },
  ];

  const handlePlanClick = (plan) => {
    setSelectedPlan(plan);
    setPayment(plan.price); // Update payment with selected plan's price
  };

  const handleModalClose = ()=>{
    setSelectedPlan(null);
    setSelectedPlanToShow(null);
    setPayment(null);
    setShowModal(false);
  }


  return (
    <div className="container mx-auto mt-8 p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-700">
        Vendor Dashboard
      </h2>

      {/* Add New Advertisement */}
      {isAdding && (
        <div className="mt-8 mb-10 p-6 bg-gray-100 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Add New Advertisement</h3>
          <input
            type="text"
            placeholder="Name"
            value={newAd.name}
            onChange={(e) => setNewAd({ ...newAd, name: e.target.value })}
            className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 outline-none mb-4"
          />
          <div className="pr-2 shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 outline-none mb-4">
            <select
              value={Object.keys(tierOptions).find((key) => tierOptions[key] === newAd.tierValue) || ""}
              onChange={handleTierChange}
              className="bg-gray-50 border-none text-gray-900 text-sm block w-full outline-none"
            >
              <option value="">Select Tier</option>
              {Object.entries(tierOptions).map(([tier, value]) => (
                <option key={tier} value={tier}>
                  {tier.charAt(0).toUpperCase() + tier.slice(1)}{" "}
                  {/* Capitalize the first letter */}
                </option>
              ))}
            </select>
          </div>
          {/* <textarea
            placeholder="Advertisement"
            value={newAd.advertise}
            onChange={(e) => setNewAd({ ...newAd, advertise: e.target.value })}
            className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg shadow-sm border border-gray-300 focus:ring-primary-500 focus:border-primary-500 resize-none outline-none mb-4"
          /> */}
          <div className="pr-2 shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 outline-none mb-4">
            <select
              value={newAd.location.state}
              onChange={(e) =>
                setNewAd({
                  ...newAd,
                  location: { ...newAd.location, state: e.target.value },
                })
              }
              className="bg-gray-50 border-none text-gray-900 text-sm block w-full outline-none"
            >
              <option value="">Select State</option>
              {Object.keys(districts).map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>

          <input
            type="text"
            placeholder="Cities (comma separated)"
            value={newAd.location.city.join(", ")}
            onChange={handleNewAdCityChange}
            className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 outline-none mb-4"
          />
          {/* Image Upload Section */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">
              Upload Advertisement Image
            </h3>
            <label
              htmlFor="image-upload"
              className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 transition duration-200 ease-in-out"
            >
              {newAd.advertise ? (
                <img
                  src={newAd.advertise}
                  alt="Preview"
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <span className="text-gray-500">
                  Drag and drop or click to upload an image
                </span>
              )}
              <input
                type="file"
                id="image-upload"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setNewAd((prev) => ({
                        ...prev,
                        advertise: reader.result,
                      }));
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="hidden" // Hide the default file input
              />
            </label>
          </div>
          
          <button
            onClick={() => {
              setShowModal(true); // Open the modal
            }}
            className="bg-[#056E55] text-white px-4 py-2 rounded-lg"
          >
            Add New Advertisement
          </button>
          
        </div>
        
      )}
      {/* Modal for Subscription Plans */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-fit">
            <div className="layout-container w-full flex h-full grow flex-col">
              <header className="flex items-center justify-center whitespace-nowrap pt-3">
                <h1 className="text-3xl leading-none tracking-tighter font-bold text-[#1C160C]">
                  Choose Your Subscription Plan
                </h1>
              </header>
              <div className="px-10 flex flex-1 justify-center pb-0">
                <div className="layout-content-container flex flex-col w-full py-5">
                  <div className="flex gap-3 px-0 py-3">
                    {plans.map((plan, index) => (
                      <div
                        key={plan.name}
                        className={`flex gap-4 rounded-xl border border-solid border-[#E9DFCE] p-6 transition-transform duration-300 hover:shadow-lg hover:scale-105 ${selectedPlanToShow === index ? 'bg-[#25a283] text-white' : 'bg-white text-[#1C160C]'}`}
                        onClick={() => handlePlanClick(plan)}
                      >
                        <div className="flex flex-col gap-0">
                          <h2 className="text-md font-bold leading-tight">{plan.name}</h2>
                          <p className="flex flex-col items-baseline gap-1">
                            <span className="text-5xl font-black leading-tight">₹{plan.price}</span>
                            <span className="text-md font-medium leading-tight">{plan.description}</span>
                          </p>
                        </div>
                        <button
                          className={`min-w-[84px] cursor-pointer flex items-center justify-center h-10 px-4 rounded-full ${selectedPlanToShow === index ? 'bg-[#0E6D55] text-white' : 'bg-[#F4EFE6] text-[#1C160C]'}`}
                          onClick={() => setSelectedPlanToShow(index)}
                        >
                          <span>{selectedPlanToShow === index ? 'Selected' : 'Select'}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-center mt-6">
                    <div className="flex gap-2">
                      <button
                        className="flex min-w-[84px] cursor-pointer items-center justify-center h-10 px-16 bg-[#F4EFE6] text-[#1C160C] text-sm font-bold leading-normal rounded-full"
                        onClick={handleModalClose}
                      >
                        <span>Cancel</span>
                      </button>
                      <button
                        className={`${payment==null?"bg-[#0e6d55c3]":"bg-[#0E6D55]"} flex min-w-[84px] cursor-pointer items-center justify-center h-10 px-16  text-white text-sm font-bold leading-normal rounded-full`}
                        onClick={handlePayment}
                        disabled={!payment}
                      >
                        <span>Subscribe</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Button to toggle add new advertisement form */}
      {!isAdding && (
        <button
          onClick={() => {
            setIsAdding(true);
            setIsEditing(false);
            setEditAd({
              id: "",
              name: "",
              advertise: "",
              location: { state: "", city: [] },
            });
          }}
          className="mt-4 mb-10 bg-[#056E55] text-white px-4 py-2 rounded-lg"
        >
          Add New Advertisement
        </button>
      )}

      {/* Display existing advertisements */}
      <div className="mb-6">
        {advertisements.map((ad) => (
          <div key={ad.id} className="mb-4 p-4 bg-gray-100 rounded-lg">
            <h3 className="text-lg font-semibold">{ad.name}</h3>

            {/* Check if the ad is a URL or just text and render accordingly */}
            {Array.isArray(ad.advertise) ? (
              ad.advertise.map((adItem, index) => (
                <div key={index}>
                  {typeof adItem.advertise === "string" &&
                  adItem.advertise.startsWith("http") ? (
                    <img
                      src={adItem.advertise}
                      alt={`Advertisement ${index + 1}`}
                      className="w-full h-auto rounded mt-2"
                    />
                  ) : (
                    <p className="text-sm text-gray-600">{adItem.advertise}</p>
                  )}
                </div>
              ))
            ) : typeof ad.advertise === "string" &&
              ad.advertise.startsWith("http") ? (
              <img
                src={ad.advertise}
                alt={ad.name}
                className="w-full h-auto rounded mt-2"
              />
            ) : (
              <p className="text-sm text-gray-600">{ad.advertise}</p>
            )}

            {/* Location details */}
            <div className="mt-2">
              <h4 className="text-sm font-semibold">Locations:</h4>
              <p className="text-sm text-gray-600">State: {ad.location.state}</p>
              <p className="text-sm text-gray-600">
                Cities: {ad.location.city.join(", ")}
              </p>
            </div>

            {/* Editing an advertisement */}
            {selectedAd === ad.id && isEditing && (
              <div className="mt-4">
                <input
                  type="text"
                  placeholder="Name"
                  value={editAd.name}
                  onChange={(e) =>
                    setEditAd({ ...editAd, name: e.target.value })
                  }
                  className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 outline-none mb-4"
                />
                {/* <textarea
                  placeholder="Advertisement"
                  value={editAd.advertise}
                  onChange={(e) => setEditAd({ ...editAd, advertise: e.target.value })}
                  onChange={(e) => setEditAd({ ...editAd, advertise: e.target.value })}
                  className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg shadow-sm border border-gray-300 focus:ring-primary-500 focus:border-primary-500 resize-none outline-none mb-4"
                /> */}
                <div className="pr-2 shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 outline-none mb-4">
                  <select
                    value={editAd.location.state}
                    onChange={(e) =>
                      setEditAd({
                        ...editAd,
                        location: { ...editAd.location, state: e.target.value },
                      })
                    }
                    className="bg-gray-50 border-none text-gray-900 text-sm block w-full outline-none"
                  >
                    <option value="">Select State</option>
                    {Object.keys(districts).map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>
  
                <input
                  type="text"
                  placeholder="Cities (comma separated)"
                  value={editAd.location.city.join(", ")}
                  onChange={handleEditAdCityChange}
                  className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 outline-none mb-4"
                />
                <button
                  onClick={handleUpdateAd}
                  className="bg-green-500 text-white px-4 py-2 rounded mb-2"
                >
                  Update Advertisement
                </button>
              </div>
            )}

            {/* Button to edit an advertisement */}
            {(!isEditing || selectedAd !== ad.id) && (
              <button
                onClick={() => handleEditAd(ad)}
                className="mt-4 bg-[#056E55] text-white px-4 py-2 rounded-lg"
              >
                Edit Advertisement
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
  
};

export default VendorDashboard;
