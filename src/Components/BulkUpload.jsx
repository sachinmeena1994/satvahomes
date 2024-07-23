import React, { useState } from 'react';
import Papa from 'papaparse';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const BulkUpload = () => {
  const [csvData, setCsvData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        setCsvData(results.data);
      },
    });
  };

  const handleImageFilesChange = (e) => {
    setImageFiles(Array.from(e.target.files));
  };

  const handleImageUpload = async () => {
    const storage = getStorage();
    const uploadedUrls = [];

    for (const imageFile of imageFiles) {
      const storageRef = ref(storage, `images/${Date.now()}-${imageFile.name}`);
      await uploadBytes(storageRef, imageFile);
      const downloadURL = await getDownloadURL(storageRef);
      uploadedUrls.push(downloadURL);
    }

    setImageUrls(uploadedUrls);
    alert('Images uploaded successfully!');
  };

  const handleInputChange = (index, key, value) => {
    const updatedData = [...csvData];
    updatedData[index][key] = value;
    setCsvData(updatedData);
  };

  const handleAddRow = () => {
    const newRow = {};
    if (csvData.length > 0) {
      Object.keys(csvData[0]).forEach((key) => {
        newRow[key] = '';
      });
    }
    setCsvData([...csvData, newRow]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const db = getFirestore();

    for (const product of csvData) {
      try {
        const materialInfo = {
          plywood18mm: product['18MM PLYWOOD'] || '',
          plywood12mm: product['12MM PLYWOOD'] || '',
          plywood8mm: product['8MM PLYWOOD'] || '',
          mdf3mm: product['3MM DECOLAM'] || '',
          hinges: product['HINGES'] || '',
          channels: product['CHANNELS'] || '',
          handles: product['HANDLES'] || '',
          beadingPatti: product['BEADING PATTI'] || '',
          legs: product['LEGS'] || '',
          profileDoorSize: product['PROFILE DOOR SIZE'] || '',
          mirrorSize: product['MIRROR SIZE'] || '',
          innerLaminate: product['INNER LAMINATE'] || '',
          externalLaminate1: product['EXTERNAL LAMINATE 1'] || '',
          externalLaminate2: product['EXTERNAL LAMINATE 2'] || '',
          externalLaminate3: product['EXTERNAL LAMINATE 3'] || '',
        };

        const productData = {
          name: product['UNIT NAME'],
          description: product['UNIT THEME'],
          productImages: product['@IMAGE COVER PAGE'] ? product['@IMAGE COVER PAGE'].split(';') : [],
          category: 'POOJA UNIT',
          pdfDetails: [
            {
              size: product['UNIT SIZE'],
              materialImage: null,
              pdfProductImage: product['@IMAGE FINAL OUTPUT'] || '',
              steps: Array.from({ length: 7 }, (_, i) => ({
                text: product[`STEP - ${i + 1}`] || '',
                image: product[`@IMAGE STEP ${i + 1}`] || '',
              })).filter(step => step.text || step.image),
              materialInfo,
            },
          ],
        };

        if (typeof productData.category !== 'string') {
          console.error('Invalid category:', productData.category);
          continue;
        }

        const categoryDocRef = doc(db, `products/POOJA UNIT`);
        const subCollectionRef = collection(categoryDocRef, productData.category);
        await setDoc(doc(subCollectionRef), productData);
      } catch (error) {
        console.error('Error uploading product:', error);
      }
    }

    setLoading(false);
    alert('Products uploaded successfully!');
  };

  const downloadTemplate = () => {
    const csvContent = `UNIT CODE,UNIT NAME,UNIT SIZE,UNIT THEME,@IMAGE COVER PAGE,STEP - 1,@IMAGE STEP 1,STEP - 2,@IMAGE STEP 2,STEP - 3,@IMAGE STEP 3,STEP - 4,@IMAGE STEP 4,STEP - 5,@IMAGE STEP 5,STEP - 6,@IMAGE STEP 6,STEP - 7,@IMAGE STEP 7,@IMAGE FINAL OUTPUT,18MM PLYWOOD,12MM PLYWOOD,8MM PLYWOOD,3MM DECOLAM,HINGES,CHANNELS,HANDLES,BEADING PATTI,LEGS,PROFILE DOOR SIZE,MIRROR SIZE,INNER LAMINATE,EXTERNAL LAMINATE 1,EXTERNAL LAMINATE 2,EXTERNAL LAMINATE 3\n`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container mx-auto mt-8 p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-700">Bulk Upload Products</h2>

      {/* Image Upload Section */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700">Upload Images:</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageFilesChange}
          className="mt-1 block w-full text-sm text-gray-500"
        />
        <button
          type="button"
          onClick={handleImageUpload}
          className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 mt-4"
          disabled={loading}
        >
          Upload Images
        </button>
        {imageUrls.length > 0 && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold text-gray-700">Uploaded Image URLs:</h3>
            <ul className="list-disc pl-5">
              {imageUrls.map((url, index) => (
                <li key={index} className="text-sm text-gray-600">
                  {url}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* CSV Upload Section */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700">Upload CSV:</label>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="mt-1 block w-full text-sm text-gray-500"
        />
        <button
          type="button"
          onClick={downloadTemplate}
          className="bg-gray-500 text-white px-4 py-2 rounded shadow hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 mt-4"
        >
          Download CSV Template
        </button>
      </div>

      {/* CSV Data Table */}
      {csvData.length > 0 && (
        <div className="overflow-x-auto mb-6">
          <table className="min-w-full bg-white border">
            <thead>
              <tr>
                {Object.keys(csvData[0]).map((key) => (
                  <th key={key} className="py-2 px-4 border-b text-left text-sm text-gray-700">
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {csvData.map((row, index) => (
                <tr key={index}>
                  {Object.keys(row).map((key) => (
                    <td key={key} className="py-2 px-4 border-b">
                      <input
                        type="text"
                        value={row[key]}
                        onChange={(e) => handleInputChange(index, key, e.target.value)}
                        className="w-full border-none focus:ring-0 text-sm text-gray-800"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <button
            type="button"
            onClick={handleAddRow}
            className="bg-green-500 text-white px-4 py-2 rounded shadow hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 mt-4"
          >
            Add Row
          </button>
        </div>
      )}

      {/* Submit Button */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded shadow hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
          disabled={loading}
        >
          {loading ? 'Uploading...' : 'Upload Products'}
        </button>
      </form>
    </div>
  );
};

export default BulkUpload;
