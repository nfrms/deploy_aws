const sequelize = require('sequelize');

const database = new sequelize('DB_escravatura', 'cliente_view', '1234', {
    dialect: 'mssql', host: 'LAPTOP-FLJF8UJE', port: 1433
});

database.sync();

module.exports = database;
