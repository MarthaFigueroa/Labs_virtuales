const express = require("express");
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const config = require('../configs/config');
const mysqlConnection = require('../database');
const app = express();
const cors = require('cors');
const nodemailer = require("nodemailer");
const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const GOOGLE_CALENDAR_ID = "c_c92epc3f1rehv6u9bo5vivget4@group.calendar.google.com";
const path = require('path');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/calendar'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

//revisar si viene la header “access-token” en las cabeceras y de ahí verifica la JWT contra el servicio
const rutasProtegidas = express.Router(); 
app.use(cors());

/*
#SETTINGS
*Configuracion de nuestra clave
*Seteamos para que el body-parser nos convierta lo que viene del cliente 
*Pasamos a JSON
*Servidor inicializado
*/
app.set('llave', config.llave);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('port', process.env.PORT || 3002);
app.use(express.json()); //Middlewares
app.set('views', path.join(__dirname, '/views'));
app.use('/public', express.static(__dirname + '/public'));

app.use(function(req, res, next) {
	//intercepts OPTIONS method
    if ('OPTIONS' === req.method) {
		//respond with 200
		res.send(200);
    }
    else {
		next(); //move on
    }
});


rutasProtegidas.use((req, res, next) => {
	const token = req.headers['access-token'];
	
    if (token) {
		jwt.verify(token, app.get('llave'), (err, decoded) => {      
			if (err) {
				// res.redirect("http://localhost:5501/login.html");
				return res.json({ mensaje: 'Token inválida' });    
			} else {
				req.decoded = decoded;    
				next();
			}
		});
    } else {
		res.send({ 
			mensaje: 'Token no proveída.' 
		});
    }
});

/*
#Routes
*Autentifica
*Validar Reserva
*Consultar Diponibilidad
*/

app.post('/autenticar', (req, res) => {
	if(req.body.usuario === "asfo" && req.body.contrasena === "holamundo") {
		const payload = {
			check:  true
		};
		const token = jwt.sign(payload, app.get('llave'), {
			expiresIn: '20m'
		});
		res.json({
			mensaje: 'Autenticación correcta',
			token: token
        });
    } else {
        res.json({ mensaje: "Usuario o contraseña incorrectos"})
    }
});

app.get('/dataUsr', (req, res)=>{ ///:email
	if(req != null){
		// const {email} = req.params;
		const email = req.user.emails[0].value;

		// console.log("Ayudaaa "+req.user);

		const usuario = `SELECT * FROM users WHERE Email='${email}'`;

		mysqlConnection.query(usuario, function (err, rows) {
			if (err) throw err;
				//alert("NO se puede realizar otra reserva");
				// message= "Ya se ha realizado una reserva diaria."

			const response = {
				mensaje: 'consulta exitosa',
				info: []				
			}

			let inf = rows;
			for (let i in inf){
				if(inf.hasOwnProperty(i)){
					const usuario={
						Nombre: inf[i].Nombre+" "+inf[i].Apellido,
						Email: inf[i].Email,
						grado_id: inf[i].grado_id,
						Numero_carne:inf[i].Numero_carne
					}
					response.info.push(usuario);
				}
			} 
			res.json(response);
		});
	}
})

app.get('/compare_email/:email', (req, res)=>{
	if(req != null){
		const {email} = req.params;

		const usuario = `SELECT COUNT(Email) as cant FROM users WHERE Email='${email}'`;

		mysqlConnection.query(usuario, function (err, result, fields) {
			if (err) throw err;
			if(result[0].cant > 0){
				//alert("NO se puede realizar otra reserva");
                // message= "Ya se ha realizado una reserva diaria."
				res.status(200).send({
                    mensaje: "Ya existe una cuenta con ese correo"
				});
                // res.redirect('/principal');
			} else{  
                // mensaje='No existe una cuenta con ese correo';
				res.status(200).send({
                    mensaje: "No existe una cuenta con ese correo"
				});
			}
		});
	}
})

