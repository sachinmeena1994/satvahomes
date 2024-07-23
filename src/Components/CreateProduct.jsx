import React, { useState, useEffect } from 'react';
import { getFirestore, collection, doc, setDoc, getDocs } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const CreateProduct = () => {
  const [productDetails, setProductDetails] = useState({
    name: '',
    description: '',
    productImages: [],
    category: ''
  });
  const [categories, setCategories] = useState([]);
  const [pdfDetails, setPdfDetails] = useState([
    { size: 'small', materialInfo: {}, steps: [] },
    { size: 'medium', materialInfo: {}, steps: [] },
    { size: 'large', materialInfo: {}, steps: [] }
  ]);
  const [loading, setLoading] = useState(false);
  const [showPdfDetails, setShowPdfDetails] = useState(false);

  const materialKeys = [
    'plywood18mm', 'plywood12mm', 'plywood8mm', 'mdf3mm', 'hinges', 'channels', 'handles',
    'internalLaminate', 'externalLaminate1', 'externalLaminate2', 'externalLaminate3',
    'profileDoor', 'mirrorSize', 'legs'
  ];

  const materialDescriptions = {
    plywood18mm: 'sheets (use IS:710 MR Grade Plywood for more durability. IS:303 can also be used).',
    plywood12mm: 'sheet (*we can also use MDF/HDHMR sheets).',
    plywood8mm: 'sheet (*we can also use MDF/HDHMR sheets).',
    mdf3mm: 'sheet (optional).',
    hinges: 'sets (use soft closing hinges for smooth transition).',
    channels: 'sets (use telescopic soft-closing channels for smooth transition).',
    handles: 'no.',
    internalLaminate: 'sheets (use 0.8mm laminate sheets).',
    externalLaminate1: 'sheet (African desert matt finish). *we can use laminates / veneer / acrylic sheets etc., Select the external finish material according to budget.',
    externalLaminate2: 'sheets (Honey maple wood texture). *we can use laminates / veneer / acrylic sheets etc., Select the external finish material according to budget.',
    externalLaminate3: '(if any).',
    profileDoor: '(4 NO. (1\'X1\'6")).',
    mirrorSize: '(if any).',
    legs: '(if any).'
  };

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

  const handleProductImagesChange = (e) => {
    const files = Array.from(e.target.files);
    setProductDetails(prevDetails => ({ ...prevDetails, productImages: files }));
  };

  const handlePdfDetailImageChange = (field, file) => {
    setProductDetails(prevDetails => ({ ...prevDetails, [field]: file }));
  };

  const handleMaterialInfoChange = (size, fieldName, value) => {
    const newPdfDetails = [...pdfDetails];
    const pdfDetail = newPdfDetails.find(detail => detail.size === size);
    if (pdfDetail) {
      pdfDetail.materialInfo[fieldName] = {
        value: value >= 0 ? value : 0, // Prevent negative values
        description: materialDescriptions[fieldName]
      };
      setPdfDetails(newPdfDetails);
    }
  };

  const handleStepChange = (size, stepIndex, field, value) => {
    const newPdfDetails = [...pdfDetails];
    const pdfDetail = newPdfDetails.find(detail => detail.size === size);
    if (pdfDetail) {
      pdfDetail.steps[stepIndex][field] = value;
      setPdfDetails(newPdfDetails);
    }
  };

  const handleAddStep = (size) => {
    const newPdfDetails = [...pdfDetails];
    const pdfDetail = newPdfDetails.find(detail => detail.size === size);
    if (pdfDetail) {
      pdfDetail.steps.push({ text: '', image: null });
      setPdfDetails(newPdfDetails);
    }
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
    <div className="container mx-auto mt-8 p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-700">Create Product</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Product Name:</label>
          <input
            type="text"
            value={productDetails.name}
            onChange={(e) => setProductDetails({ ...productDetails, name: e.target.value })}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Description:</label>
          <textarea
            value={productDetails.description}
            onChange={(e) => setProductDetails({ ...productDetails, description: e.target.value })}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Product Images:</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleProductImagesChange}
            className="mt-1 block w-full text-sm text-gray-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Category:</label>
          <select
            value={productDetails.category}
            onChange={(e) => setProductDetails({ ...productDetails, category: e.target.value })}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select a category</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div>
          <button
            type="button"
            onClick={() => setShowPdfDetails(!showPdfDetails)}
            className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {showPdfDetails ? 'Hide PDF Details' : 'Show PDF Details'}
          </button>
          {showPdfDetails && (
            <div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">PDF Product Image:</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handlePdfDetailImageChange('pdfProductImage', e.target.files[0])}
                  className="mt-1 block w-full text-sm text-gray-500"
                />
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">Material Information:</label>
                <table className="mt-2 w-full">
                  <thead>
                    <tr>
                      <th className="border px-4 py-2">Material</th>
                      <th className="border px-4 py-2">Small</th>
                      <th className="border px-4 py-2">Medium</th>
                      <th className="border px-4 py-2">Large</th>
                      <th className="border px-4 py-2">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {materialKeys.map((material) => (
                      <tr key={material}>
                        <td className="border px-4 py-2">{material.toUpperCase().replace(/_/g, ' ')}</td>
                        <td className="border px-4 py-2">
                          <input
                            type="number"
                            value={pdfDetails[0].materialInfo[material]?.value || ''}
                            onChange={(e) => handleMaterialInfoChange('small', material, parseFloat(e.target.value))}
                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          />
                        </td>
                        <td className="border px-4 py-2">
                          <input
                            type="number"
                            value={pdfDetails[1].materialInfo[material]?.value || ''}
                            onChange={(e) => handleMaterialInfoChange('medium', material, parseFloat(e.target.value))}
                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          />
                        </td>
                        <td className="border px-4 py-2">
                          <input
                            type="number"
                            value={pdfDetails[2].materialInfo[material]?.value || ''}
                            onChange={(e) => handleMaterialInfoChange('large', material, parseFloat(e.target.value))}
                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          />
                        </td>
                        <td className="border px-4 py-2">{materialDescriptions[material]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {pdfDetails.map((pdfDetail) => (
                <div key={pdfDetail.size}>
                  <h3 className="mt-4 text-lg font-medium text-gray-700">{pdfDetail.size.charAt(0).toUpperCase() + pdfDetail.size.slice(1)} Size</h3>
                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={() => handleAddStep(pdfDetail.size)}
                      className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      Add Step
                    </button>
                    {pdfDetail.steps.map((step, stepIndex) => (
                      <div key={stepIndex} className="border p-4 mt-4 rounded-lg bg-white shadow-sm">
                        <div className="text-sm font-medium text-gray-700">Step {stepIndex + 1}</div>
                        <input
                          type="text"
                          value={step.text}
                          onChange={(e) => handleStepChange(pdfDetail.size, stepIndex, 'text', e.target.value)}
                          placeholder="Enter step text"
                          className="mt-2 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleStepChange(pdfDetail.size, stepIndex, 'image', e.target.files[0])}
                          className="mt-2 block w-full text-sm text-gray-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded shadow hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Product'}
        </button>
      </form>
    </div>
  );
};

export default CreateProduct;
