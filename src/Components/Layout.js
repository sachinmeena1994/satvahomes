import React from 'react';
import Header from './Header';
import Footer from './Footer';
import Testheader from './Testheader';


const Layout = ({ children }) => {
  return (
    <div className="layout">
      {/* <Header /> */}
      <Testheader/>
      <main className="content">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;