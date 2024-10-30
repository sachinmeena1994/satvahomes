import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HashRouter } from 'react-router-dom';
import { ProductCategoryProvider } from './Context/Product-Category-Context'; // Adjust the path as needed
import { UserProvider } from './Context/Current-User-Context'; // Import UserProvider
import ProtectedRoute from './Components/Protected-Route';


import './App.css';
import Layout from './Components/Layout';
import Loading from './Components/Loader';

// Lazy load components
const Home = lazy(() => import('./Pages/Home'));
const ProductList = lazy(() => import('./Pages/Product-List'));
const ProductCard = lazy(() => import('./Pages/Product-Card'));
const Login = lazy(() => import('./Pages/Login'));
const Admin = lazy(() => import('./Pages/Admin'));
const FAQ = lazy(() => import('./Pages/FAQ'));
const About = lazy(() => import('./Pages/About'));
const Contact = lazy(() => import('./Pages/Contact'));
const Vendor = lazy(() => import('./Pages/Vendor'));

function App() {
  return (
    <UserProvider>
      <ProductCategoryProvider>
        <HashRouter>
          <Layout>
            <Suspense fallback={<Loading />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/vendor" element={<Vendor />} />
                <Route path="/product-category/:category" element={<ProductList />} />
                <Route path="/product/:category/:productId" element={<ProductCard />} />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <Admin />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </Suspense>
          </Layout>
        </HashRouter>
      </ProductCategoryProvider>
    </UserProvider>
  );
}

export default App;
