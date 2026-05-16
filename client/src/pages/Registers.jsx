import { useEffect, useState } from "react";
import API from "../services/api";

function Reservations() {

    const [reservations, setReservations] = useState([]);

    const user = JSON.parse(localStorage.getItem("user"));

    useEffect(() => {
        loadReservations();
    }, []);

    const loadReservations = async () => {

        try {

            const res = await API.get("/reservations");

            setReservations(res.data);

        } catch (err) {

            console.log(err);
        }
    };

    const approveReservation = async (id) => {

        try {

            await API.put(`/reservations/${id}/approve`);

            alert("Reservation approved");

            loadReservations();

        } catch (err) {

            console.log(err);

            alert("Approval failed");
        }
    };

    const rejectReservation = async (id) => {

        try {

            await API.put(`/reservations/${id}/reject`);

            alert("Reservation rejected");

            loadReservations();

        } catch (err) {

            console.log(err);

            alert("Reject failed");
        }
    };

    return (
        <div style={{ padding: 20 }}>

            <h2>📋 Reservations</h2>

            {reservations.map((reservation) => (

                <div
                    key={reservation.id}
                    style={{
                        border: "1px solid gray",
                        margin: 10,
                        padding: 10
                    }}
                >

                    <h3>{reservation.item_name}</h3>

                    <p>User: {reservation.name}</p>

                    <p>Email: {reservation.email}</p>

                    <p>Quantity: {reservation.quantity}</p>

                    <p>Status: {reservation.status}</p>

                    <p>
                        Event Date:
                        {" "}
                        {new Date(
                            reservation.event_date
                        ).toLocaleDateString()}
                    </p>

                    {user?.role === "admin" && (

                        <div>

                            <button
                                onClick={() =>
                                    approveReservation(reservation.id)
                                }
                            >
                                Approve
                            </button>

                            <button
                                onClick={() =>
                                    rejectReservation(reservation.id)
                                }
                            >
                                Reject
                            </button>

                        </div>
                    )}

                </div>
            ))}
        </div>
    );
}

export default Reservations;