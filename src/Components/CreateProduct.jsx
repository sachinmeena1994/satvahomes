import React, { useState, useEffect } from 'react';
import { getFirestore, collection, doc, setDoc, getDocs } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const CreateProduct = () => {
  const [productDetails, setProductDetails] = useState({
    name: '',
    description: '',
    productImages: []
  });
  const [categories, setCategories] = useState([]);
  const [pdfDetails, setPdfDetails] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      const db = getFirestore();
      const categoriesCollection = collection(db, 'products');
      const categoriesSnapshot = await getDocs(categoriesCollection);
      const categoriesData = categoriesSnapshot.docs.map(doc => doc.id);
      setCategories(categoriesData);
    };

    fetchCategories();
  }, []);

  const handleImageChange = (e, field) => {
    const file = e.target.files[0];
    setProductDetails(prevDetails => ({ ...prevDetails, [field]: file }));
  };

  const handleProductImagesChange = (e) => {
    const files = Array.from(e.target.files);
    setProductDetails(prevDetails => ({ ...prevDetails, productImages: files }));
  };

  const handleAddPdfDetails = () => {
    setPdfDetails(prevDetails => [...prevDetails, { size: '', materialImage: null, pdfProductImage: null, steps: [] }]);
  };

  const handlePdfDetailChange = (index, field, value) => {
    const newPdfDetails = [...pdfDetails];
    newPdfDetails[index][field] = value;
    setPdfDetails(newPdfDetails);
  };

  const handlePdfDetailImageChange = (index, field, file) => {
    const newPdfDetails = [...pdfDetails];
    newPdfDetails[index][field] = file;
    setPdfDetails(newPdfDetails);
  };

  const handleAddStep = (pdfIndex) => {
    const newPdfDetails = [...pdfDetails];
    newPdfDetails[pdfIndex].steps.push({ text: '', image: null });
    setPdfDetails(newPdfDetails);
  };

  const handleStepChange = (pdfIndex, stepIndex, field, value) => {
    const newPdfDetails = [...pdfDetails];
    newPdfDetails[pdfIndex].steps[stepIndex][field] = value;
    setPdfDetails(newPdfDetails);
  };

  const uploadImage = async (image) => {
    const storage = getStorage();
    const storageRef = ref(storage, `images/${image.name}`);
    await uploadBytes(storageRef, image);
    return getDownloadURL(storageRef);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const db = getFirestore();
    const productData = { ...productDetails, productImages: [] };
    const pdfData = [...pdfDetails];

    for (const image of productDetails.productImages) {
      const imageUrl = await uploadImage(image);
      productData.productImages.push(imageUrl);
    }

    for (let i = 0; i < pdfData.length; i++) {
      if (pdfData[i].materialImage) {
        pdfData[i].materialImage = await uploadImage(pdfData[i].materialImage);
      }
      if (pdfData[i].pdfProductImage) {
        pdfData[i].pdfProductImage = await uploadImage(pdfData[i].pdfProductImage);
      }
      for (let j = 0; j < pdfData[i].steps.length; j++) {
        if (pdfData[i].steps[j].image) {
          pdfData[i].steps[j].image = await uploadImage(pdfData[i].steps[j].image);
        }
      }
    }

    const categoryDocRef = doc(db, `products/${productDetails.category}`);
    const subCollectionRef = collection(categoryDocRef, productDetails.category);
    await setDoc(doc(subCollectionRef), {
      ...productData,
      pdfDetails: pdfData,
    });

    setLoading(false);
    alert('Product created successfully!');
  };

  return (
    <div className="container mx-auto mt-8">
      <h2 className="text-lg font-semibold mb-4">Create Product</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label>Product Name:</label>
          <input
            type="text"
            value={productDetails.name}
            onChange={(e) => setProductDetails({ ...productDetails, name: e.target.value })}
            className="border rounded p-2 w-full"
          />
        </div>
        <div>
          <label>Description:</label>
          <textarea
            value={productDetails.description}
            onChange={(e) => setProductDetails({ ...productDetails, description: e.target.value })}
            className="border rounded p-2 w-full"
          />
        </div>
        <div>
          <label>Product Images:</label>
          <input type="file" accept="image/*" multiple onChange={handleProductImagesChange} />
        </div>
        <div>
          <label>Category:</label>
          <select
            value={productDetails.category}
            onChange={(e) => setProductDetails({ ...productDetails, category: e.target.value })}
            className="border rounded p-2 w-full"
          >
            <option value="">Select a category</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        {/* PDF Details */}
        <div>
          <button type="button" onClick={handleAddPdfDetails} className="bg-blue-500 text-white px-4 py-2 rounded">
            Add PDF Details
          </button>
          {pdfDetails.map((pdfDetail, index) => (
            <div key={index} className="border p-4 mt-2">
              <div>
                <label>Size:</label>
                <input
                  type="text"
                  value={pdfDetail.size}
                  onChange={(e) => handlePdfDetailChange(index, 'size', e.target.value)}
                  className="border rounded p-2 w-full"
                />
              </div>
              <div>
                <label>Material Image:</label>
                <input type="file" accept="image/*" onChange={(e) => handlePdfDetailImageChange(index, 'materialImage', e.target.files[0])} />
              </div>
              <div>
                <label>PDF Product Image:</label>
                <input type="file" accept="image/*" onChange={(e) => handlePdfDetailImageChange(index, 'pdfProductImage', e.target.files[0])} />
              </div>
              {/* Steps */}
              <div>
                <button type="button" onClick={() => handleAddStep(index)} className="bg-blue-500 text-white px-4 py-2 rounded mt-2">
                  Add Step
                </button>
                {pdfDetail.steps.map((step, stepIndex) => (
                  <div key={stepIndex} className="border p-4 mt-2">
                    <div>Step {stepIndex + 1}</div>
                    <input
                      type="text"
                      value={step.text}
                      onChange={(e) => handleStepChange(index, stepIndex, 'text', e.target.value)}
                      placeholder="Enter step text"
                      className="border rounded p-2 w-full"
                    />
                    <input type="file" accept="image/*" onChange={(e) => handleStepChange(index, stepIndex, 'image', e.target.files[0])} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded" disabled={loading}>
          {loading ? 'Creating...' : 'Create Product'}
        </button>
      </form>
    </div>
  );
};

export default CreateProduct;