app.post('/create_usr', (req, res)=>{
	if(req !=  null){
		let data = req.body.usr;
		let nombre = data.Nombre;
		let apellidos = data.Apellido;
		let num_carne = data.Numero_carne;
		let grado_id = data.grado_id;
		let correo = data.Email;
		// const usuario = `SELECT COUNT(Email) as cant FROM users WHERE Email='${email}'`;
		const query = `INSERT INTO users(Nombre, Apellido, Email, grado_id, rol)VALUES('${nombre}', '${apellidos}', '${correo}', '${grado_id}', 1)`;
		
		(async ()=> {
			mysqlConnection.query(query, [nombre, apellidos, correo, num_carne, grado_id, 1], (err) => {
				if(!err){
					// console.log(result[0].id);
					console.log("Nombre: ",nombre);
					console.log("Apellidos: ",apellidos);
					
					res.status(200).send({
						mensaje: "Usuario creado con éxito. "
					});
				} else {
					console.log(err);
				}
			});
		})()
	}
});

app.post('/aceptar_reserva', rutasProtegidas,  async (req, res, next) => {
	if (req !== null) {

		let data = req.body.reserva;
		let dateStart = data.start_time;
		let dateEnd = data.end_time;
		let dateS = new Date(dateStart);
		let dateE = new Date(dateEnd);
		let message = "";
		let resultS = Math.round(dateS/1000);
		let resultE = Math.round(dateE/1000);
		let elementoID = data.room_id;
		let ev_dateS = new Date(dateS);
		let ev_dateE = new Date(dateE);
		let date_reserva = dateStart.split('T');

		console.log("DateS: ", dateS.toLocaleTimeString());
		console.log("Datee: ", resultS);
		console.log("Calendar: ", ev_dateS);
		console.log("Date google Calendar: ", ev_dateS.toLocaleTimeString());
		// ev_dateS
		// let hora = date_reserva[1].split(':');
		// hora[0]= parseInt(hora[0])+1;
		// let hora_reserva = hora[0]+':'+hora[1];
		// hora_reserva = hora_reserva.replace(/\s/g, '');
		// console.log('Hora Inicio', hora_reserva);

		// dateS.setHours(dateS.getHours() + 1)
		let hora_email;
		if(dateS.getMinutes() == 0){
			hora_email = dateS.getHours()+":"+dateS.getMinutes()+dateS.getSeconds();
		}else{
			hora_email = dateS.getHours()+":"+dateS.getMinutes();
		}
		// let hora_email = new Date(hora_email1);
		// console.log("ayyy: ", hora_email1);
		console.log("jejeje: ", hora_email);
		// console.log("jnk: ", date_reserva);

		var today = new Date();
		var start = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate()+" "+"00:00:00";
		var end = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate()+" "+"23:59:59";

		console.log(start);
		console.log(end);

		console.log("----------");
		console.log(resultS);
		
		//SELECT * FROM `mrbs_entry` WHERE description="martha.marquez@alumnos.uneatlantico.es" AND timestamp>="2020-05-25 00:00:00" AND timestamp<="2020-05-25 23:59:59"
		const reserva1 = `SELECT COUNT(*) as cant FROM mrbs_entry WHERE description='${data.description}' AND timestamp>="${start}" AND timestamp<="${end}"`;
		// const compare_dates = 'SELECT COUNT(*) as disponibilidad FROM mrbs_entry WHERE room_id =' +elementoID +' AND start_time BETWEEN '+elementoS+' AND '+elementoE;
		
		// SELECT COUNT(*) FROM mrbs_entry WHERE room_id =80 AND start_time BETWEEN '1599471000' AND '1599472800'
		// SELECT * FROM mrbs_entry WHERE start_time BETWEEN '1599469200' AND '1599476400' 
		const query_roomName = `SELECT room_name FROM mrbs_room WHERE ID =${elementoID}`;

		

		let demo = mysqlConnection.query('SELECT * FROM mrbs_entry WHERE room_id =' +elementoID +' AND start_time <='+resultS +' AND end_time >='+resultE, (err, rows)=>{
			if(rows[0]){

				console.log("NO se puede realizar la reserva por falta de disponibilidad");

				res.status(200).send({
					mensaje: "No hay disponibilidad"
				});
				
	        } else {  
				mysqlConnection.query(reserva1, function (err, result, fields) {
					if (err) throw err;
					if(result[0].cant > 0){
						console.log("NO se puede realizar otra reserva");
						
						res.status(200).send({
							mensaje: "Ya se ha realizado una reserva diaria."
						});
					}else{
						const query = `INSERT INTO mrbs_entry(start_time, end_time, room_id, create_by, name, description)VALUES('${resultS}', '${resultE}', '${elementoID}', '${data.create_by}', '${data.name}', '${data.description}')`;
						const query_id = `SELECT id FROM mrbs_entry WHERE (start_time='${resultS}'AND end_time='${resultE}' AND room_id='${elementoID}' AND create_by='${data.create_by}'AND name='${data.name}'AND description='${data.description}')`;

						let _id;
						(async ()=> {
							mysqlConnection.query(query, [dateS, dateE, elementoID, data.create_by, data.name, data.description], (err) => {
								if(!err){
									mysqlConnection.query(query_roomName, function (err, result, fields) {
										if(!err){
											let name = result[0].room_name;
											console.log(name);
											// const reserva_usr = `INSERT INTO reservas(id, room_name, room_id, date, time, user)VALUES('${name}', '${elementoID}', '${date_reserva[0]}', '${hora_email}', '${data.description}')`;
											// mysqlConnection.query(reserva_usr, [name, elementoID, date_reserva[0], hora_email, data.description], (err)=> {
												if(!err){
													mysqlConnection.query(query_id, function (err, result, fields) {
														if (err) throw err;
														
														// console.log(result[0].id);
														_id = result[0].id;
														console.log("Id: ",_id);
														console.log("Start: ",dateS.toLocaleTimeString()," End:", dateE.toLocaleTimeString());
														const reserva_usr = `INSERT INTO reservas(id, room_name, room_id, date, time, user)VALUES(${_id}, '${name}', '${elementoID}', '${date_reserva[0]}', '${hora_email}', '${data.description}')`;
														mysqlConnection.query(reserva_usr, [name, elementoID, date_reserva[0], hora_email, data.description], (err)=> {
															sendEmail(_id, data.description, date_reserva[0], hora_email); //, data.description
															// console.log("Id Length: ", _id.length);
									
															let evt_id
															evt_id = "7s7fg4g8e8f9g"+_id+"0000";
			
															Event(ev_dateS, ev_dateE, elementoID, data.name, data.description, evt_id);
															req.flash('success', 'Reserva Realizada');
															
															res.status(200).send({
																mensaje: "Reserva creada con éxito. ",
																id: _id,
																description: data.description
															});
														});	
													});
												}	else {
													console.log(err);
												}
																			
										} 
									});
								}
							});
						})()
					}
				});
			}
		})

	}
});

