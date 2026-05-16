function Navbar({ setPage }) {

    const user = JSON.parse(
        localStorage.getItem("user")
    );

    const logout = () => {

        localStorage.removeItem("token");

        localStorage.removeItem("user");

        window.location.reload();
    };

    return (

        <div
            style={{
                padding: 20,
                display: "flex",
                gap: 10
            }}
        >

            <button
                onClick={() => setPage("items")}
            >
                Items
            </button>

            <button
                onClick={() =>
                    setPage("reservations")
                }
            >
                Reservations
            </button>

            {user?.role === "admin" && (

                <button
                    onClick={() =>
                        setPage("dashboard")
                    }
                >
                    Dashboard
                </button>
            )}

            <button onClick={logout}>
                Logout
            </button>

        </div>
    );
}

export default Navbar;