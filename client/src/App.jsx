import { useState } from "react";

import Login from "./pages/Login";
import Register from "./pages/Registers";
import Items from "./pages/Items";
import Reservations from "./pages/Reservations";
import Dashboard from "./pages/Dashboard";

import Navbar from "./components/Navbar";

function App() {

    const [user, setUser] = useState(
        JSON.parse(localStorage.getItem("user"))
    );

    const [page, setPage] = useState("items");

    const token = localStorage.getItem("token");

    if (!token) {

        return (
            <div>
                <Login setUser={setUser} />
                <Register />
            </div>
        );
    }

    return (

        <div>

            <Navbar setPage={setPage} />

            {page === "items" && <Items />}

            {page === "reservations" && (
                <Reservations />
            )}

            {page === "dashboard" && (
                <Dashboard />
            )}

        </div>
    );
}

export default App;