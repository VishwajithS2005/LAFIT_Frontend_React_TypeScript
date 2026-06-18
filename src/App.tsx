import { BrowserRouter, Route, Routes } from "react-router-dom";
import Intro from "./pages/Intro";
import Login from "./pages/Login";
import Register from "./pages/Register";
import "./App.css";
import ProtectedRoute from "./components/ProtectedRoute";
import UserHome from "./pages/UserHome";
import AdminHome from "./pages/AdminHome";
import Forbidden from "./pages/Forbidden";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Intro />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route element={<ProtectedRoute allowedRoles={["USER"]} />}>
                    <Route path="/dashboard" element={<UserHome />} />
                </Route>

                <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
                    <Route path="/admin" element={<AdminHome />} />
                </Route>

                <Route path="/forbidden" element={<Forbidden />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App