import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api", // promijeni kad dodaš backend
});

export default api;
