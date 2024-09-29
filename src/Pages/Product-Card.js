import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getFirestore, doc, getDoc, collection, getDocs } from "firebase/firestore";
import { PDFDocument, rgb,StandardFonts } from "pdf-lib";
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
        // Fetch the document from 'products/${category}'
        const productDocRef = doc(db, `products/${category}`);
        const productDoc = await getDoc(productDocRef);
  
        if (productDoc.exists()) {
          const productData = productDoc.data();
  
          // Find the product in the 'products' array using the productId
          const targetProduct = productData.products.find(
            (product) => product.id === productId
          );
  
          if (targetProduct) {
            setProduct(targetProduct);
            if (targetProduct.productImages && targetProduct.productImages.length > 0) {
              setSelectedImage(targetProduct.productImages[0]);
            }
          } else {
            console.log("Product not found in the array!");
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
      const templateUrl = '/TEMPLATE.pdf'; // Ensure this is the correct URL for your PDF template
      const response = await fetch(templateUrl);
  
      if (!response.ok) {
        throw new Error(`Failed to fetch PDF template: ${response.statusText}`);
      }
  
      const existingPdfBytes = await response.arrayBuffer();
      const pdfDoc = await PDFDocument.load(existingPdfBytes); // Load the existing template
      const newPdfDoc = await PDFDocument.create(); // Create a new PDF document
  
      const addPageWithTemplate = async () => {
        const [templatePage] = await newPdfDoc.copyPages(pdfDoc, [0]); // Copy the first page of the template
        newPdfDoc.addPage(templatePage); // Add the page to the new PDF document
        return newPdfDoc.getPage(newPdfDoc.getPageCount() - 1); // Return the current page
      };
  
      let currentPage = await addPageWithTemplate(); // Create the first page based on the template
  
      // Function to add text with border
      const addTextWithBorder = async (text, x, y, fontSize = 14, maxWidth = 250, lineHeight = 14) => {
        if (typeof text !== 'string') {
          text = String(text || ''); // Convert undefined or NaN to an empty string
        }
  
        const font = await newPdfDoc.embedFont(StandardFonts.Helvetica); // Embed a font (adjust as needed)
  
        const words = text.split(' ');
        let line = '';
        let lines = [];
  
        words.forEach((word) => {
          let testLine = line + word + ' ';
          const width = font.widthOfTextAtSize(testLine, fontSize); // Measure the width of the text
  
          if (width > maxWidth && line !== '') {
            lines.push(line.trim());
            line = word + ' ';
          } else {
            line = testLine;
          }
        });
  
        lines.push(line.trim());
  
        // Draw each line of wrapped text
        const textHeight = lines.length * lineHeight;
        currentPage.drawRectangle({
          x: x - 5,
          y: y - textHeight,
          width: maxWidth + 10,
          height: textHeight + 10,
          borderColor: rgb(0, 0.6, 0),
          borderWidth: 1,
        });
  
        lines.forEach((line) => {
          currentPage.drawText(line, { x, y, size: fontSize, font, color: rgb(0, 0, 0), maxWidth });
          y -= lineHeight; // Move down for the next line
        });
      };
  
      // Function to add plain text without a border
      const addPlainText = async (text, x, y, fontSize = 14) => {
        if (typeof text !== 'string') {
          text = String(text || ''); // Convert undefined or NaN to an empty string
        }
  
        const font = await newPdfDoc.embedFont(StandardFonts.Helvetica); // Embed a font
        currentPage.drawText(text, { x, y, size: fontSize, font, color: rgb(0, 0, 0) });
      };
  
      // Function to add images with a green border
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
          // Add green border around the image
          currentPage.drawRectangle({
            x,
            y,
            width,
            height,
            borderColor: rgb(0, 0.6, 0),
            borderWidth: 1,
          });
        } catch (error) {
          console.error(`Error embedding image from URL ${imageUrl}:`, error);
        }
      };
  
      // Function to add the ad to a page
      const addAdByType = async (adType, x, y, width, height) => {
        let adFound = false;
        for (const adData of advertisementData) {
          const ad = adData.advertise.find((a) => a.adType === adType && a.isActive);
          if (ad) {
            await addImage(ad.advertise, x, y, width, height);
            adFound = true;
            break; // Exit the loop after adding the correct ad
          }
        }
        if (!adFound) {
          // Placeholder for missing ad
          currentPage.drawText("Contact us for ADS", { x: x + 10, y: y + 50, size: 12, color: rgb(1, 0, 0) });
          currentPage.drawRectangle({
            x,
            y,
            width,
            height,
            borderColor: rgb(0, 0.6, 0),
            borderWidth: 1,
          });
        }
      };
  
      // Add product image on the first page (cover page)
      if (product && product.productImages && product.productImages.length > 0) {
        await addImage(product.productImages[0], 0, 50, 850, 600);
      }
      await addPlainText(`${product.name || 'Unknown Product'}`, 84, 30, 10); // Add product name under the image
  
      // Move to the second page for material info and ads
      currentPage = await addPageWithTemplate();
  
      // Draw single border around Material Information Table
      const materialInfo = product?.pdfDetails?.[0]?.materialInfo || {};
      let tableStartX = 200;
      let tableStartY = 580;
      let rowHeight = 18;
      let col1Width = 250;
      let col2Width = 200;
      let tableHeight = rowHeight * (Object.keys(materialInfo).length + 1); // Calculate height for the entire table
  
      // Draw single border around the entire material information table
      currentPage.drawRectangle({
        x: tableStartX,
        y: tableStartY - tableHeight - rowHeight, // Total table height including the header
        width: col1Width + col2Width,
        height: tableHeight + rowHeight,
        borderColor: rgb(0, 0.6, 0), // Only green border
        borderWidth: 1,
      });
  
      // Draw table headers (without row border)
      await addPlainText("Material", tableStartX + 10, tableStartY - 15, 12);
      await addPlainText("Details", tableStartX + col1Width + 10, tableStartY - 15, 12);
  
      // Draw table rows with for...of (async loop)
      for (const [index, key] of Object.keys(materialInfo).entries()) {
        let yPosition = tableStartY - rowHeight * (index + 2);
        await addPlainText(key.replace(/([A-Z])/g, ' $1').toUpperCase(), tableStartX + 10, yPosition + 5, 10);
        await addPlainText(String(materialInfo[key]), tableStartX + col1Width + 10, yPosition + 5, 10);
      }
  
      // Add AdType 1 on the second page (material information)
      await addAdByType(1, 0, 50, 850, 250);
  
      // Steps pages: Add step text and images
      if (product?.pdfDetails?.[0]?.steps && product.pdfDetails[0].steps.length > 0) {
        for (let i = 0; i < product.pdfDetails[0].steps.length; i++) {
          const step = product.pdfDetails[0].steps[i];
          currentPage = await addPageWithTemplate();
  
          let yPosition = 500;
  
          // Step text wrapped with a green border
          await addTextWithBorder(`Step ${i + 1}: ${step.text || ''}`, 580, 550, 12);
  
          // Step image (if available)
          if (step.image) {
            await addImage(step.image, 0, 180, 570, 380);
          }
  
          // Ads for Step 1 page (AdType 2 and AdType 3)
          if (i === 0) {
            await addAdByType(2, 0, 50, 850, 120); // AdType 2 (bottom ad)
            await addAdByType(3, 580, 180, 250, 200); // AdType 3 (right-side ad)
          }
        }
      }
  
      // Last page: Adding AdType 4 on the right side
      await addAdByType(4, 580, 180, 270, 200); // AdType 4
  
      // Save and download the PDF
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

