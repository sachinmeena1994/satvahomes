import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getFirestore, doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { jsPDF } from 'jspdf';

function ProductCard() {
  const { category, productId } = useParams();
  const [product, setProduct] = useState(null);
  const [advertisementData, setAdvertisementData] = useState([]);
  const [selectedImage, setSelectedImage] = useState('');

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
          console.log('No such document!');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      }
    };

    const fetchAdvertisementData = async () => {
      try {
        const db = getFirestore();
        const advertisementCollection = collection(db, 'advertisement');
        const advertisementSnapshot = await getDocs(advertisementCollection);
        const advertisementDataArray = advertisementSnapshot.docs.map(doc => doc.data());
        setAdvertisementData(advertisementDataArray);
      } catch (error) {
        console.error('Error fetching advertisement data:', error);
      }
    };

    if (category && productId) {
      fetchProduct();
      fetchAdvertisementData();
    }
  }, [category, productId]);

  const addImageToDoc = (imageUrl, doc, x, y, width, height) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = imageUrl;
      img.onload = () => {
        const aspectRatio = img.width / img.height;
        height = height || width / aspectRatio;
        doc.addImage(img, 'JPEG', x, y, width, height);
        resolve();
      };
    });
  };

  const handleDownloadPDF = async () => {
    const doc = new jsPDF({ orientation: 'portrait' });

    // Add product details to the first page
    doc.setFontSize(20);
    doc.text(20, 20, 'Product Details:');
    doc.setFontSize(12);
    doc.text(20, 30, `Name: ${product.name}`);
    doc.text(20, 40, `Description: ${product.description}`);

    // Add product images to the first page
    if (product.productImages && product.productImages.length > 0) {
      let yOffset = 50;
      for (let i = 0; i < product.productImages.length; i++) {
        await addImageToDoc(product.productImages[i], doc, 20, yOffset, 150, 100);
        yOffset += 110;
        if (yOffset > 250) {
          doc.addPage();
          yOffset = 20;
        }
      }
    }

    // Add PDF details
    if (product.pdfDetails && product.pdfDetails.length > 0) {
      for (let i = 0; i < product.pdfDetails.length; i++) {
        const pdfDetail = product.pdfDetails[i];
        doc.addPage();
        doc.setFontSize(20);
        doc.text(20, 20, `PDF Details - Size: ${pdfDetail.size}`);
        doc.setFontSize(12);
        doc.text(20, 30, `Material Info: ${pdfDetail.materialInfo}`);
        if (pdfDetail.materialImage) {
          await addImageToDoc(pdfDetail.materialImage, doc, 20, 40, 150, 100);
        }
        if (pdfDetail.pdfProductImage) {
          await addImageToDoc(pdfDetail.pdfProductImage, doc, 20, 150, 150, 100);
        }
        if (pdfDetail.steps && pdfDetail.steps.length > 0) {
          for (let j = 0; j < pdfDetail.steps.length; j++) {
            const step = pdfDetail.steps[j];
            doc.addPage();
            doc.setFontSize(20);
            doc.text(20, 20, `Step ${j + 1}: ${step.text}`);
            if (step.image) {
              await addImageToDoc(step.image, doc, 20, 40, 150, 200);
            }
          }
        }
      }
    }

    // Add advertisement text
    const advertisement = advertisementData[0]; // Assuming the first advertisement is used
    if (advertisement) {
      doc.setFontSize(12);
      doc.text(20, 260, advertisement.advertise); // Adjust the position as needed
    }

    // Save the PDF document
    doc.save('product_details.pdf');
  };

  return (
    <div className="flex justify-center items-center p-6">
      {product ? (
        <div className="flex flex-col lg:flex-row bg-white border border-gray-300 rounded-lg shadow-lg p-6 max-w-5xl">
          <div className="flex flex-col lg:w-1/2 pr-6">
            <div className="flex flex-col items-center mb-4">
              <img src={selectedImage} alt="Selected Product" className="w-96 h-96 object-cover mb-4" />
              <div className="flex space-x-2">
                {product.productImages && product.productImages.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className={`w-20 h-20 object-cover cursor-pointer ${selectedImage === image ? 'border-2 border-green-600' : 'border'}`}
                    onClick={() => setSelectedImage(image)}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="flex flex-col lg:w-1/2">
            <h2 className="text-2xl font-bold mb-4">{product.name}</h2>
            <p className="text-lg mb-4">{product.description}</p>
            <ul className="list-none mb-6">
              {product.pdfDetails && product.pdfDetails.map((pdfDetail, index) => (
                <li key={index} className="bg-gray-200 p-2 mb-2 rounded">{pdfDetail.size}</li>
              ))}
            </ul>
            <button
              className="bg-green-600 text-white py-1 px-3 rounded hover:bg-green-700"
              onClick={handleDownloadPDF}
            >
              Download PDF
            </button>
          </div>
        </div>
      ) : (
        <p>Loading product details...</p>
      )}
    </div>
  );
}

export default ProductCard;
