const express = require("express");
const databaselib = require("@replit/database");
const expiretime = require("ms")("1w");

const db = new databaselib();
const app = express();
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));

app.get("/*", async (req, res) => {
  const path = req.path.substring(1);
  if (path === "styles.css")
    return res.sendFile(__dirname + "/views/styles.css");
  if (path === "favicon.ico")
    return res.sendFile(__dirname + "/views/favicon.ico");
  let allPastes = await db.list();
  if (path === "") return res.render("home");
  let paste = await db.get("pastedata." + path);
  res.render("paste", { pastedata: paste });
});

app.post("/*", async (req, res) => {
  const path = req.path.substring(1);
  if (path !== "paste") return res.redirect("/");
  let num = await getPasteNum();
  console.log("Post created with id "+num)
  console.log(cleanseString(req.body.paste+""))
  await db.set("pastedata." + num, {
    title: cleanseString(req.body.title ? req.body.title : "Untitled paste"),
    paste: cleanseString(req.body.paste+""),
    expiretime: Date.now() + expiretime
  }
  );
  res.redirect("/" + num);
});
function cleanseString(str){
  let final = ""
  final = str.replace(/;/gi, "(thisisasemicolinlolthatineedtodoforfix)") // 
  /*for ( x of str ) {
    if ( /[a-zA-Z0-9\`\~\!\@\#\$\%\^\&\*\(\)\_\+\-\=\[\]\\\{\}\:\'\"\,\<\.\>\/\?\s\n]/.test(x) ) final += x
  }*/
  return final
}

async function getPasteNum() {
  let num = await randomInt(1, 9999999);
  let pastecheck = await db.get("pastedata." + num);
  if (pastecheck !== undefined && pastecheck !== null) return await getPasteNum();
  return num;
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

{ const http = require("http");  
  setInterval(() => { http.get(`http://Tempbin.blocksnmore.repl.co`); }, 280000);
}

app.listen(process.env.port, async () => {
  let allPastes = await db.list();
  //db.empty();
  console.log(allPastes) // Debugging to make sure pastes get deleted
  allPastes.forEach(async (paste) => {
    try{
    let pastedata = await db.get(paste);
    setTimeout(async function () {
      db.delete(paste);
      console.log("Deleted paste "+paste)
    }, Math.max(pastedata.expiretime - Date.now(), 10));
    }catch{
      console.log("Corrupted data found in paste "+paste+" removing.")
      db.delete(paste);
    }
  });
});
