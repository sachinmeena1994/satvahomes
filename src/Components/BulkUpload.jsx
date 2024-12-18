import React, { useState, useMemo } from "react";
import { toast } from "react-toastify";
import Papa from "papaparse";
import { v4 as uuidv4 } from "uuid";
import { getFirestore, doc, writeBatch, arrayUnion } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import imageCompression from "browser-image-compression";
import { useProductCategory } from "../Context/Product-Category-Context";
import { MaterialReactTable } from "material-react-table";

const BulkUpload = () => {
  const { categories } = useProductCategory();
  const [csvData, setCsvData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imageUploadsInProgress, setImageUploadsInProgress] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [bulkDescription, setBulkDescription] = useState("");

  // Handle CSV File Upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        setCsvData(results.data);
      },
    });
  };

  // Handle image upload with compression and update corresponding columns
  const handleImageFilesChange = async (e, rowIndex) => {
    setImageUploadsInProgress(true);
    const files = Array.from(e.target.files);
    const storage = getStorage();

    // Compress and upload images
    const compressedFiles = await Promise.all(
      files.map((file) =>
        imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1024 })
      )
    );

    const uploadPromises = compressedFiles.map((file) => {
      const storageRef = ref(storage, `images/${Date.now()}-${file.name}`);
      return uploadBytes(storageRef, file).then((snapshot) =>
        getDownloadURL(snapshot.ref)
      );
    });

    try {
      const uploadedUrls = await Promise.all(uploadPromises);

      // Update the CSV data dynamically based on the number of images
      const updatedCsvData = [...csvData];
      const row = updatedCsvData[rowIndex];
      row["@IMAGE COVER PAGE"] = uploadedUrls[0] || "";

      // Dynamically add image steps based on the number of files
      uploadedUrls.slice(1).forEach((url, i) => {
        row[`@IMAGE STEP ${i + 1}`] = url;
      });

      setCsvData(updatedCsvData);
    } catch (error) {
      console.error("Error uploading images:", error);
    } finally {
      setImageUploadsInProgress(false);
    }
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
    updatedData.splice(rowIndex, 1);
    setCsvData(updatedData);
  };

  // Submit data to Firebase using batch writes
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCategory || !csvData || !bulkDescription) {
      alert("Please ensure Category, CSV file, and Description are provided.");
      return;
    }
    setLoading(true);

    const db = getFirestore();
    const batch = writeBatch(db);

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

        const steps = [];
        let stepIndex = 1;
        while (product[`STEP - ${stepIndex}`] || product[`@IMAGE STEP ${stepIndex}`]) {
          steps.push({
            text: product[`STEP - ${stepIndex}`] || "",
            image: product[`@IMAGE STEP ${stepIndex}`] || "",
          });
          stepIndex++;
        }

        const productData = {
          id: uuidv4(),
          name: product["UNIT NAME"],
          description: bulkDescription || product["UNIT THEME"],
          productImages: product["@IMAGE COVER PAGE"]
            ? product["@IMAGE COVER PAGE"].split(";")
            : [],
          category: selectedCategory,
          pdfDetails: [
            {
              size: product["UNIT SIZE"],
              materialImage: null,
              pdfProductImage: product["@IMAGE FINAL OUTPUT"] || "",
              steps,
              materialInfo,
            },
          ],
          productDisplay: false,
        };

        const categoryDocRef = doc(db, `products/${selectedCategory}`);
        batch.update(categoryDocRef, {
          products: arrayUnion(productData),
        });
      } catch (error) {
        console.error("Error preparing product for upload:", error);
      }
    }

    try {
      await batch.commit();
      alert("Products uploaded successfully!");
    } catch (error) {
      console.error("Error uploading products:", error);
    } finally {
      setLoading(false);
    }
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

    const imageUploadColumn = {
      accessorKey: "imageUpload",
      header: "Upload Image",
      Cell: ({ row }) => (
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleImageFilesChange(e, row.index)}
          className="w-full border-none focus:ring-0 text-sm text-gray-800"
        />
      ),
    };

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

    return [imageUploadColumn, ...dynamicColumns, removeColumn];
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

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select a Category *
        </label>
        <div className="shadow-sm border border-gray-300 pr-2 bg-gray-50 rounded-lg focus:ring-primary-500 focus:border-primary-500">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
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

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Bulk Description
        </label>
        <textarea
          placeholder="Enter a description that applies to all products"
          value={bulkDescription}
          onChange={(e) => setBulkDescription(e.target.value)}
          className="block w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg"
        />
      </div>

      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload CSV *
        </label>
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

      {csvData.length > 0 && (
        <MaterialReactTable columns={columns} data={csvData} enableColumnResizing />
      )}

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
