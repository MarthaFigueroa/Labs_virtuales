const app = new Vue({
    el: '#app',
    data: {
        selected: 80,
        options: [
            {text: 1, value: 80},
            {text: 2, value: 81},
            {text: 3, value: 82},
            {text: 4, value: 83},
            {text: 5, value: 84}
        ],
        horas: ["7:00","7:30",,"8:00","8:30","9:00","9:30","10:00","10:30","11:00","11:30","12:00",
        "12:30","13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00","17:30","18:00","18:30","19:00"]
        // token: ''
    },
    methods: {
      listVal: function(){
          let grado = document.getElementById('grado');
          let room = grado.options[grado.selectedIndex].value;
          console.log("Labs: ", parseInt(room));
          return parseInt(room);
      },
      preventDef: function(e){
        e.preventDefault();
      },
      requestData(e){
        
        const myToken = sessionStorage.getItem("token");
        console.log("my token GG ", myToken);
        
        // var userTimezoneOffset = date.getTimezoneOffset() * 60000;
        let fechaInicio = document.getElementById('fechaIni').value;
        let horaInicio = document.getElementById('horaIni').value;
        let fecha1 = new Date(fechaInicio+' '+horaInicio);
        
        // let fecha1 = (d1.getTime()-d1.getMilliseconds())/1000;

        let fechaFin = document.getElementById('fechaFin').value;
        let horaFin = document.getElementById('horaFin').value;
        let fecha2 = new Date(fechaFin+' '+horaFin);
        // let fecha2 = (d.getTime()-d.getMilliseconds())/1000;

        let room = this.listVal();
        console.log(room);

        let createBy = document.getElementById('usr').value;
        let asunto = document.getElementById('reserva').value;
        let descripcion = document.getElementById('descripcion').value+"@alumnos.uneatlantico.es";
    
        console.log("entra");
        
        let reserva = {
          "reserva":{
            "start_time": fecha1,
            "end_time": fecha2,
            "room_id": room,
            "create_by": createBy,
            "name": asunto,
            "description": descripcion
          }
        }

        console.log(JSON.stringify(reserva));
        
        
        var url = "http://localhost:3000/aceptar_reserva";

        this.preventDef(e);
        console.log("Paso");
        
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
            console.log("Si se ejecutaaaaaaaaa")
            let element = document.createElement("div");
              element.appendChild(document.createTextNode('Se ha guardado la reserva de la sala'));
              element.setAttribute("class", "alert alert-success");
              document.getElementById('alertCont').prepend(element);  
            setTimeout(function(){ 
              $('#alertCont').remove();
            }, 5000);
                        
            
            return response.json();
            
          }).then((data) => {
          console.log("data ",data);
          let id_reserva = data.id;
          console.log("Id: ",id_reserva);
          sessionStorage.setItem("id_reserva",id_reserva);
          // window.location.href = '/ReservaExitosa.html';
          //  res.redirect('ReservaExitosa.html');
           window.alert("Su Reserva ha sido creada con exito, puede revisarla en el calendario");

          
        })
        .catch(function(err) {
        console.error(err);
        })
      },
      value(){
        var fechaInicio = document.getElementById('fechaIni').value;
        var horaInicio = document.getElementById('horaIni').value;
        // let horaInicio = new Date(hora);
       
        // horaInicio = horaInicio.setTime(horaInicio.getTime() + (1*60*60*1000));
        // console.log((horaInicio.getHours()-1));
        
        var fecha1 = new Date(fechaInicio+' '+horaInicio);
        // var fecha = (d.getTime()-d.getMilliseconds())/1000;
        // console.log(fecha1);
        
          // var d = new Date(fecha1),
          //     month = '' + (d.getMonth() + 1),
          //     day = '' + d.getDate(),
          //     year = d.getFullYear();
      
          // if (month.length < 2) month = '0' + month;
          // if (day.length < 2) day = '0' + day;
      
          // fecha1=  [year, month, day].join('-');
      
          console.log(fecha1);
          

        sessionStorage.setItem("inicio",fecha1);

      },
      valueFin(){
        var fechaFin = document.getElementById('fechaFin').value;
        var horaFin = document.getElementById('horaFin').value;
        var fecha2 = new Date(fechaFin+' '+horaFin);
        // var fecha = (d.getTime()-d.getMilliseconds())/1000;
        // console.log(fecha);
        // console.log(d.toUTCString());
        // console.log(fecha2.toLocaleDateString("en-US").replace("/", "-"));
        let end_time = new Date (fecha2).getTime()/1000.0;
        
        console.log("Fecha: "+new Date (end_time*1000).toLocaleString());
        

        // let d = fecha2.toDateString();

        // const ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(d)
        // const mo = new Intl.DateTimeFormat('en', { month: 'short' }).format(d)
        // const da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(d)

        // console.log(ye+"-"+mo+"-"+da)

        sessionStorage.setItem("fin",fecha2);
        return fecha2;
      },
      valueRoom(){
        
        var room = document.getElementById('room');
        var value = room[room.selectedIndex].value;
        console.log(value);
      },
      valueUsr(){
        
        var createBy = document.getElementById('usr').value;
        console.log("Usr: "+createBy);
        
        var asunto = document.getElementById('reserva').value;
        console.log("reserva: "+asunto);
      },
      valueAsunto(){
        
        var asunto = document.getElementById('reserva').value;
        console.log("reserva: "+asunto);
      },
      valueDescription(){
        
        var asunto = document.getElementById('descripcion').value;
        console.log("descripcion: "+asunto);
      },
      saveToken(){
        console.log("entrando");
        var url = "http://localhost:3000/autenticar";
        
        fetch(url, {
        method: "POST",
        body: JSON.stringify({ usuario: "asfo", contrasena: "holamundo" }),
        headers: {
            
            "Content-Type": "application/json"
            // "access-token": token
        },
        mode: 'cors',
        cache: 'no-cache'  
        })
        .then(response => {
            return response.json();
        })
        .then((data) => {
            var token = data['token']
            console.log(token);
            sessionStorage.setItem("token",token);
            window.location.href = '/laboratoriosvirtuales/reservaForm.php';
            //this.requestData(token);
        })
        .catch(function(err) {
            console.error(err);
        });
      },
      deleteReserva(e){

        // let id = sessionStorage.getItem("id_reserva");
        // const myToken = sessionStorage.getItem("token");
        // console.log("my token GG ", myToken);

        let id = this.getId()["id"];
        console.log("id: ",id);
        
        // var url = "http://localhost:3000/autenticar";
        
        // fetch(url, {
        // method: "POST",
        // body: JSON.stringify({ usuario: "asfo", contrasena: "holamundo" }),
        // headers: {
            
        //     "Content-Type": "application/json"
        //     // "access-token": token
        // },
        // mode: 'cors',
        // cache: 'no-cache'  
        // })
        // .then(response => {
        //     return response.json();
        // })
        // .then((data) => {
        //     var token = data['token']
        //     console.log(token);
        //     sessionStorage.setItem("token",token);
        //     window.location.href = `http://localhost:3000/eliminar_reserva/${id}`;
        //     //this.requestData(token);
        // })
        // .catch(function(err) {
        //     console.error(err);
        // });

        let url2 = `http://localhost:3000/eliminar_reserva/${id}`;

        this.preventDef(e);

        fetch(url2,{
          method: 'GET',            
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-type': 'application/json'
            // 'access-token': myToken
          },
          mode: 'cors',
          cache: 'no-cache'
        })
        .then(response => {                        
            // window.location.href = '/ReservaExitosa.html';
            return response.json();
            
          }).then((data) => {
          console.log("data ",data);

          //  res.redirect('ReservaExitosa.html');
          
        })
        .catch(function(err) {
        console.error(err);
        })
      },
      getId(){
        let vars = {}; 
        let parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) { 
          vars[key] = value; 
        });
        return vars; 
      },
      login() {
          const { username, password } = this
          this.$store.dispatch(AUTH_REQUEST, { username, password }).then(() => {
            this.$router.push('/')
          })
      },
      availability(e){
        this.preventDef(e);
      }

    },
    mounted() {
      if(localStorage.token) this.token = localStorage.token;
    },
    beforeMount(){
      // if(token == null){
      //   window.location.href = "/login.html"
      // }
    },
    watch:{
      token(newToken) {
        localStorage.token = newToken;
      }
    }
   
});