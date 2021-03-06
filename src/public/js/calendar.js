let today = new Date();
let currentMonth = today.getMonth();
let currentYear = today.getFullYear();
let selectYear = document.getElementById("year");
let selectMonth = document.getElementById("month");

let months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec"
];

// let horas = ["7:00","8:00","9:00","10:00","11:00","12:00",
//         "13:00","14:00","15:00","16:00","17:00","18:00","19:00"];


let horas = ["7:00","7:30","8:00","8:30","9:00","9:30","10:00","10:30","11:00","11:30","12:00","12:30","13:00",
        "13:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00","17:30","18:00","18:30","19:00"];

let monthAndYear = document.getElementById("monthAndYear");
showCalendar(currentMonth, currentYear);

function next() {
    currentYear = (currentMonth === 11) ? currentYear + 1 : currentYear;
    currentMonth = (currentMonth + 1) % 12;
    showCalendar(currentMonth, currentYear);
}

function previous() {
    currentYear = (currentMonth === 0) ? currentYear - 1 : currentYear;
    currentMonth = (currentMonth === 0) ? 11 : currentMonth - 1;
    showCalendar(currentMonth, currentYear);
}

function jump() {
    currentYear = parseInt(selectYear.value);
    currentMonth = parseInt(selectMonth.value);
    showCalendar(currentMonth, currentYear);
}

function showCalendar(month, year) {

    let firstDay = (new Date(year, month)).getDay();
    let daysInMonth = 32 - new Date(year, month, 32).getDate();

    let tbl = document.getElementById("calendar-body"); // body of the calendar

    // clearing all previous cells
    tbl.innerHTML = "";

    // filing data about month and in the page via DOM.
    monthAndYear.innerHTML = months[month] + " " + year;
    selectYear.value = year;
    selectMonth.value = month;

    // creating all cells
    let date = 1;
    for (let i = 0; i < 6; i++) {
        // creates a table row
        let row = document.createElement("tr");

        //creating individual cells, filing them up with data.
        for (let j = 0; j < 7; j++) {
          let cell = document.createElement("td");
            if (i === 0 && j < firstDay) {
                let cellText = document.createTextNode("");
                cell.appendChild(cellText);
                row.appendChild(cell);
            }
            else if (date > daysInMonth) {
                break;
            }

            else {
                cell.setAttribute("class", "day");
                cell.setAttribute("data-toggle", "modal");
                cell.setAttribute("data-target", "#exampleModal");
                
                let cellText = document.createTextNode(date);
                if (date === today.getDate() && year === today.getFullYear() && month === today.getMonth()) {
                    cell.classList.add("bg-info");
                } // color today's date
                cell.style.cursor="pointer";
                cell.value = months[month]+" "+date+","+year;
                
                
                cell.appendChild(cellText);
                row.appendChild(cell);
                changeTitle(cell);
                toDate(cell,date);
                date++;
            }
        }
        tbl.appendChild(row); // appending each row into calendar body.
    }

    function changeTitle(cell){
        cell.addEventListener("click", function(){
            let titulo = document.getElementById('exampleModalLabel');
            cell = cell.value;
            titulo.innerHTML = "Disponibilidad en la Fecha "+cell;
        });
    }

    function toDate(cell,date){
        cell.addEventListener("click", function(event){   
            event.preventDefault();
            // cell.value = months[month]+" "+date+","+year;
            let dateCell = new Date(cell.value);  
            console.log("Fechaaa: ",dateCell);
            console.log("date: "+date);
            // clearTimeTable();
            timeTable(dateCell, month, date, year);
        });
    }
}

//Clear old table before create the new one.
function clearTimeTable(){
    for (hora in horas) {
        document.getElementById(horas[hora]).remove();
    }
}

//Create hour column 
function createTimeColumn(){
    showCalendar(currentMonth, currentYear);
    let table = document.getElementById('timeTableBody');
    
    for (hora in horas) {
        // creates a table row.
        let row = document.createElement("tr");
        row.setAttribute('id', horas[hora]);

        let column = document.createElement("td");
        let columnText = document.createTextNode(horas[hora]);
        column.appendChild(columnText);
        row.appendChild(column);
        table.appendChild(row);
    }
}

