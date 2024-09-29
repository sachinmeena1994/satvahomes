import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';
import {
  getFirestore,
  doc,
  updateDoc,
  arrayUnion
} from "firebase/firestore";
import { useProductCategory } from "../Context/Product-Category-Context";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const CreateProduct = () => {
  const { categories } = useProductCategory();
  const [selectedCategory, setSelectedCategory] = useState("");
  const [productDetails, setProductDetails] = useState({
    name: "",
    description: "",
    productImages: [],
    category: "",
    unitCode: "", // Added for Unit Code
    theme: "", // Added for Theme
  });

  const [pdfDetails, setPdfDetails] = useState([
    { size: "small", materialInfo: {}, steps: [] },
    { size: "medium", materialInfo: {}, steps: [] },
    { size: "large", materialInfo: {}, steps: [] },
  ]);
  const [loading, setLoading] = useState(false);
  const [showPdfDetails, setShowPdfDetails] = useState(false);

  const materialKeys = [
    "plywood18mm",
    "plywood12mm",
    "plywood8mm",
    "mdf3mm",
    "hinges",
    "channels",
    "handles",
    "internalLaminate",
    "externalLaminate1",
    "externalLaminate2",
    "externalLaminate3",
    "profileDoor",
    "mirrorSize",
    "legs",
  ];

  const materialDescriptions = {
    plywood18mm:
      "sheets (use IS:710 MR Grade Plywood for more durability. IS:303 can also be used).",
    plywood12mm: "sheet (*we can also use MDF/HDHMR sheets).",
    plywood8mm: "sheet (*we can also use MDF/HDHMR sheets).",
    mdf3mm: "sheet (optional).",
    hinges: "sets (use soft closing hinges for smooth transition).",
    channels:
      "sets (use telescopic soft-closing channels for smooth transition).",
    handles: "no.",
    internalLaminate: "sheets (use 0.8mm laminate sheets).",
    externalLaminate1:
      "sheet (African desert matt finish). *we can use laminates / veneer / acrylic sheets etc., Select the external finish material according to budget.",
    externalLaminate2:
      "sheets (Honey maple wood texture). *we can use laminates / veneer / acrylic sheets etc., Select the external finish material according to budget.",
    externalLaminate3: "(if any).",
    profileDoor: "(4 NO. (1'X1'6\")).",
    mirrorSize: "(if any).",
    legs: "(if any).",
  };

  const handleProductImagesChange = (e) => {
    const files = Array.from(e.target.files);
    setProductDetails((prevDetails) => ({
      ...prevDetails,
      productImages: files,
    }));
  };

  const handlePdfDetailImageChange = (field, file) => {
    setProductDetails((prevDetails) => ({ ...prevDetails, [field]: file }));
  };

  const handleMaterialInfoChange = (size, fieldName, value) => {
    const newPdfDetails = [...pdfDetails];
    const pdfDetail = newPdfDetails.find((detail) => detail.size === size);
    if (pdfDetail) {
      pdfDetail.materialInfo[fieldName] = {
        value: value >= 0 ? value : 0, // Prevent negative values
        description: materialDescriptions[fieldName],
      };
      setPdfDetails(newPdfDetails);
    }
  };

  const handleStepChange = (size, stepIndex, field, value) => {
    const newPdfDetails = [...pdfDetails];
    const pdfDetail = newPdfDetails.find((detail) => detail.size === size);
    if (pdfDetail) {
      pdfDetail.steps[stepIndex][field] = value;
      setPdfDetails(newPdfDetails);
    }
  };

  const handleAddStep = (size) => {
    const newPdfDetails = [...pdfDetails];
    const pdfDetail = newPdfDetails.find((detail) => detail.size === size);
    if (pdfDetail) {
      pdfDetail.steps.push({ text: "", image: null });
      setPdfDetails(newPdfDetails);
    }
  };

  const handleRemoveStep = (size, stepIndex) => {
    const newPdfDetails = [...pdfDetails];
    const pdfDetail = newPdfDetails.find((detail) => detail.size === size);
    if (pdfDetail) {
      pdfDetail.steps.splice(stepIndex, 1); // Remove the step at the given index
      setPdfDetails(newPdfDetails);
    }
  };

  const uploadImage = async (image) => {
    const storage = getStorage();
    const storageRef = ref(storage, `images/${uuidv4()}_${image.name}`);
    await uploadBytes(storageRef, image);
    return getDownloadURL(storageRef);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const db = getFirestore();
    const productData = { ...productDetails, productImages: [] };
    const pdfData = [...pdfDetails];

    // Upload product images
    for (const image of productDetails.productImages) {
      const imageUrl = await uploadImage(image);
      productData.productImages.push(imageUrl);
    }

    // Upload PDF step images
    for (let i = 0; i < pdfData.length; i++) {
      for (let j = 0; j < pdfData[i].steps.length; j++) {
        if (pdfData[i].steps[j].image) {
          pdfData[i].steps[j].image = await uploadImage(pdfData[i].steps[j].image);
        }
      }
    }

    // Add the product data into the array inside the category document
    const categoryDocRef = doc(db, `products/${selectedCategory}`);
    const productId = uuidv4();

    try {
      await updateDoc(categoryDocRef, {
        products: arrayUnion({
          id: productId,
          ...productData,
          pdfDetails: pdfData,
          productDisplay: false,
        }),
      });
      setLoading(false);
      alert("Product added successfully!");
    } catch (error) {
      setLoading(false);
      console.error("Error adding product: ", error);
      alert("Error adding product.");
    }
  };

  return (
    <div className="container mx-auto mt-8 p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-700">Create Product</h2>
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Product Name */}
        <div>
          <label className="block mb-2 text-sm font-medium text-zinc-700">
            Product Name
          </label>
          <input
            type="text"
            placeholder="Enter Product Name"
            value={productDetails.name}
            onChange={(e) =>
              setProductDetails({ ...productDetails, name: e.target.value })
            }
            className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 outline-none"
          />
        </div>

        {/* Unit Code */}
        <div>
          <label className="block mb-2 text-sm font-medium text-zinc-700">
            Unit Code
          </label>
          <input
            type="text"
            placeholder="Enter Unit Code"
            value={productDetails.unitCode}
            onChange={(e) =>
              setProductDetails({ ...productDetails, unitCode: e.target.value })
            }
            className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 outline-none"
          />
        </div>

        {/* Theme */}
        <div>
          <label className="block mb-2 text-sm font-medium text-zinc-700">
            Theme
          </label>
          <input
            type="text"
            placeholder="Enter Theme"
            value={productDetails.theme}
            onChange={(e) =>
              setProductDetails({ ...productDetails, theme: e.target.value })
            }
            className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 outline-none"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block mb-2 text-sm font-medium text-zinc-700">
            Description
          </label>
          <textarea
            placeholder="Enter Product Description here"
            value={productDetails.description}
            onChange={(e) =>
              setProductDetails({
                ...productDetails,
                description: e.target.value,
              })
            }
            rows="6"
            className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg shadow-sm border border-gray-300 focus:ring-primary-500 focus:border-primary-500 resize-none outline-none"
          />
        </div>

        {/* Product Images */}
        <div>
          <label className="block mb-2 text-sm font-medium text-zinc-700">
            Product Images
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleProductImagesChange}
            className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#056e55d3] file:text-[white] file:duration-500 hover:file:bg-[#056E55]"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block mb-2 text-sm font-medium text-zinc-700">
            Category
          </label>
          <div className="pr-2 shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 outline-none">
            <select
              value={productDetails.category}
              onChange={(e) => {
                setProductDetails({
                  ...productDetails,
                  category: e.target.value,
                });
                setSelectedCategory(e.target.value);
              }}
              className="bg-gray-50 border-none text-gray-900 text-sm block w-full outline-none"
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id} id={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* PDF Details Toggle */}
        <div className="">
          <button
            type="button"
            onClick={() => setShowPdfDetails(!showPdfDetails)}
            className="bg-[#056E55] mb-3 text-white px-4 py-2 rounded-lg shadow duration-300 hover:bg-[#174f41]"
          >
            {showPdfDetails ? "Hide PDF Details" : "Show PDF Details"}
          </button>
          {showPdfDetails && (
            <div>
              {/* PDF Product Image */}
              <div className="mt-4">
                <label className="block mb-2 text-sm font-medium text-zinc-700">
                  PDF Product Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handlePdfDetailImageChange(
                      "pdfProductImage",
                      e.target.files[0]
                    )
                  }
                  className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#056e55d3] file:text-[white] file:duration-500 hover:file:bg-[#056E55]"
                />
              </div>

              {/* Material Information */}
              <div className="mt-8">
                <label className="block mb-3 text-sm font-medium text-zinc-700">
                  Material Information
                </label>

                <table className="mt-4 w-full table-auto border-collapse overflow-hidden shadow-lg rounded-lg">
                  <thead>
                    <tr className="bg-[#056E55] text-white text-left">
                      <th className="px-4 py-3">Material</th>
                      <th className="px-4 py-3">Small</th>
                      <th className="px-4 py-3">Medium</th>
                      <th className="px-4 py-3">Large</th>
                      <th className="px-4 py-3">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {materialKeys.map((material, index) => (
                      <tr
                        key={material}
                        className={`${
                          index % 2 === 0 ? "bg-white" : "bg-white"
                        } hover:bg-gray-200 transition-colors duration-150`}
                      >
                        <td className="border-t border-gray-300 px-4 py-3">
                          {material.toUpperCase().replace(/_/g, " ")}
                        </td>
                        <td className="border-t border-gray-300 px-4 py-3">
                          <input
                            type="text"
                            value={
                              pdfDetails[0].materialInfo[material]?.value || ""
                            }
                            onChange={(e) =>
                              handleMaterialInfoChange(
                                "small",
                                material,
                                e.target.value
                              )
                            }
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          />
                        </td>
                        <td className="border-t border-gray-300 px-4 py-3">
                          <input
                            type="text"
                            value={
                              pdfDetails[1].materialInfo[material]?.value || ""
                            }
                            onChange={(e) =>
                              handleMaterialInfoChange(
                                "medium",
                                material,
                                e.target.value
                              )
                            }
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          />
                        </td>
                        <td className="border-t border-gray-300 px-4 py-3">
                          <input
                            type="text"
                            value={
                              pdfDetails[2].materialInfo[material]?.value || ""
                            }
                            onChange={(e) =>
                              handleMaterialInfoChange(
                                "large",
                                material,
                                e.target.value
                              )
                            }
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          />
                        </td>
                        <td className="border-t border-gray-300 px-4 py-3">
                          {materialDescriptions[material]}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Steps for each size */}
              {pdfDetails.map((pdfDetail) => (
                <div key={pdfDetail.size}>
                  <h3 className="mt-6 block text-sm font-medium text-zinc-700">
                    {pdfDetail.size.charAt(0).toUpperCase() +
                      pdfDetail.size.slice(1)}{" "}
                    Size
                  </h3>
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={() => handleAddStep(pdfDetail.size)}
                      className="bg-[#056E55] mb-3 text-white px-4 py-2 rounded-lg shadow duration-300 hover:bg-[#174f41]"
                    >
                      Add Step
                    </button>
                    {pdfDetail.steps.map((step, stepIndex) => (
                      <div
                        key={stepIndex}
                        className="border border-gray-300 p-6 mt-4 rounded-lg bg-white shadow-md transition-shadow duration-300 hover:shadow-lg"
                      >
                        <div className="text-sm font-medium text-gray-700 mb-2">
                          Step {stepIndex + 1}
                        </div>
                        <input
                          type="text"
                          value={step.text}
                          onChange={(e) =>
                            handleStepChange(
                              pdfDetail.size,
                              stepIndex,
                              "text",
                              e.target.value
                            )
                          }
                          placeholder="Enter step text"
                          className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 outline-none mb-4"
                        />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleStepChange(
                              pdfDetail.size,
                              stepIndex,
                              "image",
                              e.target.files[0]
                            )
                          }
                          className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#056e55c7] file:text-[white] file:duration-500 hover:file:bg-[#056E55]"
                        />
                        {/* Remove Step button */}
                        <button
                          type="button"
                          onClick={() =>
                            handleRemoveStep(pdfDetail.size, stepIndex)
                          }
                          className="mt-2 bg-red-500 text-white px-4 py-2 rounded-lg shadow hover:bg-red-600 duration-300"
                        >
                          Remove Step
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="bg-[#1AC096] duration-300 text-white px-4 py-2 rounded-lg shadow hover:bg-[#169E7C] outline-none"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Product"}
        </button>
      </form>
    </div>
  );
};

export default CreateProduct;
