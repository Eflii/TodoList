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
  
const connectionString =
  "mongodb+srv://admin:admin@todolistapp.tsfjlsw.mongodb.net/?retryWrites=true&w=majority&appName=TodoListApp";

  mongoose
  .connect(connectionString)
  .then(() => console.log("Connected to DB"))
  .catch((err) => console.log("Got an error", err));

// importing the routes
const todosRouter = require("./routes/Todos");
const authRouter = require("./routes/auth");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// 3. adding the routes
app.use("/", todosRouter);
app.use("/auth", authRouter);
  
// //TODO yellow flag vulnerability
// app.disable('x-powered-by');

// //TODO orange flag vulnerability
// const corsOptions = {
//     origin: 'https://example.com'
//   };

// app.use(cors(corsOptions)) 
app.use(express.static(path.join(__dirname, '../front-end')));
//TODO orange flag vulnerability

// app.use((req, res, next) => {
//     res.setHeader('X-Frame-Options', 'DENY'); // Empêche l'affichage dans un cadre sur un autre site
//     res.setHeader('X-Content-Type-Options', 'nosniff');
//     // if (req.url.endsWith('.css')) {
//     //     res.setHeader('X-Content-Type-Options', 'nosniff');
//     // }
//     // if (req.url.endsWith('.js')) {
//     //     res.setHeader('X-Content-Type-Options', 'nosniff');
//     // }
//     next();
// });

function connectDB(url) {
    return mongoose.connect(url);
  }

async function start() {
    try {
      await connectDB(connectionString);
      app.listen(PORT, () => {
        console.log(`App running on PORT ${PORT}`);
      });
    } catch (err) {
      console.log(err);
    }
  }

  start()

// app.listen(port, () => {
//     console.log(`App is running on port ${port}`)
// })