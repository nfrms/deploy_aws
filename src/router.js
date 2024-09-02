const express = require('express');
const ControlerPonto_Turistico = require('./controllers/ControllerPonto_Turistico.js') 
const ControlerPersonagens = require('./controllers/ControllerPersonagens.js') 
const ControllerCircuitos = require('./controllers/ControllerCircuitos.js') 
const ControllerApi_google_maps = require('./controllers/ControllerApi_google_maps.js') 

const Routes = express.Router();
const fs = require('fs');
const path = require('path');

Routes.get('/imagens/:nomeImagem', (req, res) => {
    const nomeImagem = req.params.nomeImagem;
    res.sendFile(`${__dirname}/imagens/${nomeImagem}`);
});

Routes.get('/textos/:nomeTexto', (req, res) => {
    const nomeTexto = req.params.nomeTexto;
    fs.readFile(path.join(__dirname, 'textos', nomeTexto), 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Conteúdo não disponível');
        } else {
            res.send(data);
        }
    });
});

Routes.get('/Ponto_Turistico/List', ControlerPonto_Turistico.List);
// Routes.get('/Ponto_Turistico/GetOne/:id', ControlerPonto_Turistico.GetOne); 
Routes.get('/Ponto_Turistico/Avaliacao/:id/:rating', ControlerPonto_Turistico.Avaliacao); 

Routes.get('/Personagens/List', ControlerPersonagens.List);
// Routes.get('/Personagens/GetOne/:id', ControlerPersonagens.GetOne);
Routes.get('/Personagens/Avaliacao/:id/:rating', ControlerPersonagens.Avaliacao); 

Routes.get('/Circuitos/List', ControllerCircuitos.List);
// Routes.get('/Circuitos/GetOne/:id', ControllerCircuitos.GetOne); 
Routes.get('/Circuitos/Avaliacao/:id/:rating', ControllerCircuitos.Avaliacao); 

Routes.get('/google_maps', ControllerApi_google_maps.List);


module.exports = Routes;


