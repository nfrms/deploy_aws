const sequelize = require('sequelize');
const database = require('../db');
// const BASE_URL = 'http://192.168.1.70:4200';
// const BASE_URL = 'http://3.8.175.220:4200';
const BASE_URL = 'https://727b-2001-8a0-7aa7-7600-6cee-5fe2-bad4-6c52.ngrok-free.app';

module.exports =
{
    async List(req, res){
        try {
            const data = await database.query('SELECT * FROM [dbo].[VIEW_Ponto_Turistico]', { type: sequelize.QueryTypes.SELECT });
            const imagesData = await database.query('SELECT * FROM [dbo].[View_Ponto_Turistico_Imagens] order by ordem', { type: sequelize.QueryTypes.SELECT});
            const personagens_PontoTuristico = await database.query('SELECT * FROM [View_Personagens_Ponto_Turistico]', { type: sequelize.QueryTypes.SELECT });
            



            data.forEach(item => {
                item.Resumo = BASE_URL + '/textos/' + item.Resumo;
                item.Descricao = BASE_URL + '/textos/' + item.Descricao;
                item.personagens_PontoTuristico = personagens_PontoTuristico.filter(pt => pt.ID_Ponto_Turistico === item.ID_Ponto_Turistico);
                item.Imagens = imagesData.filter(img => img.ID_Ponto_Turistico === item.ID_Ponto_Turistico);
                item.Imagens.forEach(img => img.Caminho = BASE_URL + '/imagens/' + img.Caminho);
               
            });
            return res.json(data); 
        } catch (erro) {
            return console.error('Erro na List: ', erro)
        }  
    },

    // async GetOne(req, res){
    //     try {
    //         const id = req.params.id; 
    //         const data = await database.query('SELECT * FROM [dbo].[VIEW_Ponto_Turistico] WHERE ID_Ponto_Turistico = ' + id, { type: sequelize.QueryTypes.SELECT});
    //         const imagesData = await database.query('SELECT * FROM [dbo].[View_Ponto_Turistico_Imagens] WHERE ID_Ponto_Turistico = ' + id + ' ORDER BY ordem', { type: sequelize.QueryTypes.SELECT });
    //         const personagens_PontoTuristico = await database.query('SELECT * FROM [View_Personagens_Ponto_Turistico] WHERE ID_Ponto_Turistico = ' + id, { type: sequelize.QueryTypes.SELECT });
           
    //         data[0].Resumo = BASE_URL + '/textos/' + data[0].Resumo;
    //         data[0].Descricao = BASE_URL + '/textos/' + data[0].Descricao;
    //         data[0].Imagens = imagesData;
    //         data[0].Personagens_PontoTuristico = personagens_PontoTuristico;
    //         data[0].Imagens.forEach(img => img.Caminho = BASE_URL + '/imagens/' + img.Caminho);
    //         data[0].Personagens_PontoTuristico.forEach(img => {
    //             if (img.Resumo) {
    //                 img.Resumo = BASE_URL + '/textos/' + img.Resumo;
    //             }
    //             if (img.Caminho) {
    //                 img.Caminho = BASE_URL + '/imagens/' + img.Caminho;
    //             }
    //         });

    //         return res.json(data[0]); 
    //     } catch (erro) {
    //         return console.error('Erro no GetOne: ', erro)
    //     }    
    // },

    async Avaliacao(req, res) {
        try {
            const id = req.params.id; 
            const rating = req.params.rating
            
            const avalia = await database.query('EXEC [dbo].[AvaliacaoesPontos_Turisticos] @ponto_turistico = ' + id +', @avaliacao = '+ rating, { type: sequelize.QueryTypes.SELECT});     
            avalia[0] = BASE_URL + '/avaliacao/' + id+ '/' + rating ;
          
            return res.json(avalia[0]); 
        } catch (erro) {
            return console.error('Erro no GetOne: ', erro)
        }    
    }
}