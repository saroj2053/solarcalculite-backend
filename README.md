# Steps to initialize the database

## In this Node.js application, to initialize a MongoDB database, we need to go through the dollowing steps:

### 1. Installing dependencies: First of all, the system should have node.js and npm installed in it. We need to create a node.js project and navigating to its root directory, we need to execute the following command.

`npm install mongoose`

### 2. Setting Up Database Connection: Secondly, we need to set up the database connection. In this application, a file named "database.js" is created to handle the database connection. Requiring mongoose and defining the connection URL to our MongoDB database helps to initiate connection.

```
const mongoose = require("mongoose");
const url = mongodb+srv:/saroj270100:sarose2053@cluster0.z5tb4ao.mongodb.net/photovoltaicDB?retryWrites=true&w=majority;
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(DB);
    console.log(
      `Successfully connected to mongodb at ${conn.connection.host}`.bgMagenta
.black
);
} catch (err) {
console.log(err);
}
};
connectDB();

```

### 3. Import the database file into the main server.js file and require it.

```
require("./database");
```

### 4. Defining Schema

#### There are three schemas defined in this project. one is for user collection, other two are for projects and products collection. A sample of how schema can be defined is shown here.

```
const mongoose = require("mongoose");
const { Product } = require("../schemas/ProductSchema");

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    images: [
      {
        url: String,
        filename: String,
      },
    ],
    description: String,
    author: {
      type: mongoose.SchemaTypes.ObjectId,
      required: true,
      ref: "User",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  { timestamps: true }
);

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;

```

#### Note: Once the schema is defined and the database is connected either locally or to a MOngoDB atlas, the collections are automatically created under the specified database name. so one doesn't need to manually create all the collections in the database.

### 5. Using this model to interact with the database

In this application, the "Project" model is used to perform database operations like creating, reading, updating, or deleting documents.

```
const Project = require("../schemas/ProjectSchema");

try {
    const projects = await Project.find({ author: id }).sort({ createdAt: -1 });

    if (projects) {
      res.status(200).json({
        projects,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }

```

# Steps that should be followed in order to make this project running

## On Extracting the zip file, you will get the term paper and a zip file containing the project source code

## Extract the zip file that contains the project source code

### you will get the code for backend as well as frontend in it

## For Backend Program

### In order to make backend code run, one needs to run the command "npm install" to install the dependencies that requires the backend code to execute properly.

### After installing all the dependencies, run command "npm run dev" in order to start the server. Since we have require the database connection file into the main server file, the database connection is made which creates all the collections in the database if it doesn't exists.

## For Frontend Program

### first of all hop to terminal to install the dependencies in the program. This can be done by running the command "npm install" in the terminal. After the dependencies are installed, the frontend server can be run using the command "npm start". The default port is 3000 and therfore the ui interface is accessed through the url "localhost:3000".
