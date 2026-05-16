import { useEffect, useState } from "react";
import API from "../services/api";

function Dashboard() {

    const [stats, setStats] = useState({});

    useEffect(() => {

        loadDashboard();

    }, []);

    const loadDashboard = async () => {

        try {

            const res = await API.get(
                "/admin/dashboard"
            );

            setStats(res.data);

        } catch (err) {

            console.log(err);
        }
    };

    return (

        <div style={{ padding: 20 }}>

            <h1>📊 Admin Dashboard</h1>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns:
                        "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: 20,
                    marginTop: 20
                }}
            >

                <div style={cardStyle}>
                    <h2>Total Reservations</h2>
                    <p>{stats.totalReservations}</p>
                </div>

                <div style={cardStyle}>
                    <h2>Pending Reservations</h2>
                    <p>{stats.pendingReservations}</p>
                </div>

                <div style={cardStyle}>
                    <h2>Approved Reservations</h2>
                    <p>{stats.approvedReservations}</p>
                </div>

                <div style={cardStyle}>
                    <h2>Total Revenue</h2>
                    <p>${stats.totalRevenue}</p>
                </div>

                <div style={cardStyle}>
                    <h2>Total Items</h2>
                    <p>{stats.totalItems}</p>
                </div>

                <div style={cardStyle}>
                    <h2>Total Users</h2>
                    <p>{stats.totalUsers}</p>
                </div>

            </div>
        </div>
    );
}

const cardStyle = {
    border: "1px solid #ccc",
    borderRadius: 10,
    padding: 20,
    textAlign: "center",
    backgroundColor: "#f5f5f5"
};

export default Dashboard;