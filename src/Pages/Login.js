import React, { useState, useEffect } from 'react';
import { auth, fireDB } from '../firebase-config';
import { signInWithEmailAndPassword, sendPasswordResetEmail, createUserWithEmailAndPassword } from 'firebase/auth';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { collection, addDoc } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import { districts } from '../state';

const LoginSignup = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const navigate = useNavigate(); // Define navigate

    const [name, setName] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [state, setState] = useState('');
    const [city, setCity] = useState('');
    const [citiesInState, setCitiesInState] = useState([]);
    const [showForm, setShowForm] = useState(true);

    useEffect(() => {
        if (state && districts[state]) {
            setCitiesInState(districts[state]);
        } else {
            setCitiesInState([]);
        }
    }, [state]);

    const handleFormSubmit = async (event) => {
        event.preventDefault();
        try {
            if (isSignUp) {
                if (password !== confirmPassword) {
                    alert("Passwords do not match.");
                    return;
                }
                const { user } = await createUserWithEmailAndPassword(auth, email, password);
                const userData = {
                    name: name,
                    email: user.email,
                    role: 'user',
                    id: user.uid,
                    location: {
                        state: state,
                        city: city
                    }
                };
                await addDoc(collection(fireDB, 'users'), userData);
                alert('Sign up successful!');
                navigate('/');
            } else {
                await signInWithEmailAndPassword(auth, email, password);
                alert('Login successful!');
                navigate('/');
            }
        } catch (error) {
            console.error('Authentication Error:', error.message);
            alert("Authentication Error. Please try again.");
        }
    };

    const toggleSignUpMode = () => {
        setIsSignUp(!isSignUp);
    };

    const handleForgotPassword = async () => {
        // Define handleForgotPassword function
        setShowForm(false); // Hide sign-up form and details
        setIsForgotPassword(true);
    };

    return (
        <div className='flex justify-center items-center h-screen'>
            <div className='bg-white px-10 py-16 rounded-xl w-full max-w-md shadow-md'>
                <h1 className='text-center text-gray-800 text-xl mb-6 font-bold'>{isSignUp ? 'Sign Up' : 'Login'}</h1>
                {showForm && (
                    <form onSubmit={handleFormSubmit}>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            name='email'
                            className='bg-gray-200 mb-6 px-4 py-3 w-full rounded-lg text-gray-800 placeholder-gray-600 outline-none'
                            placeholder='Email'
                        />
                        {isSignUp && (
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                name='name'
                                className='bg-gray-200 mb-6 px-4 py-3 w-full rounded-lg text-gray-800 placeholder-gray-600 outline-none'
                                placeholder='Name'
                            />
                        )}
                        {isSignUp && (
                            <div className="mb-6">
                                <label htmlFor="state" className="block text-gray-800 font-semibold mb-2">State</label>
                                <select
                                    id="state"
                                    className="bg-gray-200 px-4 py-3 w-full rounded-lg text-gray-800 placeholder-gray-600 outline-none"
                                    value={state}
                                    onChange={(e) => setState(e.target.value)}
                                >
                                    <option value="">Select State</option>
                                    {Object.keys(districts).map((stateName) => (
                                        <option key={stateName} value={stateName}>{stateName}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                        {isSignUp && (
                            <div className="mb-6">
                                <label htmlFor="city" className="block text-gray-800 font-semibold mb-2">City</label>
                                <select
                                    id="city"
                                    className="bg-gray-200 px-4 py-3 w-full rounded-lg text-gray-800 placeholder-gray-600 outline-none"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                >
                                    <option value="">Select City</option>
                                    {citiesInState.map((cityName) => (
                                        <option key={cityName} value={cityName}>{cityName}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                        {!isForgotPassword && (
                            <div className='relative'>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className='bg-gray-200 mb-6 px-4 py-3 w-full rounded-lg text-gray-800 placeholder-gray-600 outline-none pr-10'
                                    placeholder='Password'
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className='absolute inset-y-0 right-0 px-4 text-gray-600 rounded-r-lg focus:outline-none flex items-center justify-center'
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        )}
                        {isSignUp && (
                            <div className='relative'>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className='bg-gray-200 mb-6 px-4 py-3 w-full rounded-lg text-gray-800 placeholder-gray-600 outline-none pr-10'
                                    placeholder='Confirm Password'
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className='absolute inset-y-0 right-0 px-4 text-gray-600 rounded-r-lg focus:outline-none flex items-center justify-center'
                                >
                                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        )}
                        <div className='flex justify-center mb-6'>
                            <button
                                type="submit"
                                className='bg-gray-800 w-full text-white font-bold px-4 py-3 rounded-lg'
                            >
                                {isSignUp ? 'Sign Up' : 'Login'}
                            </button>
                        </div>
                    </form>
                )}
                {isForgotPassword && (
                    <div className='mt-4 text-gray-800 text-center'>
                        <p>Enter your email to reset your password.</p>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            name='email'
                            className='bg-gray-200 mb-4 px-4 py-3 w-full rounded-lg text-gray-800 placeholder-gray-600 outline-none'
                            placeholder='Email'
                        />
                        <button
                            onClick={handleForgotPassword}
                            className='bg-gray-800 w-full text-white font-bold px-4 py-3 rounded-lg'
                        >
                            Reset Password
                        </button>
                    </div>
                )}
                {!isForgotPassword && (
                    <div>
                        <h2 className='text-gray-800 text-center text-lg'>
                            {isSignUp ? "Already have an account?" : "Don't have an account yet?"}
                            <button
                                onClick={toggleSignUpMode}
                                className='text-gray-800 font-bold px-1 focus:outline-none'
                            >
                                {isSignUp ? 'Login' : 'Sign up'}
                            </button>
                        </h2>
                        <div className='flex justify-center mt-4'>
                            <button
                                onClick={handleForgotPassword}
                                className='text-gray-800 font-bold px-1 focus:outline-none'
                            >
                                Forgot Password?
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LoginSignup;
