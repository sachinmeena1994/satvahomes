import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf'; 
import { auth, fireDB } from '../firebase-config'; // Assuming you have Firebase initialized in firebase-config.js
import { getFirestore, collection, getDocs, where, query } from 'firebase/firestore';

const PDFGeneratorForm = () => {
  const [productDetails, setProductDetails] = useState({
    name: '',
    size: '',
    image: null // For storing product image
  });

  const [materialDetails, setMaterialDetails] = useState({
    info: '',
    image: null // For storing material image
  });

  const [user, setUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [advertisementData, setAdvertisementData] = useState([]);
  const [steps, setSteps] = useState([]);

  useEffect(() => {
    const db = getFirestore();

    const fetchUserDetails = async () => {
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          setUser(currentUser);
          const q = query(collection(db, 'users'), where('id', '==', currentUser.uid));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            setUserDetails(userDoc.data());
            fetchAdvertisementData(userDoc.data());
          } else {
            console.log('User document not found.');
          }
        } else {
          setUser(null);
          setUserDetails(null);
          fetchAdvertisementData(null); // Call fetchAdvertisementData with null userDetails
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };

    const fetchAdvertisementData = async (userDetails) => {
      try {
        const advertisementCollection = collection(db, 'advertisement');
        let advertisementDataArray = [];
        if (userDetails && userDetails.location.city) {
          const cityQuery = query(advertisementCollection, where('location.city', 'array-contains', userDetails.location.city));
          const citySnapshot = await getDocs(cityQuery);
          advertisementDataArray = citySnapshot.docs.map(doc => doc.data());
        }
        if (advertisementDataArray.length === 0 && userDetails && userDetails.location.state) {
          const stateQuery = query(advertisementCollection, where('location.state', '==', userDetails.location.state));
          const stateSnapshot = await getDocs(stateQuery);
          advertisementDataArray = stateSnapshot.docs.map(doc => doc.data());
        }
        setAdvertisementData(advertisementDataArray);
      } catch (error) {
        console.error('Error fetching advertisement data:', error);
      }
    };

    fetchUserDetails();
  }, []);

  const handleProductImageChange = (event) => {
    const file = event.target.files[0];
    setProductDetails({ ...productDetails, image: file });
  };

  const handleMaterialImageChange = (event) => {
    const file = event.target.files[0];
    setMaterialDetails({ ...materialDetails, image: file });
  };

  const handleAddStep = () => {
    setSteps(prevSteps => [
      ...prevSteps,
      { text: '', image: null }
    ]);
  };
  
  const handleStepTextChange = (index, newText) => {
    setSteps(prevSteps => {
      const updatedSteps = [...prevSteps];
      updatedSteps[index].text = newText;
      return updatedSteps;
    });
  };
  
  const handleStepImageChange = (index, newImage) => {
    setSteps(prevSteps => {
      const updatedSteps = [...prevSteps];
      updatedSteps[index].image = newImage;
      return updatedSteps;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    const doc = new jsPDF({ orientation: 'portrait' });
  
    // Add product details to the first page
    doc.setFontSize(20);
    doc.text(20, 20, 'Product Details:');
    doc.setFontSize(12);
    doc.text(20, 30, `Name: ${productDetails.name}`);
    doc.text(20, 40, `Size: ${productDetails.size}`);
  
    // Add product image to the first page
    if (productDetails.image) {
      await addImageToDoc(productDetails.image, doc, 20, 50, 150, 100);
    }
  
    // Add material details to the second page
    doc.addPage();
    doc.setFontSize(20);
    doc.text(20, 20, 'Material Details:');
    doc.setFontSize(12);
    doc.text(20, 30, `Information: ${materialDetails.info}`);
  
    // Add material image to the second page
    if (materialDetails.image) {
      await addImageToDoc(materialDetails.image, doc, 20, 50, 150, 100);
    }
  
    // Add steps
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      doc.addPage();
      doc.setFontSize(20);
      doc.text(20, 20, `Step ${i + 1}: ${step.text}`);
  
      // Add step image
      if (step.image) {
        await addImageToDoc(step.image, doc, 20, 40, 150, 200);
      }

      // Add advertisement text
      const advertisement = advertisementData[0]; // Assuming userDetails contains the location information
      if (advertisement) {
          doc.setFontSize(12);
          doc.text(20, 260, advertisement.advertise); // Adjust the position as needed
      }
    }
  
    // Save the PDF document
    doc.save('interior_design_guide.pdf');
  };
  
  const addImageToDoc = (imageFile, doc, x, y, width, height) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(imageFile);
      reader.onloadend = () => {
        const img = new Image();
        img.src = reader.result;
        img.onload = () => {
          const aspectRatio = img.width / img.height;
          height = height || width / aspectRatio;
          doc.addImage(reader.result, 'JPEG', x, y, width, height);
          resolve();
        };
      };
    });
  };

  return (
    <div className="pdf-generator-form">
      <form onSubmit={handleSubmit}>
        {/* Product Details */}
        <div>
          <label>Product Name:</label>
          <input
            type="text"
            value={productDetails.name}
            onChange={(e) => setProductDetails({ ...productDetails, name: e.target.value })}
          />
        </div>
        <div>
          <label>Product Size:</label>
          <input
            type="text"
            value={productDetails.size}
            onChange={(e) => setProductDetails({ ...productDetails, size: e.target.value })}
          />
        </div>
        <div>
          <label>Product Image:</label>
          <input type="file" accept="image/*" onChange={handleProductImageChange} />
        </div>

        {/* Material Details */}
        <div>
          <label>Material Information:</label>
          <input
            type="text"
            value={materialDetails.info}
            onChange={(e) => setMaterialDetails({ ...materialDetails, info: e.target.value })}
          />
        </div>
        <div>
          <label>Material Image:</label>
          <input type="file" accept="image/*" onChange={handleMaterialImageChange} />
        </div>

        {/* Steps */}
        <div>
          <button type="button" onClick={handleAddStep}>Add Step</button>
          {steps.map((step, index) => (
            <div key={index}>
              <div>Step {index + 1}</div>
              <input
                type="text"
                value={step.text}
                onChange={e => handleStepTextChange(index, e.target.value)}
                placeholder="Enter step text"
              />
              <input
                type="file"
                accept="image/*"
                onChange={e => handleStepImageChange(index, e.target.files[0])}
                placeholder="Upload step image"
              />
            </div>
          ))}
        </div>

        <button type="submit">Generate PDF</button>
      </form>
    </div>
  );
};

export default PDFGeneratorForm;
