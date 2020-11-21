const router = require("express").Router();
const Book = require('../models/Book');

router.get('/',async(req,res)=>{
    const books = await Book.find().sort([['updatedAt', -1]]);
    res.render('books',{
        books
    })
})


module.exports = router;
