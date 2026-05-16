function Navbar({ setPage }) {
    const logout = () => {
        localStorage.removeItem("token");
        window.location.reload();
    };

    return (
        <div style={{ padding: 10, background: "#eee" }}>
            <button onClick={() => setPage("items")}>Items</button>
            <button onClick={() => setPage("reservations")}>Reservations</button>
            <button onClick={logout}>Logout</button>
        </div>
    );
}

export default Navbar;