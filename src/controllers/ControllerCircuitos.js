const sequelize = require('sequelize');
const database = require('../db');
// const BASE_URL = 'http://192.168.1.70:4200';
 const BASE_URL = 'http://18.130.227.227:4200';

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

    // async GetOne(req, res) {
    //     try {
    //         const id = req.params.id;
    //         const data = await database.query('SELECT * FROM [dbo].[View_Circuito] WHERE ID_Circuito = ?', { replacements: [id], type: sequelize.QueryTypes.SELECT });
    //         const PT_Data = await database.query('SELECT * FROM [dbo].[View_Circuito_Pontos_Turisticos] WHERE ID_Circuito = ? ORDER BY ordem', { replacements: [id], type: sequelize.QueryTypes.SELECT });
    //         const personagens_Circuito = await database.query('SELECT * FROM [dbo].[View_Personagens_Circuito] WHERE ID_Circuito = ?', { replacements: [id], type: sequelize.QueryTypes.SELECT });
    //         const pt_personagens = await database.query('SELECT * FROM [DB_Escravatura].[dbo].[View_Personagens_PT_Circuito] where ID_Circuito = ?', { replacements: [id], type: sequelize.QueryTypes.SELECT });
    //         const pt_personagens_imagens = await database.query('SELECT * FROM [DB_Escravatura].[dbo].[View_Personagens_Circuito_Imagens] where ID_Circuito = ? ', { replacements: [id], type: sequelize.QueryTypes.SELECT });
           

    //         data[0].Resumo = BASE_URL + '/textos/' + (data[0].Resumo || 'null');
    //         data[0].Descricao = BASE_URL + '/textos/' + (data[0].Descricao || 'null');
    //         data[0].PontosTuristicos = PT_Data;
    //         data[0].Personagens_Circuito = personagens_Circuito;
    //         data[0].pt_personagens = pt_personagens;
    //         data[0].pt_personagens_imagens = pt_personagens_imagens

    //         data[0].PontosTuristicos.forEach(PT => {
    //             PT.Resumo = BASE_URL + '/textos/' + (PT.Resumo || 'null');
    //             PT.Descricao = BASE_URL + '/textos/' + (PT.Descricao || 'null');
    //             PT.Caminho = BASE_URL + '/imagens/' + (PT.Caminho || 'null');
    //         });
    //         data[0].Personagens_Circuito.forEach(PT => {
    //             PT.Resumo = BASE_URL + '/textos/' + (PT.Resumo || 'null');
    //             PT.Descricao = BASE_URL + '/textos/' + (PT.Descricao || 'null');
    //             PT.Caminho = BASE_URL + '/imagens/' + (PT.Caminho || 'null');
    //         });
    //         data[0].pt_personagens.forEach(PT => {
    //             PT.Resumo = BASE_URL + '/textos/' + (PT.Resumo || 'null');
    //             PT.Caminho = BASE_URL + '/imagens/' + (PT.Caminho || 'null');
    //         });
    //         data[0].pt_personagens_imagens.forEach(PT => {
    //             PT.Resumo = BASE_URL + '/textos/' + (PT.Resumo || 'null');
    //             PT.Caminho = BASE_URL + '/imagens/' + (PT.Caminho || 'null');
    //         });

    
    //         return res.json(data[0]);
    //     } catch (erro) {
    //         return console.error('Erro no GetOne: ', erro);
    //     }
    // },
    
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
