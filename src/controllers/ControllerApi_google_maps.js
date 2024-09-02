const sequelize = require('sequelize');
const database = require('../db');
const BASE_URL = 'http://192.168.1.70:4200';

module.exports =
{
    async List(req, res){
        try {
            const data = await database.query('SELECT * FROM [dbo].[View_chave_api_google_maps]', { type: sequelize.QueryTypes.SELECT });
            return res.json(data); 
        } catch (erro) {
            return console.error('Erro na List: ', erro)
        }  
    },
}
