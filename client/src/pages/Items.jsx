import { useEffect, useState } from "react";
import API from "../services/api";

function Items() {

    const [items, setItems] = useState([]);

    const [quantity, setQuantity] = useState(1);

    const [eventDate, setEventDate] = useState("");

    // ADD ITEM STATES
    const [name, setName] = useState("");
    const [category, setCategory] = useState("");
    const [itemQuantity, setItemQuantity] = useState("");
    const [price, setPrice] = useState("");

    // EDIT ITEM
    const [editingId, setEditingId] = useState(null);

    const user = JSON.parse(
        localStorage.getItem("user")
    );

    useEffect(() => {

        loadItems();

    }, []);

    // LOAD ITEMS
    const loadItems = async () => {

        try {

            const res = await API.get("/items");

            setItems(res.data);

        } catch (err) {

            console.log(err);
        }
    };

    // RESERVE ITEM
    const reserveItem = async (itemId) => {

        try {

            await API.post("/reservations", {
                item_id: itemId,
                quantity,
                event_date: eventDate
            });

            alert("Reserved successfully!");

        } catch (err) {

            console.log(err);

            alert(
                err.response?.data ||
                "Reservation failed"
            );
        }
    };

    // ADD ITEM
    const addItem = async () => {

        try {

            await API.post("/items", {
                name,
                category,
                quantity: itemQuantity,
                price_per_day: price
            });

            alert("Item added");

            setName("");
            setCategory("");
            setItemQuantity("");
            setPrice("");

            loadItems();

        } catch (err) {

            console.log(err);

            alert("Add failed");
        }
    };

    // DELETE ITEM
    const deleteItem = async (id) => {

        try {

            await API.delete(`/items/${id}`);

            alert("Item deleted");

            loadItems();

        } catch (err) {

            console.log(err);

            alert("Delete failed");
        }
    };

    // START EDIT
    const startEdit = (item) => {

        setEditingId(item.id);

        setName(item.name);

        setCategory(item.category);

        setItemQuantity(item.quantity);

        setPrice(item.price_per_day);
    };

    // UPDATE ITEM
    const updateItem = async () => {

        try {

            await API.put(`/items/${editingId}`, {
                name,
                category,
                quantity: itemQuantity,
                price_per_day: price
            });

            alert("Item updated");

            setEditingId(null);

            setName("");
            setCategory("");
            setItemQuantity("");
            setPrice("");

            loadItems();

        } catch (err) {

            console.log(err);

            alert("Update failed");
        }
    };

    return (

        <div style={{ padding: 20 }}>

            <h1>🎪 Rental Items</h1>

            {/* ADMIN ADD/EDIT FORM */}
            {user?.role === "admin" && (

                <div
                    style={{
                        border: "1px solid gray",
                        padding: 20,
                        marginBottom: 20
                    }}
                >

                    <h2>
                        {editingId
                            ? "✏️ Edit Item"
                            : "➕ Add Item"}
                    </h2>

                    <input
                        placeholder="Name"
                        value={name}
                        onChange={(e) =>
                            setName(e.target.value)
                        }
                    />

                    <br />
                    <br />

                    <input
                        placeholder="Category"
                        value={category}
                        onChange={(e) =>
                            setCategory(e.target.value)
                        }
                    />

                    <br />
                    <br />

                    <input
                        type="number"
                        placeholder="Quantity"
                        value={itemQuantity}
                        onChange={(e) =>
                            setItemQuantity(
                                e.target.value
                            )
                        }
                    />

                    <br />
                    <br />

                    <input
                        type="number"
                        placeholder="Price Per Day"
                        value={price}
                        onChange={(e) =>
                            setPrice(e.target.value)
                        }
                    />

                    <br />
                    <br />

                    {!editingId ? (

                        <button onClick={addItem}>
                            Add Item
                        </button>

                    ) : (

                        <button onClick={updateItem}>
                            Update Item
                        </button>
                    )}

                </div>
            )}

            {/* ITEMS */}
            {items.map((item) => (

                <div
                    key={item.id}
                    style={{
                        border: "1px solid gray",
                        margin: 10,
                        padding: 10
                    }}
                >

                    <h2>{item.name}</h2>

                    <p>
                        Category:
                        {" "}
                        {item.category}
                    </p>

                    <p>
                        Available Quantity:
                        {" "}
                        {item.quantity}
                    </p>

                    <p>
                        Price Per Day:
                        {" "}
                        ${item.price_per_day}
                    </p>

                    {/* CUSTOMER */}
                    {user?.role !== "admin" && (

                        <div>

                            <label>
                                Quantity:
                            </label>

                            <br />

                            <input
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={(e) =>
                                    setQuantity(
                                        e.target.value
                                    )
                                }
                            />

                            <br />
                            <br />

                            <label>
                                Event Date:
                            </label>

                            <br />

                            <input
                                type="date"
                                value={eventDate}
                                onChange={(e) =>
                                    setEventDate(
                                        e.target.value
                                    )
                                }
                            />

                            <br />
                            <br />

                            <button
                                onClick={() =>
                                    reserveItem(item.id)
                                }
                            >
                                Reserve
                            </button>

                        </div>
                    )}

                    {/* ADMIN */}
                    {user?.role === "admin" && (

                        <div>

                            <button
                                onClick={() =>
                                    startEdit(item)
                                }
                            >
                                Edit
                            </button>

                            {" "}

                            <button
                                onClick={() =>
                                    deleteItem(item.id)
                                }
                            >
                                Delete
                            </button>

                        </div>
                    )}

                </div>
            ))}
        </div>
    );
}

export default Items;