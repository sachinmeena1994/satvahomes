import React, { useState } from "react";
import Papa from "papaparse";
import { v4 as uuidv4 } from 'uuid';
import { getFirestore, collection, doc, setDoc,updateDoc,arrayUnion } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useProductCategory } from "../Context/Product-Category-Context";
const BulkUpload = () => {
  const {categories} = useProductCategory()
  const [csvData, setCsvData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imageUploadsInProgress, setImageUploadsInProgress] = useState(false);
  const [selectedCategory, setProductDetails] = useState();
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        setCsvData(results.data);
      },
    });
  };

  const handleImageFilesChange = async (e, rowIndex) => {
    setImageUploadsInProgress(true);
    const files = Array.from(e.target.files);
    const storage = getStorage();
    const uploadedUrls = [];

    for (const file of files) {
      const storageRef = ref(storage, `images/${Date.now()}-${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      uploadedUrls.push({ name: file.name, url: downloadURL });
    }

    const updatedCsvData = [...csvData];
    const row = updatedCsvData[rowIndex];

    uploadedUrls.forEach((uploadedImage) => {
      const fileNameParts = uploadedImage.name.split(".");
      const imageType = fileNameParts[1]; // Extract the image type (e.g., IMAGE STEP 1)

      if (imageType === "IMAGE COVER PAGE") {
        row["@IMAGE COVER PAGE"] = uploadedImage.url;
      } else if (imageType === "IMAGE STEP 1") {
        row["@IMAGE STEP 1"] = uploadedImage.url;
      } else if (imageType === "IMAGE STEP 2") {
        row["@IMAGE STEP 2"] = uploadedImage.url;
      } else if (imageType === "IMAGE STEP 3") {
        row["@IMAGE STEP 3"] = uploadedImage.url;
      } else if (imageType === "IMAGE STEP 4") {
        row["@IMAGE STEP 4"] = uploadedImage.url;
      } else if (imageType === "IMAGE STEP 5") {
        row["@IMAGE STEP 5"] = uploadedImage.url;
      } else if (imageType === "IMAGE STEP 6") {
        row["@IMAGE STEP 6"] = uploadedImage.url;
      } else if (imageType === "IMAGE STEP 7") {
        row["@IMAGE STEP 7"] = uploadedImage.url;
      }
    });

    setCsvData(updatedCsvData);
    setImageUploadsInProgress(false); // Image upload completed
  };

  const handleInputChange = (index, key, value) => {
    const updatedData = [...csvData];
    updatedData[index][key] = value;
    setCsvData(updatedData);
  };

  const handleRemoveRow = (index) => {
    const updatedData = csvData.filter((_, rowIndex) => rowIndex !== index);
    setCsvData(updatedData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    const db = getFirestore();
  
    for (const product of csvData) {
      try {
        // Extract material information from CSV data
        const materialInfo = {
          plywood18mm: product["18MM PLYWOOD"] || "",
          plywood12mm: product["12MM PLYWOOD"] || "",
          plywood8mm: product["8MM PLYWOOD"] || "",
          mdf3mm: product["3MM DECOLAM"] || "",
          hinges: product["HINGES"] || "",
          channels: product["CHANNELS"] || "",
          handles: product["HANDLES"] || "",
          beadingPatti: product["BEADING PATTI"] || "",
          legs: product["LEGS"] || "",
          profileDoorSize: product["PROFILE DOOR SIZE"] || "",
          mirrorSize: product["MIRROR SIZE"] || "",
          innerLaminate: product["INNER LAMINATE"] || "",
          externalLaminate1: product["EXTERNAL LAMINATE 1"] || "",
          externalLaminate2: product["EXTERNAL LAMINATE 2"] || "",
          externalLaminate3: product["EXTERNAL LAMINATE 3"] || "",
        };
  
        // Prepare product data
        const productData = {
          id: uuidv4(), // Generate a unique ID for the product
          name: product["UNIT NAME"],
          description: product["UNIT THEME"],
          productImages: product["@IMAGE COVER PAGE"]
            ? product["@IMAGE COVER PAGE"].split(";")
            : [],
          category: selectedCategory, // Replace hardcoded value with dynamic selectedCategory
          pdfDetails: [
            {
              size: product["UNIT SIZE"],
              materialImage: null,
              pdfProductImage: product["@IMAGE FINAL OUTPUT"] || "",
              steps: Array.from({ length: 7 }, (_, i) => ({
                text: product[`STEP - ${i + 1}`] || "",
                image: product[`@IMAGE STEP ${i + 1}`] || "",
              })).filter((step) => step.text || step.image), // Filter out empty steps
              materialInfo,
            },
          ],
          productDisplay: false, // Ensure the display flag is added
        };
  
        // Reference to the category document
        const categoryDocRef = doc(db, `products/${selectedCategory}`);
  
        // Add product to the products array in the selected category document
        await updateDoc(categoryDocRef, {
          products: arrayUnion(productData), // Add the new product to the products array
        });
      } catch (error) {
        console.error("Error uploading product:", error);
      }
    }
  
    setLoading(false);
    alert("Products uploaded successfully!");
  };
  

  const downloadTemplate = () => {
    const csvContent = `UNIT CODE,UNIT NAME,UNIT SIZE,UNIT THEME,@IMAGE COVER PAGE,STEP - 1,@IMAGE STEP 1,STEP - 2,@IMAGE STEP 2,STEP - 3,@IMAGE STEP 3,STEP - 4,@IMAGE STEP 4,STEP - 5,@IMAGE STEP 5,STEP - 6,@IMAGE STEP 6,STEP - 7,@IMAGE STEP 7,@IMAGE FINAL OUTPUT,18MM PLYWOOD,12MM PLYWOOD,8MM PLYWOOD,3MM DECOLAM,HINGES,CHANNELS,HANDLES,BEADING PATTI,LEGS,PROFILE DOOR SIZE,MIRROR SIZE,INNER LAMINATE,EXTERNAL LAMINATE 1,EXTERNAL LAMINATE 2,EXTERNAL LAMINATE 3\n`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container mx-auto mt-8 p-6 bg-white shadow-lg rounded-lg max-w-4xl">
      <h2 className="text-3xl font-semibold mb-8 text-gray-800">Bulk Upload Products</h2>
  
      {/* Category Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select a Category *</label>
        <div className="shadow-sm border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500">
          <select
            value={selectedCategory}
            onChange={(e) => setProductDetails(e.target.value )}
            className="block w-full p-2.5 bg-gray-50 text-gray-900 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>
  
      {/* CSV Upload Section */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">Upload CSV *</label>
        <div className="flex items-center space-x-4">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 border border-gray-300 rounded-lg p-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="button"
            onClick={downloadTemplate}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg shadow hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Download Template
          </button>
        </div>
      </div>
  
      {/* CSV Data Table with Image Upload Option */}
      {csvData.length > 0 && (
        <div className="overflow-x-auto mb-6 border rounded-lg shadow-sm">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-200">
              <tr>
                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">Upload Images</th>
                {Object.keys(csvData[0]).map((key) => (
                  <th key={key} className="py-3 px-4 text-left text-sm font-semibold text-gray-700">
                    {key}
                  </th>
                ))}
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {csvData.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="py-2 px-6 border-t">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleImageFilesChange(e, index)}
                      className="block w-full text-sm text-gray-500 border border-gray-300 rounded-lg p-2 bg-white"
                    />
                  </td>
                  {Object.keys(row).map((key) => (
                    <td key={key} className="py-2 px-4 border-t">
                      <input
                        type="text"
                        value={row[key]}
                        onChange={(e) => handleInputChange(index, key, e.target.value)}
                        className="block w-full text-sm text-gray-800 border border-gray-200 rounded-lg p-2 bg-white focus:outline-none"
                      />
                    </td>
                  ))}
                  <td className="py-2 px-4 border-t">
                    <button
                      onClick={() => handleRemoveRow(index)}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg shadow hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
                    >
                      Remove Row
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
  
      {/* Submit Button */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <button
          type="submit"
          className="w-full bg-green-500 text-white py-3 rounded-lg shadow hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all duration-200"
          disabled={loading || imageUploadsInProgress}
        >
          {loading ? "Uploading..." : "Upload Products"}
        </button>
      </form>
    </div>
  );
  
};

export default BulkUpload;
