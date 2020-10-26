const app = new Vue({
    el: '#app',
    data: {
        selected: 80,
        options: [
            {text: 1, value: 80},
            {text: 2, value: 81},
            {text: 3, value: 82},
            {text: 4, value: 83},
            {text: 5, value: 84},
            {text: 6, value: 85}
        ],
        horas: ["7:00","7:30",,"8:00","8:30","9:00","9:30","10:00","10:30","11:00","11:30","12:00",
        "12:30","13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00","17:30","18:00","18:30","19:00"]
        // token: ''
    },
    methods: {

      preventDef: function(e){
        e.preventDefault();
      },
      async onSignIn(googleUser) {
        var profile = googleUser.getBasicProfile();
        console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
        console.log('Name: ' + profile.getName());
        console.log('Image URL: ' + profile.getImageUrl());
        console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.
        let id_token = googleUser.getAuthResponse().id_token;
        console.log(id_token);
        
        var myUserEntity = {};
        myUserEntity.Id = profile.getId();
        myUserEntity.Name = profile.getName();
        
        //Store the entity object in sessionStorage where it will be accessible from all pages of your site.
        sessionStorage.setItem('myUserEntity',JSON.stringify(myUserEntity));

        this.searchUsr(profile.getEmail);
        this.saveToken();
        // const redirection = await red();
      },
      searchUsr(correo, e){

        console.log("entra");

        var url = `http://localhost:3000/links/compare_email/${correo}`;

        console.log("Paso");

        this.preventDef();

        fetch(url,{
        method: 'POST',            
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
            if(data.mensaje == "Ya existe una cuenta con ese correo"){
                window.location.href = '/principal.html';
            }else{
                window.location.href = '/formulario2.html';
            }

        console.log("data ",data);
        })
        .catch(function(err) {
        console.error(err);
        })
      },
      create_usr(e){
        
        // const myToken = sessionStorage.getItem("token");
        // console.log("my token GG ", myToken);
        
        // var userTimezoneOffset = date.getTimezoneOffset() * 60000;
        let nombre = document.getElementById('nombre').value;
        let apellidos = document.getElementById('apellidos').value;
        let correo = document.getElementById('correo').value;
        let carne = document.getElementById('carne').value;
        let grado = document.getElementById('grado');
        let gradovalue = grado[grado.selectedIndex].value;
        var mailformat = /^\w+([\.-]?\w+)*@alumnos.uneatlantico.es/;

        var mailformat2 = /^\w+([\.-]?\w+)*@uneatlantico.es/;

        if(correo.match(mailformat) || correo.match(mailformat2) ){
          console.log("Correct!"); // document.form1.email.focus();

          console.log("entra");
          
          let usr = {
            "usr":{
              "Nombre": nombre,
              "Apellido": apellidos,
              "Email": correo,
              "Numero_carne": carne,
              "grado_id": gradovalue
            }
          }

          console.log(JSON.stringify(usr));
          
          var url = "http://localhost:3000/links/create_usr";

          this.preventDef(e);
          console.log("Paso");

            fetch(url,{
              method: 'POST',            
              headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-type': 'application/json'
              },
              body: JSON.stringify(usr),
              mode: 'cors',
              cache: 'no-cache'
            })
            .then(response => {
                return response.json();
              }).then((data) => {
              window.location.href = '/principal.html';
              console.log("data ",data);
            })
            .catch(function(err) {
              console.error(err);
            })
        }else{
          document.getElementById('no_reserva').click();
          document.getElementById("modal-content").innerHTML = `
          NO SE HA REALIZADO EL REGISTRO.
          <br>
          POR FAVOR VUELVA A INTENTAR INGRESANDO UNA DIRECCIÓN DE CORREO VÁLIDA.`;
          document.getElementById("modal-button").innerHTML = `<button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>`;
        }
      },
      infoUsr(correo, e){

        console.log("entra");

        var url = `http://localhost:3000/links/dataUsr/${correo}`;

        console.log("Paso");

        this.preventDef();

        fetch(url,{
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
          console.log("data ",data);
          // document.getElementById('grado').innerHTML == 
        })
        .catch(function(err) {
          console.error(err);
        })
      },
      requestData(e){
        
        const myToken = sessionStorage.getItem("token");
        console.log("my token GG ", myToken);
        
        // var userTimezoneOffset = date.getTimezoneOffset() * 60000;
        let fechaInicio = document.getElementById('fechaIni').value;
        let horaInicio = document.getElementById('horaIni').value;
        console.log(horaInicio);
        
        
        let fecha1 = new Date(fechaInicio+' '+horaInicio);
        fecha1.setHours(fecha1.getHours() + 2);
        let minutos = new Date(fecha1);
        let min = minutos.getMinutes();
        console.log("Fecha 1: ", fecha1);
        // let fecha1 = (d1.getTime()-d1.getMilliseconds())/1000;

        let fechaFin = document.getElementById('fechaIni').value;
        let horaFin = document.getElementById('horaFin').value;
        let fecha2 = new Date(fechaFin+' '+horaFin);
        fecha2.setHours(fecha2.getHours() + 2);
        // let fecha2 = (d.getTime()-d.getMilliseconds())/1000;

        let room = document.getElementById('room');
        let roomvalue = room[room.selectedIndex].value;

        let createBy = document.getElementById('usr').value;
        let asunto = document.getElementById('reserva').value;

        var descripcion = document.getElementById("descripcion").value;
        var mailformat = /^\w+([\.-]?\w+)*@alumnos.uneatlantico.es/;
        var mailformat2 = /^\w+([\.-]?\w+)*@uneatlantico.es/;

        if(descripcion.match(mailformat) || descripcion.match(mailformat2) ){
          console.log("Correct!"); // document.form1.email.focus();

          console.log("entra");
          
          let reserva = {
            "reserva":{
              "start_time": fecha1,
              "end_time": fecha2,
              "room_id": parseInt(roomvalue),
              "create_by": createBy,
              "name": asunto,
              "description": descripcion
            }
          }

          console.log(JSON.stringify(reserva));
          
          var url = "http://localhost:3000/links/aceptar_reserva";

          this.preventDef(e);
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
                // console.log("Si se ejecutaaaaaaaaa")
                // let element = document.createElement("div");
                //   element.appendChild(document.createTextNode('Se ha guardado la reserva de la sala'));
                //   element.setAttribute("class", "alert alert-success");
                //   document.getElementById('alertCont').prepend(element);  
                // setTimeout(function(){ 
                //   $('#alertCont').remove();
                // }, 5000);
                            
                
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
                // document.getElementById("modal-button").innerHTML = `<button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>`;

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
                // this.signOut();
                window.location.href = '/ReservaExitosa';
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
            // document.getElementById("modal-button").innerHTML = `<button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>`;
            // alert("You have entered an invalid hour!"); // document.form1.email.focus();
          }
        }
        else{
          document.getElementById('no_reserva').click();
          document.getElementById("modal-content").innerHTML = `
          NO SE HA REALIZADO LA RESERVA.
          <br>
          POR FAVOR VUELVA A INTENTAR INGRESANDO UNA DIRECCIÓN DE CORREO VÁLIDA.`;
          document.getElementById("modal-button").innerHTML = `<button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>`;
          // alert("You have entered an invalid email address!"); // document.form1.email.focus();
        }
      },
      value(){
        var fechaInicio = document.getElementById('fechaIni').value;
        // var horaInicio = document.getElementById('horaIni').value;
        // let horaInicio = new Date(hora);
        let horaInicio = document.getElementById('horaIni').value;
        
        // horaInicio = horaInicio.setTime(horaInicio.getTime() + (1*60*60*1000));
        // console.log((horaInicio.getHours()-1));        
        
        var fecha1 = new Date(fechaInicio+' '+horaInicio);
        // var fecha = (d.getTime()-d.getMilliseconds())/1000;

        fecha1.setHours(fecha1.getHours() + 2);

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
        var fechaFin = document.getElementById('fechaIni').value;
        var horaFin = document.getElementById('horaFin').value;
        var fecha2 = new Date(fechaFin+' '+horaFin);
        console.log("Hora Fin: ", horaFin);
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
        var url = "http://localhost:3000/links/autenticar";
        
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
            window.location.href = '/formulario.html';
            //this.requestData(token);
        })
        .catch(function(err) {
            console.error(err);
        });
      },
      ValidateEmail(){
        // var mail = document.getElementById("emailPart").value;
        // console.log(mail);
        
        var inputvalue = document.getElementById("descripcion").value;
        var mailformat = /^\w+([\.-]?\w+)*@alumnos.uneatlantico.es/;
        var mailformat2 = /^\w+([\.-]?\w+)*@profesores.uneatlantico.es/;
        if(inputvalue.match(mailformat) ||inputvalue.match(mailformat2)){
            console.log("Correct!");
            
            // document.form1.email.focus();
            return true;
        }
        else{
            alert("You have entered an invalid email address!");
            // document.form1.email.focus();
            return false;
        }
      },
      token(){
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
              // console.log(token);
              sessionStorage.setItem("token",token);
              
              //this.requestData(token);
          })
          .catch(function(err) {
              console.error(err);
          });
      },
      signOut() {
        var auth2 = gapi.auth2.getAuthInstance();
        auth2.signOut().then(function () {
        console.log('User signed out.');
        });
      },
      deleteReserva(e){

        // let id = sessionStorage.getItem("id_reserva");
        // const myToken = sessionStorage.getItem("token");
        // console.log("my token GG ", myToken);

        // let id = this.getId()["id"];
        // let usr = this.getId()["usuario"];

        // let id = urlParams.get('id');
        // let usr = urlParams.get('usuario');

        // this.token();

        let all = location.search.split('id=')[1];
        let id = all.split('&')[0];
        let usr = all.split('usuario=')[1];

        // const myToken = sessionStorage.getItem("token");
        // console.log(myToken);

        console.log("id: ",id);
        console.log("usr: ",usr);
        let url2 = `http://localhost:3000/eliminar_reserva/${id}/${usr}`;// 

        this.preventDef(e);
        fetch(url2,{
          method: 'DELETE',            
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
            console.log("data ",data);
            if(data.message == "Reserva eliminada"){
            // alert("YA SE HA REALIZADO UNA RESERVA DIARIA");
            document.getElementById('no_reserva2').click();
          }
          // window.location.href = '/login.html';
          
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