import React from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100">
      <img src="/logo.jpg" alt="logo" style={{width: '300px', height: '300px'}}/>
      <div className="flex flex-col items-center justify-center mt-20">
        <h1 className="text-4xl font-bold mb-4">Dobrodošli u BudgetBite!</h1>
        <p className="text-lg text-gray-700 mb-6">
          Upravljajte svojim budžetom kroz recepte i planiranje obroka.
        </p>

        <button
          onClick={() => navigate("/login")}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Prijava
        </button>

        <button
          onClick={() => navigate("/register")}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Registracija
        </button>

      </div>
    </div>
  );
}

export default Home;
