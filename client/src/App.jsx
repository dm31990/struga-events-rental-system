import { useState } from "react";
import Login from "./pages/Login";
import Register from "./pages/Registers";
import Items from "./pages/Items";
import Reservations from "./pages/Reservations";
import Navbar from "./components/Navbar";

function App() {
    const [user, setUser] = useState(null);
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
            {page === "reservations" && <Reservations />}
        </div>
    );
}

export default App;