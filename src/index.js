const bodyParser = require('body-parser')
const SchedualApi = require("./api/schedual-api");
const DataAccess = require( "./utils/data-access");


const express = require('express');
const hostname = '127.0.0.1';
const port = 3000;
const Sequelize = require('sequelize');
const server = express();


class SchedualServer {
  static async run() {
    const app = express();
    app.use((req, res, next) =>{
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
      res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type'); // If needed
      res.setHeader('Access-Control-Allow-Credentials', true); // If needed
      next();
    });

    app.use(bodyParser.json());
    await DataAccess.connect();
    SchedualApi.init(app);
    SchedualServer.listenOnPort(app);
  }

  static listenOnPort(app){
    app.listen(8080, ()=>{
      console.log('server is up!');
    });

  }
}

SchedualServer.run().then();


