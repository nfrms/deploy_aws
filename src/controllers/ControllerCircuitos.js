const sequelize = require('sequelize');
const database = require('../db');
// const BASE_URL = 'http://192.168.1.70:4200';
// const BASE_URL = 'http://3.8.175.220:4200';

const BASE_URL = 'https://8f44-2001-8a0-7aa7-7600-3033-553e-b435-759c.ngrok-free.app';
module.exports =
{
    async List(req, res){
        try {
            const data = await database.query('SELECT * FROM [dbo].[View_Circuito]', { type: sequelize.QueryTypes.SELECT });
            const PT_Data = await database.query('SELECT * FROM [dbo].[View_Circuito_Pontos_Turisticos] order by ordem', { type: sequelize.QueryTypes.SELECT});
            const imagens = await database.query('SELECT * FROM [dbo].[View_Circuitos_Imagens]', { type: sequelize.QueryTypes.SELECT });
            const personagens = await database.query('SELECT * FROM [dbo].[View_Personagens_Circuito]', { type: sequelize.QueryTypes.SELECT });
            const pt_personagens = await database.query('SELECT * FROM [dbo].[View_Personagens_PT_Circuito]', { type: sequelize.QueryTypes.SELECT });
            
            data.forEach(item => {
                item.Resumo = BASE_URL + '/textos/' + item.Resumo;
                item.Descricao = BASE_URL + '/textos/' + item.Descricao;       
                item.personagens = personagens.filter(pt => pt.ID_Circuito === item.ID_Circuito);
                item.PontosTuristicos = PT_Data.filter(pt => pt.ID_Circuito === item.ID_Circuito);
                item.PontosTuristicos.forEach(pt => {
                    pt.Resumo = BASE_URL + '/textos/' + pt.Resumo;
                    pt.Descricao = BASE_URL + '/textos/' + pt.Descricao;
                    pt.Caminho = BASE_URL + '/imagens/' + pt.Caminho;
                    pt.pt_personagens = pt_personagens.filter(ponto => ponto.ID_Ponto_Turistico === pt.ID_Ponto_Turistico);
                    pt.imagens = imagens.filter(img => img.ID_Ponto_Turistico === pt.ID_Ponto_Turistico);
                    pt.imagens.forEach(img => img.Caminho = BASE_URL + '/imagens/' + img.Caminho);
                });
            });

            return res.json(data); 
        } catch (erro) {
            return console.error('Erro na List: ', erro)
        }  
    },

    async Avaliacao(req, res) {
        try {
            const id = req.params.id; 
            const rating = req.params.rating;
            
            const avalia = await database.query(
                'EXEC dbo.AvaliacaoesCircuitos @circuito = :id, @avaliacao = :rating', 
                { 
                    replacements: { id, rating }, 
                    type: sequelize.QueryTypes.SELECT 
                }
            );     
            avalia[0] = BASE_URL + '/avaliacao/' + id + '/' + rating;
          
            return res.json(avalia[0]); 
        } catch (erro) {
            return console.error('Erro na Avaliacao: ', erro);
        }    
    }
}
