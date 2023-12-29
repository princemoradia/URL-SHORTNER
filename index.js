const express = require("express");
const app = express();
const PORT = 8001;
const path = require('path')
const urlRoute = require("./routes/url");
const URL = require("./models/url");
const {connectToMongoose} = require("./connect");
const staticRoute = require("./routes/staticRouter")
const userRoute = require("./routes/user");
const cookieParser = require("cookie-parser");
const {restrictToLoggedInUserOnly , checkAuth} = require("./middlewares/auth");
connectToMongoose("mongodb://localhost:27017/short-url").then(()=>console.log("MongoDB connected"));

app.set("view engine","ejs");
app.set("views",path.resolve("./views"));

app.use(express.urlencoded({extended:false}));
app.use(express.json());    
app.use(cookieParser());


// for EJS
// app.get("/test",async(req,res)=>{
//     const allUrls = await URL.find({});
//     return res.render('home',{
//         urls: allUrls,
//     });
// });

app.use("/url" , restrictToLoggedInUserOnly ,urlRoute);
app.use("/user", userRoute);
app.use("/",checkAuth, staticRoute);

app.get("/url/:shortId",async (req,res)=>{
    const shortid = req.params.shortId;
    const entry = await URL.findOneAndUpdate({
        shortId:shortid
    },{$push : {
            visitHistory: {
                timestamp: Date.now(),
            },
    }})
    res.redirect(entry.redirectURL);
})
app.listen(PORT,()=>console.log(`Server started at port : ${PORT}`));