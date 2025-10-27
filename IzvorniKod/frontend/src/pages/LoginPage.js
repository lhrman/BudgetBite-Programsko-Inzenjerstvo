import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import '../styles/global.css';

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
    React.createElement("div", { className: "login-outer-container" },
      React.createElement("div", { className: "login-inner-container" },
        // Naslov
        React.createElement("h2", { className: "login-title" },
          isLogin ? "Prijava" : "Registracija"
        ),

        // PRIJAVA MOD
        isLogin ? 
          !showEmailLogin ? 
            React.createElement("div", { className: "login-buttons-container" },
              React.createElement("button", {
                type: "button",
                onClick: handleGoogleLogin,
                className: "button2"
              }, "Google prijava"),

              React.createElement("button", {
                type: "button",
                onClick: handleAppleLogin,
                className: "button2"
              }, "Apple Prijava"),

              /*
              React.createElement("div", { className: "div-lines-container" },
                React.createElement("div", { className: "div-line" }),
                React.createElement("div", { className: "div-line" })
              ),
              */

              React.createElement("button", {
                type: "button",
                onClick: handleEmailLoginClick,
                className: "button2"
              }, "Prijavi se s emailom"),

              React.createElement("div", { className: "switch-button-container" },
                React.createElement("button", {
                  type: "button",
                  onClick: switchToRegister,
                  className: "button2"
                }, "Nemaš račun? Registriraj se")
              )
            )
          : 
            React.createElement("form", { onSubmit: handleLogin },
              React.createElement("button", {
                type: "button",
                onClick: () => setShowEmailLogin(false),
                className: "button2"
              },
                React.createElement("span", { className: "back-button-title" }),
                "← Natrag"
              ),

              React.createElement("input", {
                type: "email",
                placeholder: "Email",
                value: email,
                onChange: (e) => setEmail(e.target.value),
                className: "email-input",
                required: true
              }),

              React.createElement("input", {
                type: "password",
                placeholder: "Lozinka",
                value: password,
                onChange: (e) => setPassword(e.target.value),
                className: "password-input",
                required: true
              }),
              
              error && React.createElement("p", { className: "error-title" }, error),

              React.createElement("div", { className: "switch-button-container" },
                React.createElement("button", {
                  type: "submit",
                  className: "button2"
                }, "Prijavi se"),

                React.createElement("button", {
                  type: "button",
                  onClick: switchToRegister,
                  className: "button2"
                }, "Nemaš račun? Registriraj se")
              )
            )
        : 
        // REGISTRACIJA MOD
        React.createElement(React.Fragment, null,
          !role ? 
            React.createElement("div", { className: "registration-container" },
              React.createElement("p", { className: "registration-title" }, "Odaberite svoju ulogu:"),
              
              React.createElement("div", { className: "button-row-container" },
                React.createElement("button", {
                  onClick: () => handleRoleSelect("student"),
                  className: "button3"
                }, "Student"),

                React.createElement("button", {
                  onClick: () => handleRoleSelect("creator"),
                  className: "button3"
                }, "Kreator sadržaja"),
              ),

              React.createElement("div", { className: "switch-button-container" },
                React.createElement("button", {
                  type: "button",
                  onClick: switchToLogin,
                  className: "button2"
                }, "Već imaš račun? Prijavi se")
              )
            )
          : !showEmailLogin ?
            React.createElement("div", { className: "login-buttons-container" },
              React.createElement("p", { className: "role-title" },
                "Uloga: ",
                React.createElement("strong", null, role === "student" ? "Student" : "Kreator sadržaja")
              ),

              React.createElement("button", {
                type: "button",
                onClick: handleGoogleLogin,
                className: "button2"
              }, "Google registracija"),

              React.createElement("button", {
                type: "button",
                onClick: handleAppleLogin,
                className: "button2"
              }, "Apple registracija"),

              /*
              React.createElement("div", { className: "div-lines-container" },
                React.createElement("div", { className: "div-line" }),
                React.createElement("div", { className: "div-line" })
              ),
              */

              React.createElement("button", {
                type: "button",
                onClick: () => setShowEmailLogin(true),
                className: "button2"
              }, "Registriraj se s emailom"),

              React.createElement("div", { className: "switch-button-container" },
                React.createElement("button", {
                  type: "button",
                  onClick: switchToLogin,
                  className: "button2"
                }, "Već imaš račun? Prijavi se")
              )
            )
          :
            React.createElement("form", { onSubmit: handleRegister },
              React.createElement("button", {
                type: "button",
                onClick: () => setShowEmailLogin(false),
                className: "button2"
              },
                React.createElement("span", { className: "back-button-title" }),
                "← Natrag"
              ),

              React.createElement("p", { className: "role-title" },
                "Uloga: ",
                React.createElement("strong", null, role === "student" ? "Student" : "Kreator sadržaja")
              ),

              React.createElement("input", {
                type: "text",
                placeholder: "Ime i prezime",
                value: name,
                onChange: (e) => setName(e.target.value),
                className: "name-input",
                required: true
              }),

              React.createElement("input", {
                type: "email",
                placeholder: "Email",
                value: email,
                onChange: (e) => setEmail(e.target.value),
                className: "email-input",
                required: true
              }),

              React.createElement("input", {
                type: "password",
                placeholder: "Lozinka",
                value: password,
                onChange: (e) => setPassword(e.target.value),
                className: "password-input",
                required: true
              }),

              error && React.createElement("p", { className: "error-title" }, error),

              React.createElement("div", { className: "switch-button-container" },
                React.createElement("button", {
                  type: "submit",
                  className: "button2"
                }, "Registriraj se"),
              ) 
            )
        )
      )
    )
  );
}

export default LoginPage;