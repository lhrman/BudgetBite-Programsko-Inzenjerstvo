import React from 'react';
import { useAuth } from '../context/AuthContext'; // Uvozi tvoj hook
import { Navigate, useLocation } from 'react-router-dom';

/*
 * PrivateRoute služi kao čuvar.
 * 1. Provjerava je li autentikacija još u tijeku.
 * 2. Ako nije, provjerava postoji li 'user' objekt.
 * 3. Ako 'user' postoji, renderira 'children' (komponentu koju štiti).
 * 4. Ako 'user' ne postoji, preusmjerava na "/login".
 */
const PrivateRoute = ({ children }) => {
  // Dohvaćamo stanje iz našeg AuthContext-a
  const { user, isAuthLoading } = useAuth();
  const location = useLocation();

  // 1. Dok se provjerava token (isAuthLoading === true),
  //    prikazujemo poruku o učitavanju.
  if (isAuthLoading) {
    // Možeš ovdje staviti i neki ljepši spinner
    return <div>Učitavanje autentikacije...</div>; 
  }

  // 2. Ako provjera NIJE u tijeku I korisnik NIJE prijavljen
  if (!isAuthLoading && !user) {
    // Preusmjeri korisnika na /login.
    // 'state={{ from: location }}' je trik koji sprema trenutnu
    // stranicu na koju je korisnik htio ići, tako da ga 
    // nakon prijave možeš vratiti točno tamo.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Ako je sve u redu (nije loading i user postoji),
  //    prikaži stranicu koju je korisnik tražio.
  return children;
};

export default PrivateRoute;