import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getFirestore, doc, getDoc, collection, getDocs } from "firebase/firestore";
import { PDFDocument, rgb } from "pdf-lib";
import Loader from "../Components/Loader";

function ProductCard() {
  const { category, productId } = useParams();
  const [product, setProduct] = useState(null);
  const [advertisementData, setAdvertisementData] = useState([]);
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedOption, setSelectedOption] = useState("");
  const [loading, setLoading] = useState(true);
  const [showFullDescription, setShowFullDescription] = useState(false); // To toggle description display
  const options = ["30", "50", "60"]; // Example options for dimensions

  // Fetch product and advertisement data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const db = getFirestore();
        const productDocRef = doc(db, `products/${category}/${category}/${productId}`);
        const productDoc = await getDoc(productDocRef);

        if (productDoc.exists()) {
          const productData = productDoc.data();
          setProduct(productData);
          if (productData.productImages && productData.productImages.length > 0) {
            setSelectedImage(productData.productImages[0]);
          }
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchAdvertisementData = async () => {
      try {
        const db = getFirestore();
        const advertisementCollection = collection(db, "advertisement");
        const advertisementSnapshot = await getDocs(advertisementCollection);
        const advertisementDataArray = advertisementSnapshot.docs.map(doc => doc.data());
        setAdvertisementData(advertisementDataArray);
      } catch (error) {
        console.error("Error fetching advertisement data:", error);
      }
    };

    if (category && productId) {
      fetchProduct();
      fetchAdvertisementData();
    }
  }, [category, productId]);

  const handleDownloadPDF = async () => {
    try {
      setLoading(true);
      const templateUrl = '/TEMPLATE.pdf'; // Update this to the correct URL for your PDF template
      const response = await fetch(templateUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch PDF template: ${response.statusText}`);
      }
      const existingPdfBytes = await response.arrayBuffer();

      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const newPdfDoc = await PDFDocument.create();

      const addPageWithTemplate = async () => {
        const [templatePage] = await newPdfDoc.copyPages(pdfDoc, [0]);
        newPdfDoc.addPage(templatePage);
        return newPdfDoc.getPage(newPdfDoc.getPageCount() - 1);
      };

      let currentPage = await addPageWithTemplate();

      const addText = (text, x, y, fontSize = 12, lineHeight = 1.2) => {
    
        
          currentPage.drawText(text, { x, y, size: fontSize, color: rgb(0, 0, 0), maxWidth: 200 });
        
      };
      

      const addImage = async (imageUrl, x, y, width, height) => {
        try {
          const imgResponse = await fetch(imageUrl);
          const imgBytes = await imgResponse.arrayBuffer();
          const mimeType = imgResponse.headers.get('content-type');

          let img;
          if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') {
            img = await newPdfDoc.embedJpg(imgBytes);
          } else if (mimeType === 'image/png') {
            img = await newPdfDoc.embedPng(imgBytes);
          } else {
            throw new Error('Unsupported image format');
          }
          currentPage.drawImage(img, { x, y, width, height });
        } catch (error) {
          console.error(`Error embedding image from URL ${imageUrl}:`, error);
        }
      };

      // First page: Product image and basic details
      if (product && product.productImages && product.productImages.length > 0) {
        await addImage(product.productImages[0], 50, 100, 700, 600);
      }
      // addText(`Name: ${product.name}`, 100, 150, 20);
      // addText(`Description: ${product.description}`, 0, 100, 10);

      // Add footer with UNIT NAME on the first page
      addText(`${product.name}`, 85, 30, 12);

      // Second page: Material information in table format
      currentPage = await addPageWithTemplate();
      let yPosition = 550;
      addText("Material Information", 350, yPosition, 20);
      yPosition -= 30;

      const materialInfo = product.pdfDetails[0].materialInfo;
      let tableStartX = 20;
      let tableStartY = yPosition;
      let tableWidth = 800;
      let rowHeight = 15;
      let tableHeight = rowHeight * Object.keys(materialInfo).length;

      // Draw table borders and headers
      currentPage.drawRectangle({
        x: tableStartX,
        y: tableStartY - tableHeight - 10,
        width: tableWidth,
        height: tableHeight + rowHeight,
        borderColor: rgb(0, 0.6, 0), // Green color
        borderWidth: 2,
      });

      yPosition = tableStartY - rowHeight;

      // Draw table rows
      Object.keys(materialInfo).forEach(key => {
        addText(key.replace(/([A-Z])/g, ' $1').toUpperCase(), tableStartX + 5, yPosition);
        addText(materialInfo[key].value ? materialInfo[key].value.toString() : '', tableStartX + tableWidth / 2 + 5, yPosition);
        yPosition -= rowHeight;
      });

      // Add the biggest advertisement at the bottom of the material information page
      const addBigBottomAd = (page, adText) => {
        page.drawRectangle({
          x: 20,
          y: 80,
          width: 800,
          height: 200,
          borderColor: rgb(0, 0.6, 0), // Green color
          borderWidth: 2,
        });
        page.drawText(adText, {
          x: 100,
          y: 140,
          size: 12,
          color: rgb(0, 0, 0),
          maxWidth: 480,
        });
      };

      addBigBottomAd(currentPage, advertisementData[0] ? advertisementData[0].advertise : "Put your ads here");

      // Remaining pages: Steps
      if (product.pdfDetails[0].steps && product.pdfDetails[0].steps.length > 0) {
        for (let i = 0; i < product.pdfDetails[0].steps.length; i++) {
          const step = product.pdfDetails[0].steps[i];
          currentPage = await addPageWithTemplate();
          yPosition = 700;
          addText(`Step ${i + 1}: ${step.text}`, 570, 500, 10 );
          yPosition -= 40;
          if (step.image) {
            await addImage(step.image, 50, 180, 500, 380);
            yPosition -= 320;
          }
        }
      }

      const addRightSideAd = (page, adText) => {
        page.drawRectangle({
          x: 560,
          y: 180,
          width: 250,
          height: 400,
          borderColor: rgb(0, 0.6, 0), // Green color
          borderWidth: 2,
        });
        page.drawText(adText, {
          x: 570,
          y: 240,
          size: 12,
          color: rgb(0, 0, 0),
          maxWidth: 200,
        });
      };

      const addBottomAd = (page, adText) => {
        page.drawRectangle({
          x: 50,
          y: 70,
          width: 600,
          height: 100,
          borderColor: rgb(0, 0.6, 0), // Green color
          borderWidth: 2,
        });
        page.drawText(adText, {
          x: 100,
          y: 120,
          size: 12,
          color: rgb(0, 0, 0),
          maxWidth: 480,
        });
      };

      // Add advertisements on each page except the first and the material information page
      for (let i = 2; i < newPdfDoc.getPageCount(); i++) {
        const page = newPdfDoc.getPage(i);
        const adText = advertisementData[0] ? advertisementData[0].advertise : "Put your ads here";

        addRightSideAd(page, adText);
        addBottomAd(page, adText);

        // Add footer with UNIT NAME
        page.drawText(`${product.name}`, { x: 85, y: 30, size: 12 });
      }

      // Add the last page: Vendor and Labor Directory
      currentPage = await addPageWithTemplate();
      yPosition = 700;
      addText("VENDOR AND LABOR DIRECTORY", 200, yPosition, 20);
      yPosition -= 40;

      const vendorList = [
        "PLYWOOD & HARDWARE", "HOME DECOR", "FURNISHING", "WALLPAPER", "PAINTS & HARDWARE",
        "FALSE CEILING", "SANITARY FIXTURES", "GRANITE & STONE", "LIGHTS", "ELECTRICAL & HARDWARE",
        "GLASS & MIRROR"
      ];

      const laborList = [
        "CARPENTER", "ELECTRICIAN", "GRANITE & TILES LABOR", "FALSE CEILING LABOR", "CORE CUTTING LABOR",
        "PLUMBER", "HELPERS/ LIFTERS", "FOAM WORKER", "CLEANERS", "SAFE/ MOSQUITO NETS"
      ];

      tableStartX = 50;
      tableStartY = yPosition;
      tableWidth = 700;
      rowHeight = 20;

      // Draw combined table borders
      currentPage.drawRectangle({
        x: tableStartX,
        y: 200,
        width: tableWidth,
        height: rowHeight * (Math.max(vendorList.length, laborList.length) + 2),
        borderColor: rgb(0, 0.6, 0), // Green color
        borderWidth: 2,
      });

      // Add table headers
      addText("VENDOR LIST", tableStartX + 5, 180 + rowHeight * (Math.max(vendorList.length, laborList.length) + 2), 16);
      addText("LABOR LIST", tableStartX + tableWidth / 2 + 15, 180 + rowHeight * (Math.max(vendorList.length, laborList.length) + 2), 16);

      // Add footer with UNIT NAME on the first page
      addText(`${product.name}`, 85, 30, 12);
      // Add table rows
      vendorList.forEach((item, index) => {
        addText(item, tableStartX + 5, 440 - (index + 1) * rowHeight, 12);
      });

      laborList.forEach((item, index) => {
        addText(item, tableStartX + tableWidth / 2 + 15, 440 - (index + 1) * rowHeight, 12);
      });

      const pdfBytes = await newPdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'product_details.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setLoading(false);
    } catch (error) {
      console.error("Error creating PDF:", error);
      setLoading(false);
    }
  };


  const transformDescriptionToBulletPoints = (description) => {
    return description.split('.').filter(point => point.trim().length > 0);
  };

  return (

    <>
    {loading && <Loader/>}
    <div className="flex flex-col items-center p-6 w-full h-full">
      {product ? (
        <div className="bg-white rounded-lg shadow-lg p-6 w-full h-full">
          <div className="flex flex-col lg:flex-row">
            <div className="flex flex-col items-center lg:w-2/3 pr-6 mb-4">
              <img
                src={selectedImage}
                alt="Selected Product"
                className="w-full h-auto object-cover mb-4"
              />
              <div className="flex space-x-2">
                {product.productImages &&
                  product.productImages.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      className={`w-20 h-20 object-cover cursor-pointer ${
                        selectedImage === image
                          ? "border-2 border-green-600"
                          : "border"
                      }`}
                      onClick={() => setSelectedImage(image)}
                    />
                  ))}
              </div>
            </div>
            <div className="flex flex-col lg:w-1/3">
              <h2 className="text-2xl font-bold mb-4">{product.name}</h2>
              <div className="h-px border border-gray"></div>
              <ul className="list-disc list-inside mb-4">
                {transformDescriptionToBulletPoints(product.description).slice(0, showFullDescription ? undefined : 3).map((point, index) => (
                  <li className="my-8" key={index}>{point.trim()}</li>
                ))}
                {product.description.split('.').length > 3 && !showFullDescription && (
                  <button onClick={() => setShowFullDescription(true)} className="text-blue-500">
                    Read more...
                  </button>
                )}
                {showFullDescription && (
                  <button onClick={() => setShowFullDescription(false)} className="text-blue-500">
                    Show less
                  </button>
                )}
              </ul>
              <div className="flex space-y-2 mb-6 items-center">
                <label htmlFor="dimensions" className="font-bold mr-4 text-xs mt-3">
                  DIMENSIONS
                </label>
                <select
                  id="options"
                  value={selectedOption}
                  onChange={(e) => setSelectedOption(e.target.value)}
                  className="mb-4 p-2 border rounded"
                >
                  <option className="text-gray-100" value="">SELECT OPTION</option>
                  {options.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div className="h-px border border-gray"></div>
              <div className="flex justify-between items-center w-full py-4 mb-6">
                <button
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                  onClick={handleDownloadPDF}
                >
                  Download PDF
                </button>
              </div>
              <div className="h-px border border-gray"></div>
              <h1 className="font-bold mt-4">DETAILS</h1>
              <div className="flex space-y-2 flex-col">
                <div className="flex justify-between mt-2">
                  <span className="text-xs font-bold text-gray-400">MATERIAL</span>
                  <span className="text-xs font-bold text-gray-600">
                    {product.material}
                  </span>
                </div>
                <div className="h-px border border-gray"></div>
                <div className="flex justify-between mt-2">
                  <span className="text-xs font-bold text-gray-400">WEIGHT</span>
                  <span className="text-xs font-bold text-gray-600">
                    {product.weight}
                  </span>
                </div>
                <div className="h-px border border-gray"></div>
                <div className="flex justify-between mt-2">
                  <span className="text-xs font-bold text-gray-400">DIMENSIONS</span>
                  <span className="text-xs font-bold text-gray-600">
                    {product.dimensions}
                  </span>
                </div>
                <div className="h-px border border-gray"></div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p>No product found.</p>
      )}
    </div>
    </>
   
  );
}

export default ProductCard;

