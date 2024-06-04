import React from "react";
import CollapsibleQuestions from "../Components/CollapsibleQuestions";
import { useLocation } from "react-router-dom";
import TraverseNav from "../Components/TraverseNav";

const FAQ = () => {
  const location = useLocation();
  const path = location.pathname.substring(1);

  const faqs = [
    {
      question: "What is Satva Homes?",
      answer:
        "Satva Homes is an innovative interior design platform committed to serving diverse segments of society. Our mission revolves around creating distinctive and aesthetically pleasing homes.",
    },
    {
      question: "What products does Satva Homes offer?",
      answer:
        "Satva Homes provides meticulously crafted interior designs, including standalone units such as shoe racks, TV units, bar counters, wardrobes, and more. These designs are compiled into comprehensive PDFs, available to customers at no cost, featuring a variety of designs, sizes, and thematic variations.",
    },
    {
      question: "What information is included in Satva Homes' PDFs?",
      answer:
        "Our PDFs contain a wealth of valuable information, including detailed material specifications, immersive 3D renders, and written and visual depictions of construction steps. Additionally, the PDFs feature an extensive directory of reputable vendors and skilled laborers, providing a holistic resource for interior design endeavors.",
    },
    {
      question: "How can I access Satva Homes' interior designs?",
      answer:
        "You can access our interior designs by downloading our comprehensive PDFs directly from our website. Simply navigate to the designated section and choose the design category that aligns with your preferences.",
    },
    {
      question: "Are Satva Homes' interior designs customizable?",
      answer:
        "While our designs are provided in predefined configurations, we understand the importance of customization. For personalized design solutions, you can contact our team, and we’ll be happy to discuss your specific requirements.",
    },
    {
      question:
        "Is there a cost associated with downloading Satva Homes' PDFs?",
      answer:
        "No, our PDFs are provided to customers at no cost. We believe in making high-quality interior designs accessible to everyone.",
    },
    {
      question:
        "How do I find vendors and laborers featured in Satva Homes' directory?",
      answer:
        "The directory of reputable vendors and skilled laborers is included in our PDFs. You can browse through the directory to find professionals for your interior design projects.",
    },
    {
      question: "How often are new designs added to Satva Homes' collection?",
      answer:
        "We regularly update our design collection to offer fresh and inspiring options. Keep an eye on our website for announcements about new additions to our design portfolio.",
    },
    {
      question:
        "How can I get in touch with Satva Homes for further assistance?",
      answer:
        "For any inquiries or assistance, you can reach out to our team through the contact information provided on our website. We are here to help you create the perfect home environment",
    },
    // Add more FAQs as needed
  ];
  return (
    <div
      style={{
        backgroundImage: "url('/images/bgCommonImageFaqContact.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed"
      }}
    >
      <TraverseNav pathname={path}/>
      <div className="min-h-screen bg-white pt-12 flex flex-col items-center">
        <span className="font-normal text-xl text-zinc-500 w-full max-w-6xl mx-auto px-4">
          01
        </span>

        <h1 className="w-full max-w-6xl mx-auto px-4 text-[2.7rem] leading-[1.2] font-bold text-[#056E55] relative">
          Frequently Asked Questions
        </h1>
        <CollapsibleQuestions faqs={faqs} />
      </div>
      <hr />
    </div>
  );
};

export default FAQ;