async function toHour(cell, room){
    cell.addEventListener("click", async function(event){   
        event.preventDefault();
        clearTimeTable();
        let dateCell = new Date(cell.value);  
        let usuario_data;
        // await infoUsr();
        usuario_data = await infoUsr();
        console.log("usuarioooo ",usuario_data.Email);
        let asunto = "Reserva Sala Biblioteca", createBy=usuario_data.Nombre, descripcion=usuario_data.Email;
        let dateCellEnd = new Date(dateCell);
        dateCell.setHours(dateCell.getHours()-1);
        dateCellEnd.setHours(dateCellEnd.getHours()-1, dateCellEnd.getMinutes() +30);
        console.log(dateCell, dateCellEnd);
        console.log("Horaaa: ", dateCell);

        let reserva = {
          "reserva":{
            "start_time": dateCell,
            "end_time": dateCellEnd,
            "room_id": parseInt(room),
            "create_by": createBy,
            "name": asunto,
            "description": descripcion
          }
        }
        console.log("Su reserva sería: ", reserva);
        requestData(reserva); //dateCell, dateCellEnd, room, asunto, createBy, descripcion
        timeTable(dateCell);
        clearTimeTable();

    });
}

function timeTable(buttonDate, month, date, year){

    createTimeColumn();

    let rooms = {86:false, 87:false, 88:false, 89:false};
    // let rooms = [80,81,82,83,84];
    
    for(room in rooms) {

        let disponibilidad = {
            "7:00":true,"7:30":true,"8:00": true,"8:30": true,"9:00": true,"9:30": true,"10:00": true,"10:30": true,"11:00": true,"11:30": true,"12:00": true,"12:30": true,"13:00": true,
            "13:30": true,"14:00": true,"14:30": true,"15:00": true,"15:30": true,"16:00": true,"16:30": true,"17:00": true,"17:30": true,"18:00": true,"18:30": true,"19:00": true
        };
        
        for(hora in disponibilidad){
            
            let row = document.getElementById(hora);
            let cell = document.createElement("td");
            // let textoCell = document.createTextNode('');
            // cell.appendChild(textoCell);
            cell.setAttribute("id", room+"_"+hora);
            
            let disponible = "Disponible";
            // cell.classList.add("disponible");
            cell.setAttribute("data-toggle", "modal");
            cell.setAttribute("data-target", "#exampleModal");
            cell.setAttribute("class", "disponible");
            
            let text = document.createTextNode(disponible);
            cell.value =  months[month]+" "+date+" "+year+" "+hora;
            cell.style.cursor="pointer";
            cell.appendChild(text);
            row.appendChild(cell);

            // if(cell.getElementsByClassName('disponible')){
                toHour(cell, room);
            // }
            // console.log(cell.id);
        }

        fetchData(room, buttonDate, buttonDate, function(data) {
            
            // console.log("ROOM ",room, data);
            // console.log("Data Disponibilidad: ", data.disponibilidad);
            console.log("Disponibilidad: ", disponibilidad);

            for(reserva of data.disponibilidad) {
                console.log("Reservas no disponibles: ", reserva);
                disponibilidad = Disponibilidad(reserva, disponibilidad);
            }
            
            console.log("JSON", disponibilidad);

            if(data.disponibilidad.length>0){
                displayDisponibilidad(disponibilidad,data.disponibilidad[0].room_id);
                
            }
        });  //data= responseData, the value that fetchData returns.
    }
}
function Disponibilidad(reserva, json){
    let startTime = reserva.start_time.split('T');
    startTime = startTime[1].split(':');
    let endTime = reserva.end_time.split('T');
    endTime = endTime[1].split(':');
    console.log("Json: ", json);

    for(let item in json){
        itemTime = item.split(':');  //Elimina los ':'

        if(parseInt(itemTime[0])>=parseInt(startTime[0]) && parseInt(itemTime[0])<parseInt(endTime[0])){  //Compare the itemTime(Hour: Position 0) with the startTime and endTime 
            if(parseInt(itemTime[0])==parseInt(startTime[0]) && parseInt(itemTime[1])>=parseInt(startTime[1])) json[item] = false;  //Compare the itemHour(Position 0) with the startTime and itemMinute(Position 1) and hours
            else if (parseInt(itemTime[0])!=parseInt(startTime[0])) json[item] = false
        }
        else if(parseInt(itemTime[0])==parseInt(endTime[0])){
            if(parseInt(itemTime[1])<parseInt(endTime[1])) json[item] = false;
        }        
    }
    return json;  //Return update values.
}
function displayDisponibilidad(disponibilidad, room){
    let cell;
    for(hora in disponibilidad){
        // let cell = document.createElement("td");
        cell = document.getElementById(room+"_"+hora);
        let disponible;
            // let text = document.createTextNode('');
            // console.log(cell.value);
            if(disponibilidad[hora]){
                disponible = "Disponible";
                // cell.value = disponible;
                // cell.classList.add('btn');
                // cell.style.cursor="pointer";
                // cell.setAttribute("class", "disponible");
                // toHour(cell, room);
                // cell.innerHTML = disponible;
            }
            else{
                disponible = "Ocupado";
                // cell.value = disponible;
                // cell.style.cursor="pointer";
                cell.setAttribute("class", "ocupada");
                cell.innerHTML = disponible;
            }
            // text = document.createTextNode('');  
            // let text = document.createTextNode(disponible)
            // cell.appendChild(text);
            // cell.innerHTML = disponible;
            // cell.removeChild(text);
        }

        room=true;
    // }
    
}

