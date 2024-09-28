import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase-config';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

const UserContext = createContext();

export const useUser = () => {
  return useContext(UserContext);
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const db = getFirestore();

  useEffect(() => {
    const fetchUserDetails = async (currentUser) => {
      try {
        if (currentUser) {
          const q = query(collection(db, 'users'), where('id', '==', currentUser.uid));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            setUserDetails(userDoc.data());
          } else {
            console.log('User document not found.');
          }
        } else {
          setUserDetails(null);
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };

    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      fetchUserDetails(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [db]);

  return (
    <UserContext.Provider value={{ user, userDetails, loading }}>
      {children}
    </UserContext.Provider>
  );
};
