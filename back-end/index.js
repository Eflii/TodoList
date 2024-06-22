const http = require("http");
const app = require("./server");
const mongoose = require("mongoose")


//connection to MongoDB 

mongoose
.connect(process.env.MONGOLAB_URI)
.then(() => console.log("Connected to DB"))
.catch((err) => console.log("Got an error", err));

const PORT = process.env.PORT || 8088;

const server = http.createServer(app);

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