function fetchData(room, startTime, endTime, onData){ 
    const myToken = sessionStorage.getItem("token");
    // console.log("my token: ", myToken);

    startTime = new Date(startTime).toDateString("yyyyMMdd");
    endTime = new Date(endTime).toDateString("yyyyMMdd");

    startTime2 = startTime.replace(/\s/g, '&');
    endTime2 = endTime.replace(/\s/g, '&');
    var url = 'http://localhost:3000/links/' +room+ '/' + startTime2 + '/' + endTime2 + '&24:00'; // ${room}/${startTime}/${endTime} 
    //var url = 'http://172.27.9.66:3000/links/82/Sat&Mar&14&2020/Sat&Mar&14&2020&24:00';
 
    fetch(url,{
      method: 'GET',            
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-type': 'application/json',
        'access-token': myToken
      },
      mode: 'cors',
      cache: 'no-cache'              
    })

    .then(function(response) {
        return response.json();
    }).then((data) => {
        // console.log("Message 2", data.mensaje);
        if(data.mensaje == "Token inválida"){
            
            document.getElementById("exampleModal").style.opacity = "0.8"; 

            document.getElementById('no_reserva').click();
            document.getElementById("modal-content").innerHTML = `
            SU SESIÓN HA EXPIRADO, VUELVA A INICIAR SESIÓN.`;
            // document.getElementById("modal-button").innerHTML = `<button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>`;

            setTimeout(function(){ 
                window.location.href = '/principal';//login.html
            }, 2000);
        }
        onData(data);
        // if(data.message == "undefined"){
        //     window.location.href("/login.html");
        // }
    })
    .catch(function(err) {
        let disponibilidad = {
            "8:00": true,"8:30": true,"9:00": true,"9:30": true,"10:00": true,"10:30": true,"11:00": true,"11:30": true,"12:00": true,"12:30": true,"13:00": true,
            "13:30": true,"14:00": true,"14:30": true,"15:00": true,"15:30": true,"16:00": true,"16:30": true,"17:00": true,"17:30": true,"18:00": true,"18:30": true,"19:00": true
        };

        displayDisponibilidad(disponibilidad);
          console.error("GG",err);
    });
}

