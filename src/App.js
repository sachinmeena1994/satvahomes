import './App.css';
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './Components/Layout';

const Home = lazy(() => import('./Pages/Home'));
const ProductList = lazy(() => import('./Pages/Product-List'));
const ProductCard = lazy(() => import('./Pages/Product-List'));
const Loading = lazy(()=> import('./Components/Loader'))

function App() {
  return (
    <Router>
      <Layout>
        <Suspense fallback={<Loading/>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/product-category" element={<ProductList />} />
            <Route path="/products/:id" element={<ProductCard />} />
            {/* Add more routes for other pages */}
          </Routes>
        </Suspense>
      </Layout>
    </Router>
  );
}

export default App;