app.get('/:room_id/:dateS/:dateE', rutasProtegidas, (req, res) => {
  if (req !== null) {
	const { room_id, dateS, dateE } = req.params;
  	let start_time = new Date (dateS).getTime()/1000.0;
  	let end_time = new Date (dateE).getTime()/1000.0;

	// start_time.setHours(start_time.getHours()-2);
	// end_time.setHours(end_time.getHours()-2);
	
	console.log(new Date (start_time*1000).toLocaleString());
	console.log(new Date (end_time*1000).toLocaleString());
	console.log("--------");  


	// console.log("User: ", req.user.emails[0].value);

	sql=`SELECT id, start_time, end_time, room_id FROM mrbs_entry WHERE room_id = ${room_id} AND (start_time BETWEEN ${start_time} AND ${end_time}) AND (end_time BETWEEN ${start_time} AND ${end_time})`;
	// sql_id = sql=`SELECT id FROM mrbs_entry WHERE room_id = ${room_id} AND (start_time BETWEEN ${start_time} AND ${end_time}) AND (end_time BETWEEN ${start_time} AND ${end_time})`;00000

	mysqlConnection.query(sql, (err, rows)=>{
	    if(!err){
	    	const response = {
	    		mensaje: 'consulta exitosa',
				disponibilidad: []				
	    	}
	
	      let inf = rows;
	      for (var i in inf){
	        if(inf.hasOwnProperty(i)){
	          const reserva={
	           	start_time:new Date((inf[i].start_time*1000)+3600000*1),//*2
	            end_time:new Date((inf[i].end_time*1000)+3600000*1), //*2
				room_id:inf[i].room_id
	          }
	          response.disponibilidad.push(reserva);
	        }
	      } 
	      res.json(response);
	    } else {
	      console.log(err);
	    }
	  });
	}
});

