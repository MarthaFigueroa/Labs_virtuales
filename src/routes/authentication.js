const express = require('express');
const passport = require('passport');
const { isLoggedIn, isNotLoggedIn } = require('../lib/auth');
const router = express.Router();

router.get('/signup', isNotLoggedIn, (req, res)=>{
    res.render('auth/signup');
});

router.get('/formulario', (req, res)=>{
    res.render('formulario');
});

router.post('/signup', isNotLoggedIn, passport.authenticate('local.signup', {
        successRedirect: '/principal',//Donde redirecciona en caso exitoso
        failureRedirect: '/signup', //Donde redireccionará en caso de fracaso
        failureFlash: true  //Permite a passport recibir mensajes en caso falle
    })   
);

router.get('/', (req, res)=>{
    res.render('index');
});

router.get('/principal', (req, res)=>{
    res.render('principal');
});


router.get('/add', (req, res)=>{
    res.render('links/add');
});

router.get('/formulario_reserva', (req, res)=>{
    res.render('links/formulario_reserva');
});

router.get('/ReservaExitosa', (req, res)=>{
    res.render('links/ReservaExitosa');
});

router.get('/ReservaEliminada', (req, res)=>{
    res.render('links/ReservaEliminada');
});

router.get('/disponibilidad_reserva', (req, res)=>{
    res.render('links/disponibilidad_reserva');
});

router.post('/', isNotLoggedIn, (req, res, next)=>{
    // passport.authenticate('local.signin', {
    //     successRedirect: '/principal',
    //     failureRedirect: '/signup',
    //     failureFlash: true
    // })(req, res, next);
});

router.get('/logout', isLoggedIn, (req, res)=>{
    req.logOut();
    res.redirect('/');
});

module.exports = router;