let DB;

// Selectores de la interfaz

const form = document.querySelector('form'),
    nombreMascota = document.querySelector('#mascota'), 
    nombreCliente = document.querySelector('#cliente'),
    telefono = document.querySelector('#telefono'), 
    fecha = document.querySelector('#fecha'),
    hora = document.querySelector('#hora'),
    sintomas = document.querySelector('#sintomas'),
    citas = document.querySelector('#citas'), 
    headingAdministra = document.querySelector('#administra');
    
// Esperar por el DOM ready

document.addEventListener('DOMContentLoaded', ()=>{
    // crear la base de datos
    let crearDB = window.indexedDB.open('citas', 1);
    // Si hay un error enviarlo a la consola
    crearDB.onerror = function(){
        console.log('Hubo un error');
    }
    // Si todo esta bien mostrar en consola y asignar la bd
    crearDB.onsuccess = function(){
        console.log('todo listo');
        // Asignar la BD
        DB = crearDB.result;
        //console.log(DB);
        mostrarCitas();
    }
    // Este metodo solo corre una vez y es ideal para crear el schema de la BD
    crearDB.onupgradeneeded = function(e){
        // el evento es la misma base de datos
        let db = e.target.result;
        //console.log(db);
        // definir el objectstore, toma 2 parametros el nombre de la bd y segundo las opciones
        // keyPath es el indice de la BD
        let objectStore = db.createObjectStore('citas', {keyPath: 'key', autoIncrement: true, } )
        // Crear los indices y campos de la BD createIndex son 3 parametros: nombre, keyPath y opciones
        
        objectStore.createIndex('mascota', 'mascota', {unique: false});
        objectStore.createIndex('cliente', 'cliente', {unique: false});
        objectStore.createIndex('telefono', 'telefono', {unique: false});
        objectStore.createIndex('fecha', 'fecha', {unique: false});
        objectStore.createIndex('hora', 'hora', {unique: false});
        objectStore.createIndex('sintoma', 'sintoma', {unique: false});
    }
    
    form.addEventListener('submit', agregarDatos);

    function agregarDatos(e){
        e.preventDefault();
        const nuevaCita = {
            mascota: nombreMascota.value,
            cliente: nombreCliente.value,
            telefono: telefono.value,
            fecha: fecha.value,
            hora: hora.value,
            sintomas: sintomas.value
        };
        //console.log(nuevaCita)
        // en indexDB se utilizan las transacciones
        let transaction = DB.transaction(['citas'], 'readwrite');
        let objectStore = transaction.objectStore('citas');
        //console.log(objectStore)

        let peticion = objectStore.add(nuevaCita)
        //console.log(peticion)
        
        peticion.onsuccess =  () =>{
            form.reset();
        }
        transaction.oncomplete = ()=> {
            console.log('Cita agregada')
            mostrarCitas()
        }

        transaction.onerror = ()=>{
            console.log('HUbo un error')
            
        }
    }
    function mostrarCitas(){
        //limpiar // esto retorna una peticion
        while(citas.firstChild){
            citas.removeChild(citas.firstChild);
        };
        let objectStore = DB.transaction('citas').objectStore('citas');
        
        objectStore.openCursor().onsuccess = function (e){
            // cursor se va a indicar en el registro indicado para acceder a los datos

            let cursor = e.target.result
            //console.log(cursor)
            if (cursor){
                let citaHTML = document.createElement('li');
                citaHTML.setAttribute('data-cita-id', cursor.value.key);
                citaHTML.classList.add('list-group-item');

                citaHTML.innerHTML = `
                <p class = "font-weight-bold">Mascota: <span class="font-weight-normal">${cursor.value.mascota}</span></p>
                <p class = "font-weight-bold">Cliente: <span class="font-weight-normal">${cursor.value.cliente}</span></p>
                <p class = "font-weight-bold">Telefono: <span class="font-weight-normal">${cursor.value.telefono}</span></p>
                <p class = "font-weight-bold">Fecha: <span class="font-weight-normal">${cursor.value.fecha}</span></p>
                <p class = "font-weight-bold">Hora: <span class="font-weight-normal">${cursor.value.hora}</span></p>
                <p class = "font-weight-bold">Sintomas: <span class="font-weight-normal">${cursor.value.sintomas}</span></p>
                `;
            // crear boton borrar
            const botonBorrar = document.createElement('button');
            botonBorrar.classList.add('borrar', 'btn', 'btn-danger');
            botonBorrar.innerHTML = `<span aria-hidden="true">X</span> Borrar`;
            botonBorrar.onclick = borrarCita;
            citaHTML.appendChild(botonBorrar)

            // append en el padre
            citas.appendChild(citaHTML);

            cursor.continue();
            } else{
                if(!citas.firstChild){
                // cuando no hay registros
                headingAdministra.textContent='Agregar citas para comenzar'
                let listado = document.createElement('p');
                listado.classList.add('text-center');
                listado.textContent = 'No hay registros';
                headingAdministra.appendChild(listado);
                } else{
                    headingAdministra.textContent='Administra tus citas'
                }
            }
        }
    }
    function borrarCita(e){
       let citaID = Number( e.target.parentElement.getAttribute('data-cita-id'));
        // en indexDB se utilizan las transacciones
        let transaction = DB.transaction(['citas'], 'readwrite');
        let objectStore = transaction.objectStore('citas');
        //console.log(objectStore)

        let peticion = objectStore.delete(citaID);
        transaction.oncomplete = () => {
            e.target.parentElement.parentElement.removeChild(e.target.parentElement);
            console.log(`Se elimino la cita con el id ${citaID}`);
            if(!citas.firstChild){
                // cuando no hay registros
                headingAdministra.textContent='Agregar citas para comenzar'
                let listado = document.createElement('p');
                listado.classList.add('text-center');
                listado.textContent = 'No hay registros';
                headingAdministra.appendChild(listado);
                } else{
                    headingAdministra.textContent='Administra tus citas'
                }
        }
    }
})

