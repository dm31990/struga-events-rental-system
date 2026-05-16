import { useState } from "react";
import API from "../services/api";

function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleRegister = async (e) => {
        e.preventDefault();

        try {
            await API.post("/register", {
                name,
                email,
                password
            });

            alert("User created!");
        } catch (err) {
            alert("Error registering");
        }
    };

    return (
        <div style={{ padding: 20 }}>
            <h2>Register</h2>

            <form onSubmit={handleRegister}>
                <input placeholder="Name" onChange={(e) => setName(e.target.value)} />
                <br /><br />

                <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
                <br /><br />

                <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
                <br /><br />

                <button>Register</button>
            </form>
        </div>
    );
}

export default Register;