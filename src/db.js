// const sequelize = require('sequelize');

// const database = new sequelize('DB_escravatura', 'cliente_view', '1234', {
//     dialect: 'mssql', host: 'LAPTOP-FLJF8UJE', port: 1433
//  });

// database.sync();

// module.exports = database;



const sequelize = require('sequelize');

const database = new sequelize('DB_escravatura', 'cliente_view', '1234', {
     
    dialect: 'mssql', host: 'dbescravatura.chc6keyukect.eu-west-3.rds.amazonaws.com', port: 1433 // Substitua pelo endereço IP correto

});
database.sync();

module.exports = database;

