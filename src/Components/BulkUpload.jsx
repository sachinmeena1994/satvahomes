import React, { useState, useMemo } from "react";
import Papa from "papaparse";
import { v4 as uuidv4 } from 'uuid';
import { getFirestore, doc, updateDoc, arrayUnion } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useProductCategory } from "../Context/Product-Category-Context";
import { MaterialReactTable } from "material-react-table";

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

  // Remove a row from the table
  const handleRemoveRow = (rowIndex) => {
    const updatedData = [...csvData];
    updatedData.splice(rowIndex, 1); // Remove the row at the given index
    setCsvData(updatedData); // Update the state
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

    // Add the Remove button column as the last column
    const removeColumn = {
      accessorKey: "remove",
      header: "Remove",
      Cell: ({ row }) => (
        <button
          onClick={() => handleRemoveRow(row.index)}
          className="bg-red-500 text-white px-3 py-1 rounded-lg shadow hover:bg-red-600"
        >
          Remove
        </button>
      ),
    };

    return [...dynamicColumns, removeColumn]; // Ensure Remove column is last
  }, [csvData]);

  // Download sample CSV template
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
    <div className="container mt-3 p-6 bg-white shadow-lg rounded-lg max-w-4xl">
      <h2 className="text-3xl font-semibold mb-8 text-gray-800">Bulk Upload Products</h2>

      {/* Category Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select a Category *</label>
        <div className="shadow-sm border border-gray-300 pr-2 bg-gray-50 rounded-lg focus:ring-primary-500 focus:border-primary-500">
          <select
            value={selectedCategory}
            onChange={(e) => setProductDetails(e.target.value)}
            className="block w-full p-2.5 bg-gray-50 text-gray-900 rounded-lg border-none focus:outline-none"
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
            className="file:bg-transparent file:border-none shadow-sm bg-gray-50 border h-12 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 outline-none"
          />
          <button
            type="button"
            onClick={downloadTemplate}
            className="bg-[#009B64] text-white px-4 py-3 whitespace-nowrap rounded-lg shadow duration-300 hover:bg-[#174f41]"
          >
            Download Template
          </button>
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
          className="bg-[#009B64] text-white px-4 py-2 whitespace-nowrap rounded-lg shadow duration-300 hover:bg-[#174f41]"
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
