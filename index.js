const {response} = require("express")
const express = require("express")
const app = express()
const port =3000
const AWS = require("aws-sdk")
const multer = require("multer")
const upload = multer();
require("dotenv").config()

//config file to view and engine
app.use(express.json({extend:false}));
app.use(express.static("./views"));
app.set("view engine","ejs");
app.set("views","./views");
 
//config AWS key
const config = new AWS.Config({
    accessKeyId:process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey:process.env.AWS_SECRET_ACCESS_KEY,
    region:"ap-southeast-1"
})
AWS.config = config;
const docClient = new AWS.DynamoDB.DocumentClient();
const tableName= "BaiBao"

//get all data
app.get("/",(req,res)=>{
    const params={
        TableName: tableName
    }
    docClient.scan(params,(err,data)=>{
        if(err) res.send(err)
        else{
            console.log(data)
            return res.render("index",{baiBaos: data.Items});
        }
    })
})
//get addForm
app.get("/addForm",(req,res)=>{
    return res.render("addForm");
})
//add data
app.post("/",upload.fields([]), (req,res)=>{
    const {id, name, author, pages, year}=req.body;
    const params = {
        TableName: tableName,
        Item:{
            "id":id,
            "Name":name,
            "Author":author,
            "Pages":pages,
            "ReleasedYear":year,
        }
       
    }
    docClient.put(params,(err,data)=>{
         if(err) res.send(err);
         else return res.redirect("/");   
    })
})
//delete data
app.post("/delete",upload.fields([]),(req,res)=>{
    const listItem = Object.keys(req.body);
    if(listItem.length===0) return res.redirect("/");
    function onDeleteItem(index){
        const params={
            TableName: tableName,
            Key:{
                "id":listItem[index]
            }
        }
        docClient.delete(params,(err,data)=>{
            if(err) return res.send(err);
            else {
                if(index>0) onDeleteItem(index-1);
                else return res.redirect("/");
            }
        })
    }
    onDeleteItem(listItem.length-1);
})
/*
//UPDATE DATA
app.put("/update",upload.fields([]),(req,res)=>{
    const {id, name, author, pages, year}=req.body;
        const params = {
          TableName: tableName,
          Item: {
            "id":id,
            "Name":name,
            "Author":author,
            "Pages":pages,
            "ReleasedYear":year,
          },
          ReturnConsumedCapacity: "TOTAL",
        };
      
        docClient.putItem(params, (err,data) =>{
          if (err) {
             res.send(err);
          } else {
            return res.redirect("/")
          }
        });
      
})
*/
app.listen(port, ()=>{
    console.log(`App listening on port ${port}`);
})