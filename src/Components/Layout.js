
import Header from './Header';
import Footer from './Footer';
import Testheader from './Testheader';
import MobileBottomNav from './MobileBottomNav';


const Layout = ({ children }) => {
  return (
    <div className="layout">
      {/* <Header /> */}
      <Testheader/>
      <main className="content">{children}</main>
      <Footer />
      <MobileBottomNav/>
    </div>
  );
};

export default Layout;