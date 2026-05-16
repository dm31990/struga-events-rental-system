const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("./db");

const app = express();

const JWT_SECRET = "strugaEventsSecretKey123";

// ======================
// MIDDLEWARE
// ======================

app.use(cors());
app.use(express.json());

// ======================
// TEST ROUTES
// ======================

app.get("/", (req, res) => {
    res.send("Struga Events API Running");
});

app.get("/test-db", (req, res) => {

    db.query("SELECT 1", (err) => {

        if (err) {
            console.log(err);
            return res.status(500).send("Database connection failed");
        }

        res.send("Database Connected Successfully!");
    });
});

// ======================
// JWT MIDDLEWARE
// ======================

function verifyToken(req, res, next) {

    const authHeader = req.headers["authorization"];

    if (!authHeader) {
        return res.status(403).send("Token required");
    }

    const token = authHeader.split(" ")[1];

    try {

        const decoded = jwt.verify(token, JWT_SECRET);

        req.user = decoded;

        next();

    } catch (err) {

        return res.status(401).send("Invalid or expired token");
    }
}

function verifyAdmin(req, res, next) {

    if (req.user.role !== "admin") {
        return res.status(403).send("Admin access required");
    }

    next();
}

// ======================
// AUTH ROUTES
// ======================

// REGISTER
app.post("/register", async (req, res) => {

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).send("All fields are required");
    }

    try {

        const checkSql = "SELECT * FROM users WHERE email = ?";

        db.query(checkSql, [email], async (err, results) => {

            if (err) {
                console.log(err);
                return res.status(500).send("Server error");
            }

            if (results.length > 0) {
                return res.status(400).send("Email already exists");
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const sql = `
                INSERT INTO users (name, email, password)
                VALUES (?, ?, ?)
            `;

            db.query(sql, [name, email, hashedPassword], (err) => {

                if (err) {
                    console.log(err);
                    return res.status(500).send("Error registering user");
                }

                res.send("User registered successfully");
            });
        });

    } catch (error) {

        console.log(error);

        res.status(500).send("Server error");
    }
});

// LOGIN
app.post("/login", (req, res) => {

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send("Email and password required");
    }

    const sql = "SELECT * FROM users WHERE email = ?";

    db.query(sql, [email], async (err, results) => {

        if (err) {
            console.log(err);
            return res.status(500).send("Server error");
        }

        if (results.length === 0) {
            return res.status(404).send("User not found");
        }

        const user = results[0];

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).send("Wrong password");
        }

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role
            },
            JWT_SECRET,
            {
                expiresIn: "1h"
            }
        );

        res.json({
            message: "Login successful",
            token: token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    });
});

// ======================
// PROFILE
// ======================

app.get("/profile", verifyToken, (req, res) => {

    res.json({
        message: "Protected route access granted",
        user: req.user
    });
});

// ======================
// ITEMS ROUTES
// ======================

// GET ALL ITEMS
app.get("/items", (req, res) => {

    const sql = "SELECT * FROM items";

    db.query(sql, (err, results) => {

        if (err) {
            console.log(err);
            return res.status(500).send("Error fetching items");
        }

        res.json(results);
    });
});

