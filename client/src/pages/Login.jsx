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

            localStorage.setItem(
                "token",
                res.data.token
            );

            localStorage.setItem(
                "user",
                JSON.stringify(res.data.user)
            );

            setUser(res.data.user);

            alert("Login successful!");

        } catch (err) {

            console.log(err);

            alert(
                err.response?.data ||
                "Login error"
            );
        }
    };

    return (

        <div style={{ padding: 20 }}>

            <h2>Login</h2>

            <form onSubmit={handleLogin}>

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) =>
                        setEmail(e.target.value)
                    }
                />

                <br />
                <br />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) =>
                        setPassword(e.target.value)
                    }
                />

                <br />
                <br />

                <button type="submit">
                    Login
                </button>

            </form>
        </div>
    );
}

export default Login;