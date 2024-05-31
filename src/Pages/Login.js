import React, { useState, useEffect } from "react";
import { auth, fireDB } from "../firebase-config";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { collection, addDoc } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import { districts } from "../state";

const LoginSignup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [citiesInState, setCitiesInState] = useState([]);
  const [showForm, setShowForm] = useState(true);

  useEffect(() => {
    if (state && districts[state]) {
      setCitiesInState(districts[state]);
    } else {
      setCitiesInState([]);
    }
  }, [state]);

  const resetFormdata = ()=>{
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setName("");
    setState("");
    setCity("");
  }

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    try {
      if (isSignUp) {
        if (password !== confirmPassword) {
          alert("Passwords do not match.");
          return;
        }
        const { user } = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const userData = {
          name: name,
          email: user.email,
          role: "user",
          id: user.uid,
          location: {
            state: state,
            city: city,
          },
        };
        await addDoc(collection(fireDB, "users"), userData);
        alert("Sign up successful!");
        navigate("/");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        alert("Login successful!");
        navigate("/");
      }
    } catch (error) {
      resetFormdata();
      console.error("Authentication Error:", error.message);
      alert("Authentication Error. Please try again.");
    }
  };

  const toggleSignUpMode = () => {
    setIsSignUp(!isSignUp);
  };

  const handleForgotPassword = async () => {
    setShowForm(false);
    setIsForgotPassword(true);
  };

  return (
    <div
      className="flex justify-center items-center min-h-[100vh] bg-white"
      style={{
        backgroundImage:
          "url('/images/bgLogin.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="flex flex-col my-16 xs:my-32 lg:flex-row shadow-gray-500 shadow-md rounded-lg overflow-hidden w-[85vw] xs:w-[70vw] lg:w-full max-w-5xl h-full">
        <div className="w-full min-h-[80vh] bg-white bg-opacity-40 backdrop-blur-md lg:w-1/2 p-10 flex flex-col justify-center">
          <h1 className={`text-center text-gray-800 text-xl xs:text-2xl ${isForgotPassword ? 'mb-1':'mb-8'}  font-bold`}>
            {isForgotPassword? "Forgot Password" : isSignUp ? "Sign Up" : "Login your account"}
          </h1>
          {showForm && (
            <form onSubmit={handleFormSubmit}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                name="email"
                className="bg-gray-200 mb-6 px-4 py-3 w-full rounded-lg text-gray-800 placeholder-gray-600 outline-none"
                placeholder="Email"
              />
              {isSignUp && (
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  name="name"
                  className="bg-gray-200 mb-6 px-4 py-3 w-full rounded-lg text-gray-800 placeholder-gray-600 outline-none"
                  placeholder="Name"
                />
              )}
              <div className="flex w-full flex-col md:flex-row justify-between">
              {isSignUp && (
                <div className="mb-6 md:w-[50%]">
                  {/* <label
                    htmlFor="state"
                    className="block text-gray-800 font-semibold mb-2"
                  >
                    State
                  </label> */}
                  <div className="bg-gray-200 pr-4 w-full rounded-lg">
                    <select
                      id="state"
                      className="bg-gray-200 px-4 py-3 w-full rounded-lg text-gray-800 placeholder-gray-600 outline-none"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                    >
                      <option className="py-1 hover:bg-gray-100" value="">Select State</option>
                      {Object.keys(districts).map((stateName) => (
                        <option key={stateName} value={stateName}>
                          {stateName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
              {isSignUp && (
                <div className="mb-6 md:w-[45%]">
                  {/* <label
                    htmlFor="city"
                    className="block text-gray-800 font-semibold mb-2"
                  >
                    City
                  </label> */}
                  <div className="bg-gray-200 pr-4 rounded-lg">
                    <select
                      id="city"
                      className="bg-gray-200 px-4 py-3 w-[100%] rounded-lg text-gray-800 placeholder-gray-600 outline-none"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    >
                      <option value="">Select City</option>
                      {citiesInState.map((cityName) => (
                        <option key={cityName} value={cityName}>
                          {cityName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
              </div>
              {!isForgotPassword && (
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-gray-200 mb-6 px-4 py-3 w-full rounded-lg text-gray-800 placeholder-gray-600 outline-none pr-10"
                    placeholder="Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute -top-[35%] inset-y-0 right-0 px-4 text-gray-600 rounded-r-lg focus:outline-none flex items-center justify-center"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              )}
              {isSignUp && (
                <div className="relative">
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-gray-200 mb-6 px-4 py-3 w-full rounded-lg text-gray-800 placeholder-gray-600 outline-none pr-10"
                    placeholder="Confirm Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute -top-[35%] inset-y-0 right-0 px-4 text-gray-600 rounded-r-lg focus:outline-none flex items-center justify-center"
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              )}
              <div className="flex justify-center mb-6">
                <button
                  type="submit"
                  className="bg-[#0E6D55] w-full text-white font-bold px-4 py-3 rounded-lg"
                >
                  {isSignUp ? "Sign Up" : "Login"}
                </button>
              </div>
            </form>
          )}
          {isForgotPassword && (
            <div className=" text-gray-800 text-center">
              <p className="mb-6 text-[11px]">( Enter your email to reset your password. )</p>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                name="email"
                className="bg-gray-200 mb-4 px-4 py-3 w-full rounded-lg text-gray-800 placeholder-gray-600 outline-none"
                placeholder="Email"
              />
              <button
                onClick={handleForgotPassword}
                className="bg-gray-800 w-full text-white font-bold px-4 py-3 rounded-lg"
              >
                Reset Password
              </button>
            </div>
          )}
          {!isForgotPassword && (
            <div>
              <h2 className="text-gray-800 text-center xs:text-lg">
                {isSignUp
                  ? "Already have an account?"
                  : "Don't have an account yet?"}
                <button
                  onClick={toggleSignUpMode}
                  className="text-gray-800 font-bold px-1 focus:outline-none"
                >
                  {isSignUp ? "Login" : "Sign up"}
                </button>
              </h2>
              <div className="flex justify-center mt-4">
                <button
                  onClick={handleForgotPassword}
                  className="text-gray-800 font-bold px-1 focus:outline-none"
                >
                  Forgot Password?
                </button>
              </div>
            </div>
          )}
        </div>
        <div
          className="w-full min-h-[80vh] bg-gray-400 hidden lg:block lg:w-1/2 bg-cover"
          style={{
            backgroundImage:
              "url(/images/loginimg.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        ></div>
      </div>
    </div>
  );
};

export default LoginSignup;
