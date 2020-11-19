const express = require('express');
const passport = require('passport');
const { isLoggedIn, isNotLoggedIn } = require('../lib/auth');
const router = express.Router();
const mysqlConnection = require('../database');

const checkUserLoggedIn = (req, res, next) => {
	req.user ? next(): res.redirect('/');
}

router.get('/signup', (req, res)=>{
    res.render('auth/signup');
});

router.get('/formulario', checkUserLoggedIn, (req, res)=>{
    res.render('formulario');
});

// router.post('/signup', isNotLoggedIn, passport.authenticate('local.signup', {
//         successRedirect: '/principal',//Donde redirecciona en caso exitoso
//         failureRedirect: '/signup', //Donde redireccionará en caso de fracaso
//         failureFlash: true  //Permite a passport recibir mensajes en caso falle
//     })   
// );

router.get('/list', async(req, res)=>{
    const links = await mysqlConnection.query('SELECT * FROM links');
    console.log(links);
    // res.send('Listas irán aquí');
    res.render('links/list', {links});
});

router.get('/reservas', checkUserLoggedIn, async (req, res)=>{
    const email = req.user.emails[0].value;
    const reservas = await mysqlConnection.query(`SELECT * FROM reservas WHERE user='${email}'`);
    const user = await mysqlConnection.query(`SELECT * FROM users WHERE Email='${email}'`);
    console.log(reservas[0].date);
    res.render('links/reservas', { reservas, user });
});

router.get('/list', (req, res)=>{
    res.render('links/list');
});

router.get('/add', (req, res)=>{
    res.render('links/add');
});

router.get('/', (req, res)=>{
    res.render('index');
});

router.get('/principal', checkUserLoggedIn, async(req, res)=>{
    const email = req.user.emails[0].value;
    const user = await mysqlConnection.query(`SELECT * FROM users WHERE Email='${email}'`);
    console.log(user);
    res.render('principal', { user });
});

router.get('/add', (req, res)=>{
    res.render('links/add');
});

router.get('/formulario_reserva', checkUserLoggedIn, async(req, res)=>{
    const email = req.user.emails[0].value;
    const user = await mysqlConnection.query(`SELECT * FROM users WHERE Email='${email}'`);
    res.render('links/formulario_reserva', { user });
});

router.get('/ReservaExitosa', checkUserLoggedIn, async(req, res)=>{
    const email = req.user.emails[0].value;
    const user = await mysqlConnection.query(`SELECT * FROM users WHERE Email='${email}'`);
    res.render('links/ReservaExitosa', { user });
});

router.get('/ReservaEliminada', (req, res)=>{
    res.render('links/ReservaEliminada');
});

router.get('/disponibilidad_reserva', checkUserLoggedIn, async(req, res)=>{
    const email = req.user.emails[0].value;
    const user = await mysqlConnection.query(`SELECT * FROM users WHERE Email='${email}'`);
    res.render('links/disponibilidad_reserva', { user });
});

// router.post('/', isNotLoggedIn, (req, res, next)=>{
//     // passport.authenticate('local.signin', {
//     //     successRedirect: '/principal',
//     //     failureRedirect: '/signup',
//     //     failureFlash: true
//     // })(req, res, next);
// });

module.exports = router;