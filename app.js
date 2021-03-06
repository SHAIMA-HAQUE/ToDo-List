
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set('view engine', 'ejs');

mongoose.connect("mongodb://localhost:27017/todolistDB",{useNewUrlParser:true});

const itemsSchema ={
  name :String
}
const Item = mongoose.model("Item",itemsSchema);

const toDo1 = new Item({
  name : "Welcome to your To-Do list"
})

const toDo2 = new Item({
  name : "Hit the + button to add the item"
})

const toDo3 = new Item({
  name : "<-- Hit this to delete an item"
})
const defaultItems = [toDo1,toDo2,toDo3];

const listSchema = {
  name :String,
  items :[itemsSchema]
};

const List = mongoose.model("List" , listSchema);

app.get("/",function(req,res){
   Item.find({},function(err,foundItems){

      if(foundItems.length === 0){
        Item.insertMany(defaultItems,function(err){
          if(err){
            console.log(err);
          }else{
            console.log("Succesfully saved default items to database");
          }
        });
        res.redirect("/");
      }else{
        res.render("list",{listTitle:"Today" ,newListItems:foundItems});
      }
    })
});

app.get("/:customListName",function(req,res){
  const customListName =  _.capitalize(req.params.customListName);

  List.findOne({name :customListName} ,function(err,foundList){
    if(!err){
      if(!foundList){
        //Create new List
        const list = new List({
          name :customListName,
          items: defaultItems
        });

        list.save();
        res.redirect("/" + customListName);
      }else{
        //Show existing list
        res.render("list",{listTitle:foundList.name ,newListItems:foundList.items})
      }
    }
  })
});




app.post("/",function(req,res){
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name : itemName
  });
   if(listName === "Today"){
     item.save();
     res.redirect("/");
   }else{
     List.findOne({name:listName},function(err,foundList){
       foundList.items.push(item);
       foundList.save();
       res.redirect("/"+listName);
     })
   }


});

app.post("/delete",function(req,res){
  const checkedItemId = req.body.checkbox;
   const listName = req.body.listName;

   if(listName === "Today"){
     Item.findByIdAndRemove(checkedItemId ,function(err){
       if(err){
         console.log(err);
       }else{
         console.log("Successfully deleted Checked Item ");
         res.redirect("/")
       }
     })
   }else{
     List.findOneAndUpdate({name : listName},{$pull : {items:{_id :checkedItemId}}},function(err,foundList){
       if(!err){
         res.redirect("/" +listName);
       }
     });
   }
 })



app.post("/work",function(req,res){
  let item = req.body.newItem;
  workItems.push(item);
  res.redirect("/work");
});

app.listen(3000,function(){
  console.log("Server is up and running");
})
