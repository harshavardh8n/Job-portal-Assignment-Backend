const express = require("express");
const app = express();
const router = require("./Router/userRouter")
const jrouter = require("./Router/jobRouter")
const cors = require("cors");
const authenticate = require("./middlewares/userMiddleware");


app.use(cors())

app.get("/",authenticate,(req,res)=>{
    res.json({msg:"working"});
})

app.use(express.json())



app.use(router);
app.use(jrouter);
// app.use(jrouter);

const PORT = 5000 | process.env.PORT

app.listen(PORT,()=>{
    console.log("listening on ",PORT);
});