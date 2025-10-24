import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function LoginPage() {
  const [role, setRole] = useState(""); // student/kreator sadržaja
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(""); //registracija
  const [error, setError] = useState("");
  const [isLogin, setIsLogin] = useState(true); // t(prijava), f(reg)
  const [showEmailLogin, setShowEmailLogin] = useState(false); // forma za email
  const navigate = useNavigate();

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setShowEmailLogin(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await api.post("/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Neispravni podaci za prijavu.");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (!role) {
      setError("Molimo odaberite ulogu.");
      return;
    }

    try {
      const res = await api.post("/register", { name, email, password, role });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", role);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Greška pri registraciji. Pokušajte ponovno.");
    }
  };

  const handleGoogleLogin = () => {
    console.log("Google prijava");
  };

  const handleAppleLogin = () => {
    console.log("Apple prijava");
  };

  const handleEmailLoginClick = () => {
    setShowEmailLogin(true);
    setError("");
  };

  const switchToLogin = () => {
    setIsLogin(true);
    setShowEmailLogin(false);
    setError("");
    setRole("");
  };

  const switchToRegister = () => {
    setIsLogin(false);
    setShowEmailLogin(false);
    setError("");
  };

  return (
    React.createElement("div", { className: "flex flex-col items-center justify-center min-h-screen bg-gray-100" },
      React.createElement("div", { className: "bg-white p-8 rounded-2xl shadow-md w-96" },
        // Naslov
        React.createElement("h2", { className: "text-2xl font-bold mb-6 text-center" },
          isLogin ? "Prijava" : "Registracija"
        ),

        // PRIJAVA MOD
        isLogin ? 
          !showEmailLogin ? 
            React.createElement("div", { className: "space-y-4" },
              React.createElement("button", {
                type: "button",
                onClick: handleGoogleLogin,
                className: "w-full bg-white border border-gray-300 text-gray-700 p-3 rounded-lg hover:bg-gray-50 transition duration-200 font-medium flex items-center justify-center"
              }, "Google prijava"),

              React.createElement("button", {
                type: "button",
                onClick: handleAppleLogin,
                className: "w-full bg-black text-white p-3 rounded-lg hover:bg-gray-800 transition duration-200 font-medium flex items-center justify-center"
              }, "Apple Prijava"),

              React.createElement("div", { className: "flex items-center my-4" },
                React.createElement("div", { className: "flex-1 h-px bg-gray-300" }),
                React.createElement("div", { className: "flex-1 h-px bg-gray-300" })
              ),

              React.createElement("button", {
                type: "button",
                onClick: handleEmailLoginClick,
                className: "w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition duration-200 font-medium"
              }, "Prijavi se s emailom"),

              React.createElement("div", { className: "mt-4 text-center" },
                React.createElement("button", {
                  type: "button",
                  onClick: switchToRegister,
                  className: "text-blue-600 hover:text-blue-800 text-sm"
                }, "Nemaš račun? Registriraj se")
              )
            )
          : 
            React.createElement("form", { onSubmit: handleLogin },
              React.createElement("button", {
                type: "button",
                onClick: () => setShowEmailLogin(false),
                className: "mb-4 text-gray-600 hover:text-gray-800 flex items-center text-sm"
              },
                React.createElement("span", { className: "mr-1" }, "←"),
                "Natrag"
              ),

              React.createElement("input", {
                type: "email",
                placeholder: "Email",
                value: email,
                onChange: (e) => setEmail(e.target.value),
                className: "border w-full p-3 mb-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500",
                required: true
              }),

              React.createElement("input", {
                type: "password",
                placeholder: "Lozinka",
                value: password,
                onChange: (e) => setPassword(e.target.value),
                className: "border w-full p-3 mb-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500",
                required: true
              }),
              
              error && React.createElement("p", { className: "text-red-500 text-sm mb-3 text-center" }, error),

              React.createElement("button", {
                type: "submit",
                className: "w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition duration-200 font-medium"
              }, "Prijavi se"),

              React.createElement("div", { className: "mt-4 text-center" },
                React.createElement("button", {
                  type: "button",
                  onClick: switchToRegister,
                  className: "text-blue-600 hover:text-blue-800 text-sm"
                }, "Nemaš račun? Registriraj se")
              )
            )
        : 
        // REGISTRACIJA MOD
        React.createElement(React.Fragment, null,
          !role ? 
            React.createElement("div", { className: "space-y-4" },
              React.createElement("p", { className: "mb-4 text-gray-700 text-center" }, "Odaberite svoju ulogu:"),
              
              React.createElement("button", {
                onClick: () => handleRoleSelect("student"),
                className: "w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition duration-200 font-medium"
              }, "Student"),

              React.createElement("button", {
                onClick: () => handleRoleSelect("creator"),
                className: "w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition duration-200 font-medium"
              }, "Kreator sadržaja"),

              React.createElement("div", { className: "mt-4 text-center" },
                React.createElement("button", {
                  type: "button",
                  onClick: switchToLogin,
                  className: "text-blue-600 hover:text-blue-800 text-sm"
                }, "Već imaš račun? Prijavi se")
              )
            )
          : !showEmailLogin ?
            React.createElement("div", { className: "space-y-4" },
              React.createElement("p", { className: "mb-4 text-gray-700 text-center" },
                "Uloga: ",
                React.createElement("strong", null, role === "student" ? "Student" : "Kreator sadržaja")
              ),

              React.createElement("button", {
                type: "button",
                onClick: handleGoogleLogin,
                className: "w-full bg-white border border-gray-300 text-gray-700 p-3 rounded-lg hover:bg-gray-50 transition duration-200 font-medium flex items-center justify-center"
              }, "Google registracija"),

              React.createElement("button", {
                type: "button",
                onClick: handleAppleLogin,
                className: "w-full bg-black text-white p-3 rounded-lg hover:bg-gray-800 transition duration-200 font-medium flex items-center justify-center"
              }, "Apple registracija"),

              React.createElement("div", { className: "flex items-center my-4" },
                React.createElement("div", { className: "flex-1 h-px bg-gray-300" }),
                React.createElement("div", { className: "flex-1 h-px bg-gray-300" })
              ),

              React.createElement("button", {
                type: "button",
                onClick: () => setShowEmailLogin(true),
                className: "w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition duration-200 font-medium"
              }, "Registriraj se s emailom"),

              React.createElement("div", { className: "mt-4 text-center" },
                React.createElement("button", {
                  type: "button",
                  onClick: switchToLogin,
                  className: "text-blue-600 hover:text-blue-800 text-sm"
                }, "Već imaš račun? Prijavi se")
              )
            )
          :
            React.createElement("form", { onSubmit: handleRegister },
              React.createElement("button", {
                type: "button",
                onClick: () => setShowEmailLogin(false),
                className: "mb-4 text-gray-600 hover:text-gray-800 flex items-center text-sm"
              },
                React.createElement("span", { className: "mr-1" }, "←"),
                "Natrag"
              ),

              React.createElement("p", { className: "mb-4 text-gray-700 text-center" },
                "Uloga: ",
                React.createElement("strong", null, role === "student" ? "Student" : "Kreator sadržaja")
              ),

              React.createElement("input", {
                type: "text",
                placeholder: "Ime i prezime",
                value: name,
                onChange: (e) => setName(e.target.value),
                className: "border w-full p-3 mb-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500",
                required: true
              }),

              React.createElement("input", {
                type: "email",
                placeholder: "Email",
                value: email,
                onChange: (e) => setEmail(e.target.value),
                className: "border w-full p-3 mb-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500",
                required: true
              }),

              React.createElement("input", {
                type: "password",
                placeholder: "Lozinka",
                value: password,
                onChange: (e) => setPassword(e.target.value),
                className: "border w-full p-3 mb-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500",
                required: true
              }),

              error && React.createElement("p", { className: "text-red-500 text-sm mb-3 text-center" }, error),

              React.createElement("button", {
                type: "submit",
                className: "w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition duration-200 font-medium"
              }, "Registriraj se"),
            )
        )
      )
    )
  );
}

export default LoginPage;