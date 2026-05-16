import { useState } from "react";
import API from "../services/api";

function Login({ setUser }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const res = await API.post("/login", {
                email,
                password
            });

            localStorage.setItem("token", res.data.token);
            setUser(res.data.user);

        } catch (err) {
            alert(err.response?.data || "Login error");
        }
    };

    return (
        <div style={{ padding: 20 }}>
            <h2>Login</h2>

            <form onSubmit={handleLogin}>
                <input
                    placeholder="Email"
                    onChange={(e) => setEmail(e.target.value)}
                />
                <br /><br />

                <input
                    type="password"
                    placeholder="Password"
                    onChange={(e) => setPassword(e.target.value)}
                />
                <br /><br />

                <button>Login</button>
            </form>
        </div>
    );
}

export default Login;