app.delete('/eliminar_reserva/:_id/:description', (req, res) => {// /:_room_id
	if (req !== null) {
		const {_id, description} = req.params;

		console.log("Id: ",_id);
		console.log("Usr: ", description);
		// console.log("Id Length: ", _id.length);
		
		let evt_id
		evt_id = "7s7fg4g8e8f9g"+_id+"0000";
		// if(_id.length <= 4){
		// 	evt_id = _id+"0000";
		// }else{
		// 	evt_id=_id;
		// }
		
		console.log("Event Id: ",evt_id);
		
		console.log("--------");  
  
		sql=`DELETE FROM mrbs_entry, reservas USING mrbs_entry LEFT JOIN reservas 
			ON mrbs_entry.id = reservas.id AND mrbs_entry.description = reservas.user
			WHERE mrbs_entry.id=${_id} AND mrbs_entry.description= '${description}'`;
		
		deleteEvent(evt_id);

		mysqlConnection.query(sql, (err, rows)=>{
			if(err){
				console.log(err);  
			} else {
				const response = {
					message: 'Reserva eliminada'
				}
				res.json(response);
			}
		});	
	  }
});

app.get('/download/:name', (req, res, next) => {
	const {name} = req.params;
	res.download(`../Labs_virtuales/src/labs/${name}.rdp`);
	res.status(200);
});

app.get('/getUsr', (req, res)=>{
	const email = req.user.emails[0].value;
	res.status(200).send({
		email: email
	});
});

//Send Mail Function
let sendEmail = function(id, mail, day, hour){
	// Definimos el transporter
	var transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: 'salas.biblioteca@uneatlantico.es',  //mail
			pass: '4SwMVpux'  //password
		}
	});
	// Definimos el email
	var mailOptions = {
		from: 'salas.biblioteca@uneatlantico.es',
		to: mail, //`${mail}`
		subject: 'Reserva Sala de Biblioteca',
		// Redirecciona a la página, la cual tendrá 2 botones, cancelar, o el de eliminar la reserva
		html: `<p>
		
		Su reserva para el día ${day} a la hora ${hour} ha sido creada correctamente. Puede consultar toda la información de la misma en el Google Calendar. 
		</p>
		<p style="font-weight: bold;">Tenga en cuenta: </p>

    	Puede cancelar la reserva pinchando en el seguiente enlace. 
		Si transcurridos 10 minutos de la hora de la reserva no se ha presentado nadie del grupo, la reserva será cancelada. 
		El personal de la Biblioteca se guarda el derecho de modificar la la Reserva.  

		<br><br>
		Máxima de personas: (sin contar ahora el COVID)

		1, 2 5 y 6 máximo 8 personas
		3 y 4 máximo 10 personas


		Si desea eliminar su reserva puede dar click en el siguiente enlace</p><br>
		<a href="http://localhost:3000/ReservaEliminada?id=${id}&usuario=${mail}">Eliminar Reserva</a><br>
		<p>Se ha creado un evento a partir de los datos de la reserva, si desea verificar la hora y lugar de la reserva debe revisar el evento en Google Calendar</p>` //onclick="${confirmation(id)}"
	};
	// Enviamos el email
	transporter.sendMail(mailOptions, function(error, info){
		if (error){
			console.log(error);
		} else {
			console.log("Email sent");
		}
	});

}

