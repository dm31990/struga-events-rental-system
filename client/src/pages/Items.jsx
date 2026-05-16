import { useEffect, useState } from "react";
import API from "../services/api";

function Items() {

    const [items, setItems] = useState([]);

    useEffect(() => {
        loadItems();
    }, []);

    const loadItems = async () => {

        try {

            const res = await API.get("/items");

            setItems(res.data);

        } catch (err) {

            console.log(err);
        }
    };

    const reserveItem = async (id) => {

        try {

            await API.post("/reservations", {
                item_id: id,
                quantity: 1
            });

            alert("Reserved successfully!");

        } catch (err) {

            console.log(err);

            alert("Reservation failed");
        }
    };

    return (
        <div style={{ padding: 20 }}>

            <h2>🎪 Rental Items</h2>

            {items.map((item) => (

                <div
                    key={item.id}
                    style={{
                        border: "1px solid gray",
                        margin: 10,
                        padding: 10
                    }}
                >

                    <h3>{item.name}</h3>

                    <p>Category: {item.category}</p>

                    <p>Quantity: {item.quantity}</p>

                    <p>Price Per Day: ${item.price_per_day}</p>

                    <button onClick={() => reserveItem(item.id)}>
                        Reserve
                    </button>

                </div>
            ))}
        </div>
    );
}

export default Items;