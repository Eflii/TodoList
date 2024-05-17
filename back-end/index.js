const express = require("express")
const app = express()
const cors = require("cors")
const path = require('path'); 
const mongoose = require("mongoose")
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv")

dotenv.config()

const PORT = 8088

//connection to MongoDB 

  mongoose
  .connect(process.env.MONGOLAB_URI)
  .then(() => console.log("Connected to DB"))
  .catch((err) => console.log("Got an error", err));

// importing the routes
const todosRouter = require("./routes/Todos");
const authRouter = require("./routes/auth");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY'); // Prevents the page from being displayed in an iframe
  res.setHeader('X-Content-Type-Options', 'nosniff'); // Prevents MIME type sniffing
  next();
})

// 3. adding the routes
app.use("/", todosRouter);
app.use("/auth", authRouter);
  
//TODO yellow flag vulnerability
 app.disable('x-powered-by');

//TODO orange flag vulnerability
const corsOptions = {
    origin: 'https://example.com'
  };

app.use(cors(corsOptions)) 
app.use(express.static(path.join(__dirname, '../front-end')));
//TODO orange flag vulnerability

function connectDB(url) {
    return mongoose.connect(url);
  }

async function start() {
    try {
      await connectDB(process.env.MONGOLAB_URI);
      app.listen(PORT, () => {
        console.log(`App running on PORT ${PORT}`);
      });
    } catch (err) {
      console.log(err);
    }
  }

  start()
