import './App.css';
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './Components/Layout';
import Loading from './Components/Loader';
import { firebaseInitialized } from './firebase-config';
// Lazy load components
const Home = lazy(() => import('./Pages/Home'));
const ProductList = lazy(() => import('./Pages/Product-List'));
const ProductCard = lazy(() => import('./Pages/Product-Card'));
const Login = lazy(()=> import('./Pages/Login'))
const Admin = lazy(()=>import('./Pages/Admin'))


function App() {
  return (
    <Router>
      <Layout>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/product-category/:category" element={<ProductList />} />
            {/* <Route path="/product-category" element={<ProductList />} />
            <Route path="/products/:id" element={<ProductCard />} /> */}
            {/* Add more routes for other pages */}
          </Routes>
        </Suspense>
      </Layout>
    </Router>
  );
}

export default App;