// ADD ITEM
app.post("/items", (req, res) => {

    const {
        name,
        category,
        quantity,
        price_per_day
    } = req.body;

    if (!name || !category || !quantity || !price_per_day) {
        return res.status(400).send("All fields are required");
    }

    const sql = `
        INSERT INTO items (
            name,
            category,
            quantity,
            price_per_day
        )
        VALUES (?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            name,
            category,
            quantity,
            price_per_day
        ],
        (err) => {

            if (err) {
                console.log(err);
                return res.status(500).send("Error adding item");
            }

            res.send("Item added successfully");
        }
    );
});

// ======================
// RESERVATIONS ROUTES
// ======================

// CREATE RESERVATION
app.post("/reservations", verifyToken, (req, res) => {

    const {
        item_id,
        quantity,
        event_date
    } = req.body;

    const user_id = req.user.id;

    // CHECK ITEM STOCK
    const stockSql = `
        SELECT * FROM items
        WHERE id = ?
    `;

    db.query(stockSql, [item_id], (err, itemResults) => {

        if (err) {
            console.log(err);
            return res.status(500).send("Server error");
        }

        if (itemResults.length === 0) {
            return res.status(404).send("Item not found");
        }

        const item = itemResults[0];

        // CHECK AVAILABLE QUANTITY
        if (quantity > item.quantity) {
            return res
                .status(400)
                .send("Not enough inventory available");
        }

        const status = "pending";

        const total_price =
            quantity * item.price_per_day;

        // CREATE RESERVATION
        const reservationSql = `
            INSERT INTO reservations (
                user_id,
                event_date,
                status,
                total_price
            )
            VALUES (?, ?, ?, ?)
        `;

        db.query(
            reservationSql,
            [
                user_id,
                event_date,
                status,
                total_price
            ],
            (err, reservationResult) => {

                if (err) {
                    console.log(err);
                    return res
                        .status(500)
                        .send("Error creating reservation");
                }

                const reservation_id =
                    reservationResult.insertId;

                // ADD ITEM TO RESERVATION_ITEMS
                const itemSql = `
                    INSERT INTO reservation_items (
                        reservation_id,
                        item_id,
                        quantity
                    )
                    VALUES (?, ?, ?)
                `;

                db.query(
                    itemSql,
                    [
                        reservation_id,
                        item_id,
                        quantity
                    ],
                    (err) => {

                        if (err) {
                            console.log(err);
                            return res
                                .status(500)
                                .send("Error adding reservation item");
                        }

                        res.send(
                            "Reservation created successfully"
                        );
                    }
                );
            }
        );
    });
});

// GET ALL RESERVATIONS
app.get("/reservations", verifyToken, (req, res) => {

    const sql = `
        SELECT
            r.id,
            u.name,
            u.email,
            i.name AS item_name,
            ri.quantity,
            r.status,
            r.event_date
        FROM reservations r

        JOIN users u
            ON r.user_id = u.id

        JOIN reservation_items ri
            ON r.id = ri.reservation_id

        JOIN items i
            ON ri.item_id = i.id
    `;

    db.query(sql, (err, results) => {

        if (err) {
            console.log(err);
            return res.status(500).send("Error fetching reservations");
        }

        res.json(results);
    });
});

// ======================
// START SERVER
// ======================

const PORT = 5000;

// APPROVE RESERVATION
app.put(
    "/reservations/:id/approve",
    verifyToken,
    verifyAdmin,
    (req, res) => {

        const reservationId = req.params.id;

        // GET RESERVATION ITEM
        const reservationSql = `
            SELECT
                ri.item_id,
                ri.quantity
            FROM reservation_items ri
            WHERE ri.reservation_id = ?
        `;

        db.query(
            reservationSql,
            [reservationId],
            (err, results) => {

                if (err) {
                    console.log(err);
                    return res
                        .status(500)
                        .send("Server error");
                }

                if (results.length === 0) {
                    return res
                        .status(404)
                        .send("Reservation items not found");
                }

                const reservationItem = results[0];

                // UPDATE RESERVATION STATUS
                const approveSql = `
                    UPDATE reservations
                    SET status = 'approved'
                    WHERE id = ?
                `;

                db.query(
                    approveSql,
                    [reservationId],
                    (err) => {

                        if (err) {
                            console.log(err);
                            return res
                                .status(500)
                                .send("Error approving reservation");
                        }

                        // REDUCE ITEM STOCK
                        const stockSql = `
                            UPDATE items
                            SET quantity = quantity - ?
                            WHERE id = ?
                        `;

                        db.query(
                            stockSql,
                            [
                                reservationItem.quantity,
                                reservationItem.item_id
                            ],
                            (err) => {

                                if (err) {
                                    console.log(err);
                                    return res
                                        .status(500)
                                        .send("Error updating stock");
                                }

                                res.send(
                                    "Reservation approved and inventory updated"
                                );
                            }
                        );
                    }
                );
            }
        );
    }
);

// REJECT RESERVATION
app.put(
    "/reservations/:id/reject",
    verifyToken,
    verifyAdmin,
    (req, res) => {

        const reservationId = req.params.id;

        const sql = `
            UPDATE reservations
            SET status = 'cancelled'
            WHERE id = ?
        `;

        db.query(sql, [reservationId], (err) => {

            if (err) {
                console.log(err);
                return res.status(500).send("Error rejecting reservation");
            }

            res.send("Reservation rejected");
        });
    }
);

// ======================
// ADMIN DASHBOARD
// ======================

app.get(
    "/admin/dashboard",
    verifyToken,
    verifyAdmin,
    (req, res) => {

        const dashboardData = {};

        // TOTAL RESERVATIONS
        db.query(
            "SELECT COUNT(*) AS totalReservations FROM reservations",
            (err, reservationResults) => {

                if (err) {
                    console.log(err);
                    return res.status(500).send("Server error");
                }

                dashboardData.totalReservations =
                    reservationResults[0].totalReservations;

                // PENDING
                db.query(
                    `
                    SELECT COUNT(*) AS pendingReservations
                    FROM reservations
                    WHERE status = 'pending'
                    `,
                    (err, pendingResults) => {

                        if (err) {
                            console.log(err);
                            return res.status(500).send("Server error");
                        }

                        dashboardData.pendingReservations =
                            pendingResults[0].pendingReservations;

                        // APPROVED
                        db.query(
                            `
                            SELECT COUNT(*) AS approvedReservations
                            FROM reservations
                            WHERE status = 'approved'
                            `,
                            (err, approvedResults) => {

                                if (err) {
                                    console.log(err);
                                    return res.status(500).send("Server error");
                                }

                                dashboardData.approvedReservations =
                                    approvedResults[0].approvedReservations;

                                // TOTAL REVENUE
                                db.query(
                                    `
                                    SELECT SUM(amount) AS totalRevenue
                                    FROM invoices
                                    WHERE payment_status = 'paid'
                                    `,
                                    (err, revenueResults) => {

                                        if (err) {
                                            console.log(err);
                                            return res.status(500).send("Server error");
                                        }

                                        dashboardData.totalRevenue =
                                            revenueResults[0].totalRevenue || 0;

                                        // TOTAL ITEMS
                                        db.query(
                                            `
                                            SELECT COUNT(*) AS totalItems
                                            FROM items
                                            `,
                                            (err, itemResults) => {

                                                if (err) {
                                                    console.log(err);
                                                    return res.status(500).send("Server error");
                                                }

                                                dashboardData.totalItems =
                                                    itemResults[0].totalItems;

                                                // TOTAL USERS
                                                db.query(
                                                    `
                                                    SELECT COUNT(*) AS totalUsers
                                                    FROM users
                                                    `,
                                                    (err, userResults) => {

                                                        if (err) {
                                                            console.log(err);
                                                            return res.status(500).send("Server error");
                                                        }

                                                        dashboardData.totalUsers =
                                                            userResults[0].totalUsers;

                                                        res.json(dashboardData);
                                                    }
                                                );
                                            }
                                        );
                                    }
                                );
                            }
                        );
                    }
                );
            }
        );
    }
);

// DELETE ITEM
app.delete(
    "/items/:id",
    verifyToken,
    verifyAdmin,
    (req, res) => {

        const itemId = req.params.id;

        // DELETE reservation_items first
        const deleteReservationItems = `
            DELETE FROM reservation_items
            WHERE item_id = ?
        `;

        db.query(
            deleteReservationItems,
            [itemId],
            (err) => {

                if (err) {
                    console.log(err);
                    return res
                        .status(500)
                        .send(err.sqlMessage);
                }

                // DELETE item
                const deleteItemSql = `
                    DELETE FROM items
                    WHERE id = ?
                `;

                db.query(
                    deleteItemSql,
                    [itemId],
                    (err) => {

                        if (err) {
                            console.log(err);
                            return res
                                .status(500)
                                .send(err.sqlMessage);
                        }

                        res.send(
                            "Item deleted successfully"
                        );
                    }
                );
            }
        );
    console.log(req.user);
    }
    
);

// UPDATE ITEM
app.put(
    "/items/:id",
    verifyToken,
    verifyAdmin,
    (req, res) => {

        const itemId = req.params.id;

        const {
            name,
            category,
            quantity,
            price_per_day
        } = req.body;

        const sql = `
            UPDATE items
            SET
                name = ?,
                category = ?,
                quantity = ?,
                price_per_day = ?
            WHERE id = ?
        `;

        db.query(
            sql,
            [
                name,
                category,
                quantity,
                price_per_day,
                itemId
            ],
            (err, result) => {

                if (err) {

                    console.log(err);

                    return res
                        .status(500)
                        .send(err.sqlMessage);
                }

                res.send(
                    "Item updated successfully"
                );
            }
        );
    console.log(req.user);
}
);



app.listen(PORT, () => {

    console.log(`Server running on port ${PORT}`);
});