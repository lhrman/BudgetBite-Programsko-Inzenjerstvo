import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import LoginPage from "./pages/LoginPage";
import Creator from "./pages/Creator";
import Student from "./pages/Student";
import Dashboard from "./pages/DashBoard";
import FoodMoodJournal from './components/Student/FoodMoodJournalPage';
import PrivateRoute from "./components/PrivateRoute";
import Admin from './pages/Admin';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<LoginPage />} />
        <Route path="/creator" element={<Creator />} />
        <Route path="/student" element={<Student />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/student/food-mood-journal" element={<FoodMoodJournal />} />
        <Route path="/recipes" element={<div>Recepti</div>} />
        <Route path="/profile" element={<div>Moj profil</div>} />
        <Route path="/journal" element={<div>Dnevnik</div>}></Route>
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  );
}

export default App;
