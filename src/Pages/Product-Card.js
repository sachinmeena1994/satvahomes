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
  const options = ["30", "50", "60"];

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
      const templateUrl = '/TEMPLATE.pdf';
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
  
      const addText = (text, x, y, fontSize = 12) => {
        currentPage.drawText(text, { x, y, size: fontSize, color: rgb(0, 0, 0) });
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
      addText(`Name: ${product.name}`, 100, 150, 20);
      addText(`Description: ${product.description}`, 0, 100, 10);
      
      // Add footer with UNIT NAME on the first page
      addText(`${product.name}`, 85, 30, 12);
  
      // Second page: Material information in table format
      currentPage = await addPageWithTemplate();
      let yPosition = 500;
      addText("Material Information", 150, yPosition, 20);
      yPosition -= 30;
  
      const materialInfo = product.pdfDetails[0].materialInfo;
      const tableStartX = 150;
      const tableStartY = yPosition;
      const tableWidth = 500;
      const rowHeight = 20;
  
      // Draw table borders and headers
      currentPage.drawRectangle({
        x: tableStartX,
        y: tableStartY - rowHeight * Object.keys(materialInfo).length - 10,
        width: tableWidth,
        height: rowHeight * (Object.keys(materialInfo).length + 1),
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
      });
  
      addText("Material", tableStartX + 5, tableStartY, 14);
      addText("Details", tableStartX + tableWidth / 2 + 5, tableStartY, 14);
      currentPage.drawLine({
        start: { x: tableStartX, y: tableStartY - rowHeight },
        end: { x: tableStartX + tableWidth, y: tableStartY - rowHeight },
        thickness: 1,
        color: rgb(0, 0, 0),
      });
  
      yPosition = tableStartY - rowHeight;
  
      // Draw table rows
      Object.keys(materialInfo).forEach(key => {
        addText(key.replace(/([A-Z])/g, ' $1').toUpperCase(), tableStartX + 5, yPosition);
        addText(materialInfo[key], tableStartX + tableWidth / 2 + 5, yPosition);
        yPosition -= rowHeight;
      });
  
      // Remaining pages: Steps
      if (product.pdfDetails[0].steps && product.pdfDetails[0].steps.length > 0) {
        for (let i = 0; i < product.pdfDetails[0].steps.length; i++) {
          const step = product.pdfDetails[0].steps[i];
          currentPage = await addPageWithTemplate();
          yPosition = 700;
          addText(`Step ${i + 1}: ${step.text}`, 50, yPosition, 16);
          yPosition -= 40;
          if (step.image) {
            await addImage(step.image, 50, yPosition - 300, 500, 300);
            yPosition -= 320;
          }
        }
      }
  
      // Add advertisements on each page except the first one
      for (let i = 1; i < newPdfDoc.getPageCount(); i++) {
        const page = newPdfDoc.getPage(i);
        const adText = advertisementData[0] ? advertisementData[0].advertise : "Put your ads here";
  
        // Right side advertisement
        page.drawRectangle({
          x: 680,
          y: 100,
          width: 140,
          height:400,
          borderColor: rgb(0, 0, 0),
          borderWidth: 1,
        });
        page.drawText(adText, {
          x: 680,
          y: 200,
          size: 12,
          color: rgb(0, 0, 0),
          maxWidth: 120,
        });
  
        // Bottom advertisement
        page.drawRectangle({
          x: 50,
          y: 100,
          width: 600,
          height: 50,
          borderColor: rgb(0, 0, 0),
          borderWidth: 1,
        });
        page.drawText(adText, {
          x: 100,
          y: 120,
          size: 12,
          color: rgb(0, 0, 0),
          maxWidth: 480,
        });
  
        // Add footer with UNIT NAME
        page.drawText(`${product.name}`, {x:85,y: 30, size:12});
      }
  
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

  if (loading) {
    return <Loader />;
  }

  return (
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
                {transformDescriptionToBulletPoints(product.description).map((point, index) => (
                  <li className="my-8" key={index}>{point.trim()}</li>
                ))}
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
                    Sample Text Sample Text Sample Text Sample Text
                  </span>
                </div>
                <div className="h-px border border-gray"></div>
                <div className="flex justify-between mt-2">
                  <span className="text-xs font-bold text-gray-400">WEIGHT</span>
                  <span className="text-xs font-bold text-gray-600">12 lbs</span>
                </div>
                <div className="h-px border border-gray"></div>
                <div className="flex justify-between mt-2">
                  <span className="text-xs font-bold text-gray-400">DIMENSIONS</span>
                  <span className="text-xs font-bold text-gray-600">
                    20 x 30 x 40 cm
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
  );
}

export default ProductCard;
