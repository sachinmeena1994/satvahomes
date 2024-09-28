import React from "react";

const ContactUs = () => {
  return (
    <div className="">
      <hr />
      <div className="contact-outer-div lg:max-w-[90vw] mt-8 flex flex-col lg:flex-row justify-between mx-auto items-center">
        <div className="contact-outer-div-left">
          <div className="subscribe-join-div flex md:items-center lg:items-start flex-col md:flex-row lg:flex-col">
            <div className="join-design-div flex items-center justify-center md:justify-start">
              <img className="w-20 h-20 mr-5" src="/images/email-icon1.png" alt="" sizes="" srcset="" />
              <h1 className="text-[1.6rem] leading-none font-semibold">
                Join the design <br /> revolution
              </h1>
              <div className="h-24 hidden md:block md:ml-20 lg:ml-32 w-[1px] bg-zinc-300"></div>
            </div>
            <h2 className="text-[1.1rem] mt-7 md:mt-0 lg:mt-2 leading-none text-center md:ml-7 lg:ml-0 md:text-start text-zinc-400">
              Subscribe to the weekly newsletter for all the <br /> latest
              updates
            </h2>
          </div>
        </div>
        <div className="contact-outer-div-right mt-7 lg:mt-0">
          <form className="flex" action="">
            <input
              className="outline-none md:w-72 px-5 border-[1.5px] rounded-l"
              type="text"
              placeholder="Your email address..."
            />
            <button
              className="bg-black text-white text-xs tracking-widest font-bold px-5 py-5"
              type="submit"
            >
              SUBMIT
            </button>
          </form>
        </div>
      </div>
      <hr className="mt-8"/>
    </div>
  );
};

export default ContactUs;