function requestData(reserva){
  // fecha1, fecha2, room, asunto, createBy, descripcion
        
    const myToken = sessionStorage.getItem("token");
    console.log("my token GG ", myToken);
    
    let fecha1 = reserva.reserva.start_time;
    let fecha2 = reserva.reserva.end_time;
    let room = reserva.reserva.room_id;
    let asunto = reserva.reserva.name;
    let createBy = reserva.reserva.create_by;
    let descripcion = reserva.reserva.description;

    fecha1.setHours(fecha1.getHours() + 1);
    let minutos = new Date(fecha1);
    let min = minutos.getMinutes();
    console.log("Fecha 1: ", fecha1);
    fecha2.setHours(fecha2.getHours() + 1);
    var mailformat = /^\w+([\.-]?\w+)*@alumnos.uneatlantico.es/;
    var mailformat2 = /^\w+([\.-]?\w+)*@uneatlantico.es/;

    if(descripcion.match(mailformat) || descripcion.match(mailformat2) ){
      console.log("Correct!"); // document.form1.email.focus();

      console.log("entra");
      
      let reserva = {
        "reserva":{
          "start_time": fecha1,
          "end_time": fecha2,
          "room_id": parseInt(room),
          "create_by": createBy,
          "name": asunto,
          "description": descripcion
        }
      }

      console.log(JSON.stringify(reserva));
      
      var url = "http://localhost:3000/links/aceptar_reserva";

    //   this.preventDef(e);
      console.log("Paso");
      //  
      if((min==0 || min == 30)){

        fetch(url,{
          method: 'POST',            
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-type': 'application/json',
            'access-token': myToken
          },
          body: JSON.stringify(reserva),
          mode: 'cors',
          cache: 'no-cache'
        })
        .then(response => {
            return response.json();
        }).then((data) => {
          console.log("data ",data);
          if(data.mensaje == "Ya se ha realizado una reserva diaria."){
            // alert("YA SE HA REALIZADO UNA RESERVA DIARIA");
            document.getElementById('no_reserva').click();
            document.getElementById("modal-content").innerHTML = `
            YA SE HA REALIZADO UNA RESERVA DIARIA.
            <br>
            POR FAVOR VUELVA A INTENTAR EL PRÓXIMO DÍA.`;
            document.getElementById("modal-button").innerHTML = `<a type="button" href="/" class="btn btn-primary">Login</a>`;
          }else if(data.mensaje == "Token inválida"){
            
            document.getElementById('no_reserva').click();
            document.getElementById("modal-content").innerHTML = `
            SU SESIÓN HA EXPIRADO, VUELVA A INICIAR SESIÓN.`;
            setTimeout(function(){ 
              window.location.href = '/';
            }, 2000);

          }else if(data.mensaje == "No hay disponibilidad"){
            
            document.getElementById('no_reserva').click();
            document.getElementById("modal-content").innerHTML = `
            YA EXISTE UNA RESERVA A ESA HORA Y SALA.
            <br>
            POR FAVOR VUELVA A INTENTAR EN UNA SALA U HORA DIFERENTE`;

          }else{
            let id_reserva = data.id;
            console.log("Id: ",id_reserva);
            sessionStorage.setItem("id_reserva",id_reserva);
          }
        })
        .catch(function(err) {
          console.error(err);
        })
      }else{
        document.getElementById('no_reserva').click();
        document.getElementById("modal-content").innerHTML = `
        NO SE HA REALIZADO LA RESERVA.
        <br>
        POR FAVOR VUELVA A INTENTAR INGRESANDO UNA HORA VÁLIDA.`;
      }
    }
    else{
      document.getElementById('no_reserva').click();
      document.getElementById("modal-content").innerHTML = `
      NO SE HA REALIZADO LA RESERVA.
      <br>
      POR FAVOR VUELVA A INTENTAR INGRESANDO UNA DIRECCIÓN DE CORREO VÁLIDA.`;
      document.getElementById("modal-button").innerHTML = `<button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>`;
    }
  }

  function infoUsr(){

    var url = `http://localhost:3000/links/dataUsr`; //  /${correo}

    return fetch(url,{
    method: 'GET',            
    headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-type': 'application/json'
    },
    mode: 'cors',
    cache: 'no-cache'
    })
    .then(response => {
      return response.json();
    }).then((data) => {
      console.log("Data del usuario: ",data.info[0]);
      return data.info[0];
    })
    .catch(function(err) {
      console.error(err);
    })
  }
function getData(name, email){
  let data_usr = {
    "name": name,
    "email": email
  }
  console.log(data_usr);
  return data_usr;
}

  function signOut() {
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
      console.log('User signed out.');
    });
    sessionStorage.clear();
    auth2.disconnect();
    window.location.href = '/';
  }