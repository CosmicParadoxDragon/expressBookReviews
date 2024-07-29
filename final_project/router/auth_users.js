const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}

const authenticatedUser = (username,password)=>{ //returns boolean
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    // Return true if any valid user is found, otherwise false
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(404).json({ message: "Please Enter a username and password." });
    }

    if (authenticatedUser(username, password)) {
        let accessToken =  jwt.sign({
            data: password
        }, 'access', { expiresIn: '1h' });

        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).json({ message: "Successfully logged in." });
    } else {
        return res.status(208).json({ message: "Invalid Login Credentials. Check Username or Password"});
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const user = req.session.authorization['username'];
    if (books[isbn].reviews[user]) {

        books[isbn].reviews[user]['rating'] = req.body.rating;
        books[isbn].reviews[user]['text'] = req.body.text;
        return res.status(200).json({ message: "Review Updated." });
    } else {
        books[isbn].reviews[user] = {
            "rating": req.body.rating,
            "text": req.body.text
        }
        return res.status(200).json({ message: "Review Added." });
    }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const user = req.session.authorization['username'];
    if (books[isbn].reviews[user]) {
        delete books[isbn].reviews[user];
        return res.status(200).json({message: "Review deleted."});
    } else {
        return res.status(404).json({message: "You have no review posted."})
    }
})
module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
