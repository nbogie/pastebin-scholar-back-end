import { Client } from "pg";
import { config } from "dotenv";
import express from "express";
import cors from "cors";

config(); //Read .env file lines as though they were env vars.

//Call this script with the environment variable LOCAL set if you want to connect to a local db (i.e. without SSL)
//Do not set the environment variable LOCAL if you want to connect to a heroku DB.

//For the ssl property of the DB connection config, use a value of...
// false - when connecting to a local DB
// { rejectUnauthorized: false } - when connecting to a heroku DB
const herokuSSLSetting = { rejectUnauthorized: false }
const sslSetting = process.env.LOCAL ? false : herokuSSLSetting
const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: sslSetting,
};

const app = express();

app.use(express.json()); //add body parser to each following route handler and allows us to have access to request.body
app.use(cors()) //add CORS support to each following route handler

const client = new Client(dbConfig);
client.connect();

app.get("/tenPastes", async (req, res) => {
  try {
    const allPastes = await client.query('select * from pastebin order by time desc limit 10');
    res.json(allPastes.rows);
  } catch (error) {
    console.error(error.message)
  }
});

app.get("/pastes", async (req, res) => {
  try {
    const allPastes = await client.query('select * from pastebin');
    res.json(allPastes.rows);
  } catch (error) {
    console.error(error.message)
  }
});

app.post("/pastes", async (req, res) => {

  try {
     const {title, summary} = req.body//req.body has information from the client side;
     const newEntry = await client.query('insert into pastebin (title_text, summary_text ) values($1,$2) returning *',[title, summary])
    res.json(newEntry.rows[0])
  } catch (error) {
    console.error(error.message)
  }
});






//Start the server on the given port
const port = process.env.PORT;
if (!port) {
  throw 'Missing PORT environment variable.  Set it in .env file.';
}
app.listen(port, () => {
  console.log(`Server is up and running on port ${port}`);
});
