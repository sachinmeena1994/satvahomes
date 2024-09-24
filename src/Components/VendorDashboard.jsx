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
  const [newAd, setNewAd] = useState({
    name: "",
    advertise: "",
    location: { state: "", city: [] },
  });

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
      key_secret: "T3XWsJxig5vOcFLyh3BIFCHf", // Enter the Key ID generated from the Razorpay Dashboard
      amount: 1000 * 100, // Amount is in currency subunits. Default currency is INR. Hence, 1000 = 10 INR
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

  return (
    <div className="container mx-auto mt-8 p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-700">
        Vendor Dashboard
      </h2>
      <div className="mb-6">
        {advertisements.map((ad) => (
          <div key={ad.id} className="mb-4 p-4 bg-gray-100 rounded-lg">
            <h3 className="text-lg font-semibold">{ad.name}</h3>
            <p className="text-sm text-gray-600">{ad.advertise}</p>
            <div className="mt-2">
              <h4 className="text-sm font-semibold">Locations:</h4>
              <p className="text-sm text-gray-600">
                State: {ad.location.state}
              </p>
              <p className="text-sm text-gray-600">
                Cities: {ad.location.city.join(", ")}
              </p>
            </div>
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
                <textarea
                  placeholder="Advertisement"
                  value={editAd.advertise}
                  onChange={(e) =>
                    setEditAd({ ...editAd, advertise: e.target.value })
                  }
                  className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg shadow-sm border border-gray-300 focus:ring-primary-500 focus:border-primary-500 resize-none outline-none mb-4"
                />
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

      {/* Add New Advertisement */}
      {isAdding && (
        <div className="mt-8 p-6 bg-gray-100 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Add New Advertisement</h3>
          <input
            type="text"
            placeholder="Name"
            value={newAd.name}
            onChange={(e) => setNewAd({ ...newAd, name: e.target.value })}
            className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 outline-none mb-4"
          />
          <textarea
            placeholder="Advertisement"
            value={newAd.advertise}
            onChange={(e) => setNewAd({ ...newAd, advertise: e.target.value })}
            className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg shadow-sm border border-gray-300 focus:ring-primary-500 focus:border-primary-500 resize-none outline-none mb-4"
          />
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
          <button
            onClick={handlePayment}
            className="bg-[#056E55] text-white px-4 py-2 rounded-lg"
          >
            Add New Advertisement
          </button>
        </div>
      )}
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
          className="mt-4 bg-[#056E55] text-white px-4 py-2 rounded-lg"
        >
          Add New Advertisement
        </button>
      )}
    </div>
  );
};

export default VendorDashboard;
