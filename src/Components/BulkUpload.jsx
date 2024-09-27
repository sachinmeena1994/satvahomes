import React, { useState, useMemo } from "react";
import Papa from "papaparse";
import { v4 as uuidv4 } from 'uuid';
import { getFirestore, doc, updateDoc, arrayUnion } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useProductCategory } from "../Context/Product-Category-Context";
import {MaterialReactTable} from "material-react-table";

const BulkUpload = () => {
  const { categories } = useProductCategory();
  const [csvData, setCsvData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imageUploadsInProgress, setImageUploadsInProgress] = useState(false);
  const [selectedCategory, setProductDetails] = useState("");

  // Handle CSV File Upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        setCsvData(results.data); // Store parsed CSV data
      },
    });
  };

  // Handle image upload and update corresponding columns
  const handleImageFilesChange = async (e, rowIndex) => {
    setImageUploadsInProgress(true);
    const files = Array.from(e.target.files);
    const storage = getStorage();
    const uploadedUrls = [];

    for (const file of files) {
      const storageRef = ref(storage, `images/${Date.now()}-${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      uploadedUrls.push(downloadURL); // Push the download URL to the list
    }

    // Assign uploaded URLs to corresponding columns
    const updatedCsvData = [...csvData];
    const row = updatedCsvData[rowIndex];

    uploadedUrls.forEach((url, i) => {
      if (i === 0) {
        row["@IMAGE COVER PAGE"] = url; // Assign the first image to @IMAGE COVER PAGE
      } else {
        row[`@IMAGE STEP ${i}`] = url; // Assign remaining images to @IMAGE STEP X
      }
    });

    setCsvData(updatedCsvData);
    setImageUploadsInProgress(false); // Image upload completed
  };

  // Handle table input changes
  const handleInputChange = (rowIndex, key, value) => {
    const updatedData = [...csvData];
    updatedData[rowIndex][key] = value;
    setCsvData(updatedData);
  };

  // Submit data to Firebase
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const db = getFirestore();

    for (const product of csvData) {
      try {
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

        const productData = {
          id: uuidv4(),
          name: product["UNIT NAME"],
          description: product["UNIT THEME"],
          productImages: product["@IMAGE COVER PAGE"] ? product["@IMAGE COVER PAGE"].split(";") : [],
          category: selectedCategory,
          pdfDetails: [
            {
              size: product["UNIT SIZE"],
              materialImage: null,
              pdfProductImage: product["@IMAGE FINAL OUTPUT"] || "",
              steps: Array.from({ length: 7 }, (_, i) => ({
                text: product[`STEP - ${i + 1}`] || "",
                image: product[`@IMAGE STEP ${i + 1}`] || "",
              })).filter((step) => step.text || step.image),
              materialInfo,
            },
          ],
          productDisplay: false,
        };

        const categoryDocRef = doc(db, `products/${selectedCategory}`);
        await updateDoc(categoryDocRef, {
          products: arrayUnion(productData),
        });
      } catch (error) {
        console.error("Error uploading product:", error);
      }
    }

    setLoading(false);
    alert("Products uploaded successfully!");
  };

  // Define columns for MaterialReactTable
  const columns = useMemo(() => {
    const baseColumns = [
      {
        accessorKey: "@IMAGE COVER PAGE",
        header: "Upload Images",
        Cell: ({ row }) => (
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleImageFilesChange(e, row.index)}
            className="block w-full text-sm text-gray-500 border border-gray-300 rounded-lg p-2 bg-white"
          />
        ),
      },
    ];

    const dynamicColumns = Object.keys(csvData[0] || {}).map((key) => ({
      accessorKey: key,
      header: key,
      Cell: ({ row }) => (
        <input
          type="text"
          value={row.original[key]}
          onChange={(e) => handleInputChange(row.index, key, e.target.value)}
          className="w-full border-none focus:ring-0 text-sm text-gray-800"
        />
      ),
    }));

    return [...baseColumns, ...dynamicColumns];
  }, [csvData]);

  return (
    <div className="container mx-auto mt-8 p-6 bg-white shadow-lg rounded-lg max-w-4xl">
      <h2 className="text-3xl font-semibold mb-8 text-gray-800">Bulk Upload Products</h2>

      {/* Category Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select a Category *</label>
        <div className="shadow-sm border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500">
          <select
            value={selectedCategory}
            onChange={(e) => setProductDetails(e.target.value)}
            className="block w-full p-2.5 bg-gray-50 text-gray-900 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="-1">Select a category</option>
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
            className="block w-full text-sm text-gray-500 border border-gray-300 rounded-lg p-2 bg-white"
          />
        </div>
      </div>

      {/* Display Data Table */}
      {csvData.length > 0 && (
        <MaterialReactTable columns={columns} data={csvData} enableColumnResizing />
      )}

      {/* Submit Button */}
      <div className="mt-6">
        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded-lg shadow hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
          disabled={loading}
          onClick={handleSubmit}
        >
          {loading ? "Uploading..." : "Upload Products"}
        </button>
      </div>
    </div>
  );
};

export default BulkUpload;
