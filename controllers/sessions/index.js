const express = require("express");
const Users = require("../../models/users");
const bcrypt = require("bcrypt");

const router = express.Router();

// Create Session (Login)
router.post("/", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    function incorrectResponse(res) {
        res.status(400).json({
            message: "Incorrect username or password",
        });
    }
    Users.getByUsername(username)
        .then((user) => {
            // Using Sync here currently
            const valid = user && bcrypt.compareSync(password, user.password);
            if (valid) {
                req.session.user_id = user.id;
                req.session.username = user.username;
                res.json({
                    user_id: user.id,
                    username: username,
                });
            } else {
                incorrectResponse(res);
            }
        })
        .catch((error) => {
            incorrectResponse(res);
        });
});

// Get Session (Login)
router.get("/", (req, res) => {
    if (req.session.username) {
        res.json({
            user_id: req.session.user_id,
            username: req.session.username,
        });
    } else {
        res.status(401).json({
            message: "Not logged in",
        });
    }
});

// 3. Delete Session (Logout)
router.delete("/", (req, res) => {
    req.session.destroy();
    res.json({ message: "Logged out" });
});

module.exports = router;