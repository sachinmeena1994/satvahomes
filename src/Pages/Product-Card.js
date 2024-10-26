import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getFirestore, doc, getDoc, collection, getDocs } from "firebase/firestore";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

function ProductCard() {
  const { category, productId } = useParams();
  const [product, setProduct] = useState(null);
  const [advertisementData, setAdvertisementData] = useState([]);
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedOption, setSelectedOption] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0); // Progress percentage state
  const [showFullDescription, setShowFullDescription] = useState(false);

  const options = ["30", "50", "60"]; // Example options for dimensions
  const transformDescriptionToBulletPoints = (description) => {
    return description.split('.').filter(point => point.trim().length > 0);
  };

  // Fetch product and advertisement data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const db = getFirestore();
        const productDocRef = doc(db, `products/${category}`);
        const productDoc = await getDoc(productDocRef);
  
        if (productDoc.exists()) {
          const productData = productDoc.data();
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
      setProgress(10); // Initial progress for starting the download process
  
      const templateUrl = '/TEMPLATE.pdf'; // Ensure this is the correct URL for your PDF template
      const response = await fetch(templateUrl);
  
      if (!response.ok) {
        throw new Error(`Failed to fetch PDF template: ${response.statusText}`);
      }
  
      const existingPdfBytes = await response.arrayBuffer();
      const pdfDoc = await PDFDocument.load(existingPdfBytes); // Load the existing template
      const newPdfDoc = await PDFDocument.create(); // Create a new PDF document
  
      setProgress(30); // Progress for loading PDF template
  
      // Helper function to add a page with a template
      const addPageWithTemplate = async () => {
        const [templatePage] = await newPdfDoc.copyPages(pdfDoc, [0]);
        newPdfDoc.addPage(templatePage);
        return newPdfDoc.getPage(newPdfDoc.getPageCount() - 1);
      };
  
      let currentPage = await addPageWithTemplate();
      setProgress(40); // Progress after adding the first page
  
      const addText = async ({
        text, x, y, fontSize = 14, maxWidth = 250, lineHeight = 14, withBorder = false
      }) => {
        if (typeof text !== 'string') {
          text = String(text || '');
        }
        const font = await newPdfDoc.embedFont(StandardFonts.Helvetica);
        const words = text.split(' ');
        let line = '';
        let lines = [];
  
        words.forEach((word) => {
          const testLine = line + word + ' ';
          const width = font.widthOfTextAtSize(testLine, fontSize);
          if (width > maxWidth && line !== '') {
            lines.push(line.trim());
            line = word + ' ';
          } else {
            line = testLine;
          }
        });
  
        lines.push(line.trim());
  
        if (withBorder) {
          const textHeight = lines.length * lineHeight;
          currentPage.drawRectangle({
            x: x - 5,
            y: y - textHeight,
            width: maxWidth + 10,
            height: textHeight + 10,
            borderColor: rgb(0, 0.6, 0),
            borderWidth: 1,
          });
        }
  
        lines.forEach((line) => {
          currentPage.drawText(line, { x, y, size: fontSize, font, color: rgb(0, 0, 0), maxWidth });
          y -= lineHeight;
        });
      };
  
      const addImage = async ({ imageUrl, x, y, width, height }) => {
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
  
      const displayedAds = new Set();  // To keep track of displayed ads

      const addAdByType = async ({ adType, x, y, width, height, showContactMessage = false }) => {
        let adFound = false;
      
        // Only search for an ad if we are not supposed to show the contact message
        if (!showContactMessage) {
          console.log(`Searching for adType ${adType}...`);  // Debugging message
          for (const adData of advertisementData) {
            const activeAd = adData.advertise.find((a) => a.adType === adType && a.isActive && !displayedAds.has(a.advertise));
            if (activeAd) {
              console.log(`Ad found for adType ${adType}:`, activeAd);  // Debugging message
              await addImage({ imageUrl: activeAd.advertise, x, y, width, height });
              adFound = true;
              displayedAds.add(activeAd.advertise);  // Mark this ad as displayed
              break;  // Stop searching after finding the first matching ad
            }
          }
        }
      
        // If no ad was found or if showContactMessage is true, show the contact message
        if (!adFound || showContactMessage) {
          console.log(`No ad found or showing contact message for adType ${adType}`);  // Debugging message
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
      ;
      
  
      // Add product image on the first page (cover page)
      if (product && product.productImages && product.productImages.length > 0) {
        await addImage({ imageUrl: product.productImages[0], x: 0, y: 50, width: 850, height: 600 });
      }
  
      setProgress(60); // Progress after adding the cover image
  
      await addText({ text: `${product.name || 'Unknown Product'}`, x: 84, y: 30, fontSize: 10 });
      currentPage = await addPageWithTemplate();
      const materialInfo = product?.pdfDetails?.[0]?.materialInfo || {};
      const tableStartX = 100;
      const tableStartY = 550; 
      const col1Width = 150;
      const col2Width = 400;
      const rowHeight = 10;
      
      // Draw the outer table boundary
      currentPage.drawRectangle({
        x: tableStartX,
        y: tableStartY - (Object.keys(materialInfo).length + 1) * rowHeight - 60, 
        width: col1Width + col2Width,
        height: 240,
        borderColor: rgb(0, 0.6, 0),
        borderWidth: 1,
      });
      
      // Add the table headers
      await addText({ text: "Material", x: tableStartX + 5, y: 550 , fontSize: 12 });
      await addText({ text: "Details", x: tableStartX + col1Width + 5, y: 550 , fontSize: 12 });
      
      // Function to add text with word wrapping
      const addWrappedText = async (text, x, y, maxWidth, fontSize) => {
        const font = await newPdfDoc.embedFont(StandardFonts.Helvetica);
        const words = text.split(' ');
        let line = '';
        let yPosition = y;
      
        for (let i = 0; i < words.length; i++) {
          const testLine = line + words[i] + ' ';
          const lineWidth = font.widthOfTextAtSize(testLine, fontSize);
          
          if (lineWidth > maxWidth && line !== '') {
            // Draw the line and move to the next line
            currentPage.drawText(line, { x, y: yPosition, size: fontSize, font });
            line = words[i] + ' ';
            yPosition -= rowHeight; // Move down to the next row
          } else {
            line = testLine;
          }
        }
      
        // Draw the last line
        currentPage.drawText(line, { x, y: yPosition, size: fontSize, font });
        return yPosition; // Return the updated yPosition after wrapping
      };
      
      // Start drawing rows from right after the headers
      let yPosition = 540; // Start right below the headers
      
      for (const [key, value] of Object.entries(materialInfo)) {
        // Add material name in the first column with text wrapping
        yPosition = await addWrappedText(
          key.replace(/([A-Z])/g, ' $1').toUpperCase(), // Convert camelCase to readable format
          tableStartX + 5,
          yPosition,
          col1Width,
          10
        );
      
        // Add material details in the second column with text wrapping
        yPosition = await addWrappedText(
          String(value),
          tableStartX + col1Width + 5,
          yPosition,
          col2Width,
          10
        );
      
        // Move yPosition down for the next row
        yPosition -= rowHeight;
      }
  
      // Add AdType 1 after the material table
      await addAdByType({ adType: 1, x: 0, y: yPosition - 350, width: 850, height: 320 });
  
      setProgress(80); // Progress for material information
    
    // Sequentially add steps and their images, but only one page per step
for (let i = 0; i < product?.pdfDetails?.[0]?.steps?.length; i++) {
  const step = product.pdfDetails[0].steps[i];
  currentPage = await addPageWithTemplate();  // Add a new page only once per step
  await addText({ text: `Step ${i + 1}: ${step.text || ''}`, x: 580, y: 550, fontSize: 12, withBorder: true });

  if (step.image) {
    await addImage({ imageUrl: step.image, x: 0, y: 180, width: 570, height: 380 });
  }

  // For steps 1 and 2, add the ads
  if (i < 2) {
    // First and second step
    await addAdByType({ adType: 2, x: 0, y: 60, width: 880, height: 120 });
    await addAdByType({ adType: 3, x: 580, y: 180, width: 250, height: 200 });
  } else {
    // Step 3 onwards, show contact message for ads
    await addAdByType({ adType: 2, x: 0, y: 60, width: 880, height: 120, showContactMessage: true });
    await addAdByType({ adType: 3, x: 580, y: 180, width: 250, height: 200, showContactMessage: true });
  }
}

    
      setProgress(90); // Progress after adding steps
    
      // Last page: Adding AdType 4
      await addAdByType({ adType: 4, x: 580, y: 180, width: 270, height: 200 });
    
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
    
      setProgress(100); // Completed progress
      setLoading(false); // Done
    } catch (error) {
      console.error("Error creating PDF:", error);
      setLoading(false);
      setProgress(0); // Reset progress on error
    }
  };
  
  
  return (
    <>
      {/* {loading && <Loader />} */}
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
                  {transformDescriptionToBulletPoints(product.description)
                    .slice(0, showFullDescription ? undefined : 3)
                    .map((point, index) => (
                      <li className="my-8" key={index}>
                        {point.trim()}
                      </li>
                    ))}
                  {product.description.split('.').length > 3 &&
                    !showFullDescription && (
                      <button
                        onClick={() => setShowFullDescription(true)}
                        className="text-blue-500"
                      >
                        Read more...
                      </button>
                    )}
                  {showFullDescription && (
                    <button
                      onClick={() => setShowFullDescription(false)}
                      className="text-blue-500"
                    >
                      Show less
                    </button>
                  )}
                </ul>
                <div className="flex space-y-2 mb-6 items-center">
                  <label
                    htmlFor="dimensions"
                    className="font-bold mr-4 text-xs mt-3"
                  >
                    DIMENSIONS
                  </label>
                  <select
                    id="options"
                    value={selectedOption}
                    onChange={(e) => setSelectedOption(e.target.value)}
                    className="mb-4 p-2 border rounded"
                  >
                    <option className="text-gray-100" value="">
                      SELECT OPTION
                    </option>
                    {options.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="h-px border border-gray"></div>
  
                {/* Download Button and Progress */}
                <div className="flex justify-between items-center w-full py-4 mb-6">
                  <button
                    className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded ${
                      !selectedOption ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    onClick={handleDownloadPDF}
                    disabled={!selectedOption || loading} // Disable if no option is selected or loading
                  >
                    Download PDF
                  </button>
                </div>
  
                {/* Progress Bar */}
                {loading && (
                  <div className="w-full bg-gray-200 rounded-full h-4 mb-6">
                    <div
                      className="bg-green-500 h-4 rounded-full"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                )}
  
                <div className="h-px border border-gray"></div>
  
                {/* Product Details */}
                <h1 className="font-bold mt-4">DETAILS</h1>
                <div className="flex space-y-2 flex-col">
                  <div className="flex justify-between mt-2">
                    <span className="text-xs font-bold text-gray-400">
                      MATERIAL
                    </span>
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
                    <span className="text-xs font-bold text-gray-400">
                      DIMENSIONS
                    </span>
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


