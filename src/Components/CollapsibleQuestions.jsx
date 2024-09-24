import React, { useState, useRef, useEffect } from 'react';

const CollapsibleQuestions = ({ faqs }) => {
  const [openIndex, setOpenIndex] = useState(null);
  const contentRefs = useRef([]);

  const toggleQuestion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  useEffect(() => {
    contentRefs.current.forEach((ref, index) => {
      if (ref) {
        ref.style.height = openIndex === index ? `${ref.scrollHeight}px` : '0px';
      }
    });
  }, [openIndex]);

  return (
    <div className="w-full bg-white max-w-6xl mx-auto px-4 pb-28 pt-4">
      {faqs.map((faq, index) => (
        <div key={index} className={`border-b ${index === 0 ? 'border-t' : ''} border-gray-200 py-4`}>
          <div
            className="flex justify-between items-center cursor-pointer"
            onClick={() => toggleQuestion(index)}
          >
            <h2 className={`text-xl select-none font-bold ${openIndex === index ? "text-black" : "text-[#056E55]"}`}>{faq.question}</h2>
            <span className="text-2xl ml-3">
              {openIndex === index ? '-' : '+'}
            </span>
          </div>
          <div
            ref={el => contentRefs.current[index] = el}
            className={`transition-all duration-500 overflow-hidden`}
            style={{
              height: '0px',
              opacity: openIndex === index ? 1 : 0
            }}
          >
            <div className="mt-3 mb-2 text-sm text-zinc-500">
              {faq.answer}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CollapsibleQuestions;
