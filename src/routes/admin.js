const router = require('express').Router();
const keys = require('../config/key');
const jwt = require('jsonwebtoken')
const adminAuth = require('../middleware/auth');
const Book = require('../models/Book');
const multer = require("multer");
const path = require("path");
const fs = require("fs");

router.get('/login',async(req,res)=>{
    res.render('login');
})

router.post('/login', async (req, res) => {
    try {
        const email = req.body.email
        const password = req.body.password
        if (
            email !== keys.ADMIN_EMAIL ||
            password !== keys.ADMIN_PASSWORD
        ) {
            // console.log('Invalid Credentials')
            return res.status(401).send('Invalid Credentials')
        }

        const token = jwt.sign(
            { admin: `${email}${password}` },
            'JWT-SECRET'
        )
        res.cookie('authorization', token, {
            httpOnly: false,
        })
        res.send('Logged in');
    } catch (error) {
        // console.log(error)
        res.status(500).send(error)
    }
})

router.get('/logout',async(req,res)=>{
    res.clearCookie('authorization');
    req.flash('success_msg','Successfully Logged Out');
    res.redirect('/admin/login');
})

router.get('/test',adminAuth,async(req,res)=>{
    res.render('test');
})

//Establish Storage for file upload
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        let newDestination;
        if(file.fieldname == 'cover')
        newDestination =
            __dirname + `/../../public/upload/Cover/${req.body.name}`;
        else if(file.fieldname == 'book')
        newDestination =
            __dirname + `/../../public/upload/Book/${req.body.name}`;
        var stat = null;
        try {
            stat = fs.statSync(newDestination);
        } catch (err) {
            fs.mkdir(
                newDestination, {
                    recursive: true,
                },
                (err) => {
                    if (err) console.error("New Directory Error: ", err.message);
                    // else 
                    //     console.log("New Directory Success");
                }
            );
        }
        if (stat && !stat.isDirectory())
            throw new Error("Directory Couldn't be created");
        cb(null, newDestination);
    },
    filename: function(req, file, cb) {
        const imageFileTypes = /jpeg|jpg|png|gif/;
        let fileName =  file.fieldname + "-" + Date.now() + path.extname(file.originalname)
        cb(
            null,
            fileName
        );
    },
});

var upload = multer({
    storage: storage,
    limits: {
        fileSize: 80000000,
    },
    fileFilter: (req, file, cb) => {
        if (file.fieldname === "book") { // if uploading resume
            if (
              file.mimetype === 'application/pdf' ||
              file.mimetype === 'application/msword' ||
              file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            ) { // check file type to be pdf, doc, or docx
              cb(null, true);
            } else {
              cb(null, false); // else fails
            }
          } else { // else uploading image
            if (
              file.mimetype === 'image/png' ||
              file.mimetype === 'image/jpg' ||
              file.mimetype === 'image/jpeg'
            ) { // check file type to be png, jpeg, or jpg
              cb(null, true);
            } else {
              cb(null, false); // else fails
            }
          }
    },
});
var cpUpload = upload.fields([{ name: 'cover', maxCount: 1 }, { name: 'book', maxCount: 1 }])
// Route to upload a Book
router.post('/upload/book',cpUpload,async(req,res)=>{
    res.send('yes');
})
 //route to save blog
// router.post("/upload/book", adminAuth, upload.single("cover"), upload.single("book"), async(req, res) => {
//     if (req.file) {
//         var cover = `/upload/cover/${req.user.userId}/${req.file.filename}`;
//     } else {
//         var cover =
//             "https://cdn-images-1.medium.com/max/800/1*fDv4ftmFy4VkJmMR7VQmEA.png";
//     }
//     try {
//         const blog = req.body;
//         // console.log(blog)
//         if (!blog) {
//             req.flash("Something went wrong");
//             res.redirect("/");
//         }
//         var tagsArray = [];
//         if(blog.tags)
//             tagsArray = blog.tags.split(" ");
//         const saved = await new Blog({
//             title: blog.title,
//             slug: (
//                 slugify(blog.title) +
//                 "-" +
//                 Math.random().toString(36).substr(2, 8)
//             ).toLowerCase(),
//             author: req.user.userId,
//             category: blog.category,
//             cover: cover,
//             summary: blog.summary,
//             body: blog.body,
//             tags: (tagsArray.length===0) ? [] : tagsArray
//         }).save();
//         if (req.dbUser.blogs) {
//             req.dbUser.blogs.push(saved);
//         } else {
//             req.dbUser.blogs = [saved];
//         }
//         await req.dbUser.save();
//         res.redirect("/blog");
//     } catch (e) {
//         console.log(e.message);
//         req.flash("error", "Something went wrong. Try again");
//         res.redirect("/");
//     }
// });
 

module.exports = router;