function Event(start_time, end_time, room_id, subject, email, id){

	fs.readFile('./credentials.json', (err, content) => {
	if (err) return console.log('Error loading client secret file:', err);
	// Authorize a client with credentials, then call the Google Calendar API.
	authorize(JSON.parse(content), listEvents);
	});
	
	/**
	 * Create an OAuth2 client with the given credentials, and then execute the
	 * given callback function.
	 * @param {Object} credentials The authorization client credentials.
	 * @param {function} callback The callback to call with the authorized client.
	 */
	function authorize(credentials, callback) {
		const {client_secret, client_id, redirect_uris} = credentials.installed;
		const oAuth2Client = new google.auth.OAuth2(
			client_id, client_secret, redirect_uris[0]);
	
		// Check if we have previously stored a token.
		fs.readFile(TOKEN_PATH, (err, token) => {
			if (err) return getAccessToken(oAuth2Client, callback);
			oAuth2Client.setCredentials(JSON.parse(token));
			callback(oAuth2Client);
		});
	}
	
	/**
	 * Get and store new token after prompting for user authorization, and then
	 * execute the given callback with the authorized OAuth2 client.
	 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
	 * @param {getEventsCallback} callback The callback for the authorized client.
	 */
	function getAccessToken(oAuth2Client, callback) {
	const authUrl = oAuth2Client.generateAuthUrl({
		access_type: 'offline',
		scope: SCOPES,
	});
	console.log('Authorize this app by visiting this url:', authUrl);
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});
	rl.question('Enter the code from that page here: ', (code) => {
		rl.close();
		oAuth2Client.getToken(code, (err, token) => {
		if (err) return console.error('Error retrieving access token', err);
		oAuth2Client.setCredentials(token);
		// Store the token to disk for later program executions
		fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
			if (err) return console.error(err);
			console.log('Token stored to', TOKEN_PATH);
		});
		callback(oAuth2Client);
		});
	});
	}
	
	/**
	 * Lists the next 10 events on the user's primary calendar.
	 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
	 */
	function listEvents(auth) {
	const calendar = google.calendar({version: 'v3', auth});
	calendar.events.list({
		calendarId: 'primary',
		timeMin: (new Date()).toISOString(),
		maxResults: 10,
		singleEvents: true,
		orderBy: 'startTime',
	}, (err, res) => {
		if (err) return console.log('The API returned an error: ' + err);
		const events = res.data.items;
		if (events.length) {
		console.log('Upcoming 10 events:');
		events.map((event, i) => {
			const start = event.start.dateTime || event.start.date;
			console.log(`${start} - ${event.summary}`);
		});
		} else {
		console.log('No upcoming events found.');
		}
		createEvent(start_time, end_time, room_id, subject, email, id, auth);
	});
	}
	
	function createEvent(start_time, end_time, room_id, subject, email, id,  auth){
		let room=0;

		if(room_id==80){
			room=1;
		}else if(room_id==81){
			room=2;
		}else if(room_id==82){
			room=3;
		}else if(room_id==83){
			room=4;
		}else if(room_id==84){
			room=5;
		}else if(room_id==85){
			room=6;
		}

		let event = {
			'summary': subject,
			'location': 'Sala '+room+" de Bibiblioteca",
			// 'description': subject,
			'start': {
				'dateTime': start_time,
				'timeZone': 'Europe/Madrid',
			},
			'end': {
				'dateTime': end_time,
				'timeZone': 'Europe/Madrid',
			},
			'recurrence': [
				'RRULE:FREQ=DAILY;COUNT=1'
			],
			'id': id,
			'attendees': [
			{'email': email}
			// {'email': GOOGLE_CLIENT_EMAIL}
		],
			'reminders': {
			'useDefault': false,
			'overrides': [
				{'method': 'email', 'minutes': 24 * 60},
				{'method': 'popup', 'minutes': 10},
			],
		},
		};
	
		console.log(event);

		const Calendar = google.calendar({version: 'v3', auth});
		Calendar.events.insert(
			{
				auth: auth,
				calendarId: GOOGLE_CALENDAR_ID,//'primary'
				resource: event,
			},  function(err, event) {
					if (err) {
					console.log('There was an error contacting the Calendar service: ' + err);
					return;
				}
				console.log('Event created: %s', event);
			});
	}
}

