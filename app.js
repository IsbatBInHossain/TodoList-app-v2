require("dotenv").config();
const express = require("express");
const _ = require("lodash");
const app = express();
const date = require(__dirname + "/date.js");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
mongoose.connect(process.env.MONGO_URI);

const itemsSchema = new mongoose.Schema({
  name: {
    type: "String",
    required: true,
  },
});

const listSchema = new mongoose.Schema({
  name: {
    type: "String",
    required: true,
  },
  items: [itemsSchema],
});

const Item = mongoose.model("Item", itemsSchema);
const List = mongoose.model("List", listSchema);

const defaultItems = [
  { name: "Welcome to ToDo list app" },
  { name: "Click the '+' button or hit enter to add new items" },
  { name: "<-- Check the checkbox to delete items" },
  { name: "After the url type your custom list name to create a cutom list" },
];

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
  Item.find({}, (err, items) => {
    if (!err && items.length === 0) {
      Item.insertMany(defaultItems)
        .then(function () {
          console.log("Data inserted");
          res.redirect("/"); // Success
        })
        .catch(function (error) {
          console.log(error); // Failure
        });
    } else {
      let weekday = date.getDay();
      res.render("list", { listTitle: weekday, items: items });
    }
  });
});

app.get("/:newlist", (req, res) => {
  let listName = _.capitalize(req.params.newlist);
  List.findOne({ name: listName }, (err, foundList) => {
    if (!err) {
      if (!foundList) {
        const list = new List({
          name: listName,
          items: defaultItems,
        });
        list.save();
        res.redirect(`/${listName}`);
      } else {
        // Show list
        res.render("list", {
          listTitle: foundList.name,
          items: foundList.items,
        });
      }
    }
  });
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.post("/", (req, res) => {
  let newItem = req.body.newItem;
  let listName = req.body.list;
  let weekday = date.getDay();
  const item = new Item({ name: newItem });
  if (listName === weekday) {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, (err, foundList) => {
      foundList.items.push(item);
      foundList.save();
    });

    res.redirect(`/${listName}`);
  }
});

app.post("/delete", (req, res) => {
  let inputs = req.body.checkBox.split(",");
  let check = inputs[0];
  let weekday = date.getDay();
  let pageTitle = inputs[1];
  if (pageTitle === weekday) {
    Item.deleteOne({ name: check }, (err) => {
      if (!err) {
        res.redirect("/");
      }
    });
  } else {
    List.findOne({ name: pageTitle }, (err, foundList) => {
      if (!err) {
        let itemIndex = _.findIndex(foundList.items, (obj) => {
          return obj.name == check;
        });
        foundList.items.pop(foundList.items[itemIndex]);
        foundList.save();
        res.redirect("/" + pageTitle);
      }
    });
  }
});

app.listen("3000", () => console.log("server is running"));
