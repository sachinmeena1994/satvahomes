import './App.css';
import React, { Suspense, lazy, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './Components/Layout';
import Loading from './Components/Loader';
import { auth } from './firebase-config';
import ProtectedRoute from './Components/ProtectedRoute'; // Import the new ProtectedRoute component

// Lazy load components
const Home = lazy(() => import('./Pages/Home'));
const ProductList = lazy(() => import('./Pages/Product-List'));
const ProductCard = lazy(() => import('./Pages/Product-Card'));
const Login = lazy(() => import('./Pages/Login'));
const Admin = lazy(() => import('./Pages/Admin'));

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <Router>
      <Layout>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/product-category/:category" element={<ProductList />} />
            <Route path="/product/:category/:productId" element={<ProductCard />} /> {/* Updated route */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute user={user}>
                  <Admin />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Suspense>
      </Layout>
    </Router>
  );
}

export default App;