function deleteEvent(eventId) {

	fs.readFile('./credentials.json', (err, content) => {
	if (err) return console.log('Error loading client secret file:', err);
	// Authorize a client with credentials, then call the Google Calendar API.
	authorize(JSON.parse(content), listEvents);
	});
	
	/**
	 * Create an OAuth2 client with the given credentials, and then execute the
	 * given callback function.
	 * @param {Object} credentials The authorization client credentials.
	 * @param {function} callback The callback to call with the authorized client.
	 */
	function authorize(credentials, callback) {
		const {client_secret, client_id, redirect_uris} = credentials.installed;
		const oAuth2Client = new google.auth.OAuth2(
			client_id, client_secret, redirect_uris[0]);
	
		// Check if we have previously stored a token.
		fs.readFile(TOKEN_PATH, (err, token) => {
			if (err) return getAccessToken(oAuth2Client, callback);
			oAuth2Client.setCredentials(JSON.parse(token));
			callback(oAuth2Client);
		});
	}
	
	/**
	 * Get and store new token after prompting for user authorization, and then
	 * execute the given callback with the authorized OAuth2 client.
	 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
	 * @param {getEventsCallback} callback The callback for the authorized client.
	 */
	function getAccessToken(oAuth2Client, callback) {
		const authUrl = oAuth2Client.generateAuthUrl({
			access_type: 'offline',
			scope: SCOPES,
		});
		console.log('Authorize this app by visiting this url:', authUrl);
		const rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout,
		});
		rl.question('Enter the code from that page here: ', (code) => {
			rl.close();
			oAuth2Client.getToken(code, (err, token) => {
			if (err) return console.error('Error retrieving access token', err);
			oAuth2Client.setCredentials(token);
			// Store the token to disk for later program executions
			fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
				if (err) return console.error(err);
				console.log('Token stored to', TOKEN_PATH);
			});
			callback(oAuth2Client);
			});
		});
	}

	function listEvents(auth) {
		const calendar = google.calendar({version: 'v3', auth});
		calendar.events.list({
			calendarId: 'c_c92epc3f1rehv6u9bo5vivget4@group.calendar.google.com',
			timeMin: (new Date()).toISOString(),
			maxResults: 10,
			singleEvents: true,
			orderBy: 'startTime',
		}, (err, res) => {
			if (err) return console.log('The API returned an error: ' + err);
			const events = res.data.items;
			if (events.length) {
			console.log('Upcoming 10 events:');
			events.map((event, i) => {
				const start = event.start.dateTime || event.start.date;
				console.log(`${start} - ${event.summary}`);
			});
			} else {
			console.log('No upcoming events found.');
			}
			deleteEvt(eventId, auth);
		});
		}

	function deleteEvt(eventId, auth){
		const calendar = google.calendar({version: 'v3', auth});
		var params = {
			calendarId: GOOGLE_CALENDAR_ID,
			eventId: eventId,
			};
	
			calendar.events.delete(params, function(err) {
			if (err) {
				console.log('The API returned an error: ' + err);
				return;
			}
			console.log('Event deleted.');
			});
	}
}

//URL no encontrada
app.use(function(req, res, next) {
 respuesta = {
  mensaje: 'URL no encontrada'
 };
 res.status(404).send(respuesta);
});


//Inicia el servidor 
// app.listen(app.get('port'), () => {
//  console.log('Server on port', app.get('port'));
// });

module.exports = app;