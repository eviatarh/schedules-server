const Sequelize = require("sequelize");

class DataAccess {
  static async connect(){
    try {
      const seq = new Sequelize('scheduleEvent', 'postgres', 'postgres', {
        host: 'localhost',
        dialect: 'postgres',
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000
        }
      });
      await seq.authenticate();
      DataAccess.seq = seq;
      return seq;
    }
    catch(err){
      console.log(`Error connecting to DB: ${err.message}`);
      process.exit()
    }
  }
}

module.exports= DataAccess;
