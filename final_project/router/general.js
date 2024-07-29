const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (username && password) {
        if (!isValid(username)) {
            users.push({"username": username, "password": password});
            return res.status(200).json({ message: "User is successfully registered." })
        } else {
            return res.status(302).json({ message: "User aldready exists." })
        }
    }
    return res.status(404).json({message: "Please enter username and password."});
});

let book_list_promise = new Promise((resolve, reject) => {
    resolve(JSON.stringify(books, null, 4));
});
    
// Get the book list available in the shop
public_users.get('/', function (req, res) {
    book_list_promise.then(
        function (result) { return res.send(result) }
    )
});

function isbn_promise (isbn) {
    return new Promise((resolve, reject) => {
        resolve(JSON.stringify(books[isbn], null, 4));
    });
};

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    isbn_promise(req.params.isbn).then(result => res.send(result));
});

function author_promise (author) {
    return new Promise((res, rej) => {
        let booksByAuthor = [];
        for (const book in books) {
            if (books[book].author === author ) {
                booksByAuthor.push(books[book]);
            }
        }
        res(JSON.stringify(booksByAuthor, null, 4))
    })
}
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    author_promise(req.params.author).then(result => res.send(result));
});

function title_promise(title) {
    return new Promise((res, rej) => {
        for (const book in books) {
            if (books[book].title === title ) {
                res(JSON.stringify(books[book]));
            }
        }

    })
}

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    title_promise(req.params.title).then(result => res.send(result));
    
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    return res.send(JSON.stringify(books[isbn].reviews));
});

module.exports.general = public_users;
