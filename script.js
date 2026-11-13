
// ==========================================
// DAVANTEDENT - GESTIÓN DE CITAS
// ==========================================

// Clase que representa una cita dental
class Cita {
    constructor(id, nombre, apellidos, dni, telefono,
                fechaNacimiento, fechaCita, observaciones) {
        this.id = id;
        this.nombre = nombre;
        this.apellidos = apellidos;
        this.dni = dni;
        this.telefono = telefono;
        this.fechaNacimiento = fechaNacimiento;
        this.fechaCita = fechaCita;
        this.observaciones = observaciones;
    }
}

// Elementos del HTML
const formulario = document.getElementById("formCita");
const cuerpoTabla = document.getElementById("cuerpoTabla");
const btnCancelar = document.getElementById("btnCancelar");
const btnGuardar = document.getElementById("btnGuardar");
const tituloFormulario = document.getElementById("tituloFormulario");

// Array donde se guardan las citas
let citas = [];

// ==========================================
// ALMACENAMIENTO EN COOKIES
// ==========================================

// Guardar las citas en una cookie
function guardarCookies() {
    const datos = encodeURIComponent(JSON.stringify(citas));

    document.cookie =
        "citasDavanteDent=" + datos +
        "; max-age=2592000; path=/; SameSite=Lax";
}

// Recuperar las citas de las cookies
function cargarCookies() {
    const cookies = document.cookie.split("; ");

    const cookieCitas = cookies.find(cookie =>
        cookie.startsWith("citasDavanteDent=")
    );

    if (cookieCitas) {
        try {
            const valor = cookieCitas.substring(
                "citasDavanteDent=".length
            );

            const datos = JSON.parse(
                decodeURIComponent(valor)
            );

            citas = Array.isArray(datos) ? datos : [];
        } catch (error) {
            console.error("Error al recuperar las citas:", error);
            citas = [];
        }
    }
}

// ==========================================
// VALIDACIÓN DEL FORMULARIO
// ==========================================

// Mostrar un error en un campo
function mostrarError(campo, mensaje) {
    const input = document.getElementById(campo);
    const error = document.getElementById(
        "error" + campo.charAt(0).toUpperCase() + campo.slice(1)
    );

    input.classList.add("invalido");
    input.classList.remove("valido");

    // Algunos campos tienen identificadores de error diferentes
    if (error) {
        error.textContent = mensaje;
    }
}

// Limpiar errores anteriores
function limpiarErrores() {
    document.querySelectorAll(".error").forEach(elemento => {
        elemento.textContent = "";
    });

    document.querySelectorAll(".invalido, .valido").forEach(elemento => {
        elemento.classList.remove("invalido", "valido");
    });
}

// Validar todos los campos
function validarFormulario() {
    limpiarErrores();

    let correcto = true;

    const nombre = document.getElementById("nombre").value.trim();
    const apellidos = document.getElementById("apellidos").value.trim();
    const dni = document.getElementById("dni").value.trim().toUpperCase();
    const telefono = document.getElementById("telefono").value.trim();
    const fechaNacimiento = document.getElementById("fechaNacimiento").value;
    const fechaCita = document.getElementById("fechaCita").value;
    const observaciones = document.getElementById("observaciones").value.trim();

    // Validación del nombre
    if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s'-]{2,60}$/.test(nombre)) {
        mostrarError("nombre", "Introduce un nombre válido.");
        correcto = false;
    }

    // Validación de apellidos
    if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s'-]{2,100}$/.test(apellidos)) {
        mostrarError("apellidos", "Introduce unos apellidos válidos.");
        correcto = false;
    }

    // Validación del DNI español
    const patronDni = /^[0-9]{8}[A-Z]$/;
    const letrasDni = "TRWAGMYFPDXBNJZSQVHLCKE";

    if (!patronDni.test(dni) ||
        letrasDni[Number(dni.substring(0, 8)) % 23] !== dni[8]) {
        mostrarError("dni", "Introduce un DNI válido (ejemplo: 12345678Z).");
        correcto = false;
    }

    // Validación del teléfono
    if (!/^[6789][0-9]{8}$/.test(telefono)) {
        mostrarError("telefono", "El teléfono debe tener 9 números válidos.");
        correcto = false;
    }

    // Validación de la fecha de nacimiento
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento + "T00:00:00");

    if (!fechaNacimiento ||
        Number.isNaN(nacimiento.getTime()) ||
        nacimiento > hoy ||
        nacimiento.getFullYear() < 1900) {
        mostrarError("fechaNacimiento", "Introduce una fecha de nacimiento válida.");
        correcto = false;
    }

    // Validación de la fecha de la cita
    const fechaSeleccionada = new Date(fechaCita);

    if (!fechaCita ||
        Number.isNaN(fechaSeleccionada.getTime()) ||
        fechaSeleccionada <= hoy) {
        mostrarError("fechaCita", "La cita debe tener una fecha futura.");
        correcto = false;
    }

    // Validación de observaciones
    if (observaciones.length > 500) {
        mostrarError("observaciones", "Máximo 500 caracteres.");
        correcto = false;
    }

    return correcto;
}

// ==========================================
// MOSTRAR CITAS EN LA TABLA
// ==========================================

function mostrarCitas() {
    cuerpoTabla.innerHTML = "";

    // Mostrar mensaje cuando no existen citas
    if (citas.length === 0) {
        const fila = document.createElement("tr");
        const celda = document.createElement("td");

        celda.colSpan = 9;
        celda.textContent = "dato vacío";

        fila.appendChild(celda);
        cuerpoTabla.appendChild(fila);
        return;
    }

    // Crear una fila para cada cita
    citas.forEach((cita, indice) => {
        const fila = document.createElement("tr");

        // Guardar identificador oculto en la fila
        fila.dataset.id = cita.id;

        const datos = [
            indice + 1,
            formatearFecha(cita.fechaCita),
            cita.nombre,
            cita.apellidos,
            cita.dni,
            cita.telefono,
            formatearFecha(cita.fechaNacimiento),
            cita.observaciones
        ];

        datos.forEach(dato => {
            const celda = document.createElement("td");
            celda.textContent = dato;
            fila.appendChild(celda);
        });

        // Columna de acciones
        const celdaAcciones = document.createElement("td");

        const botonEditar = document.createElement("button");
        botonEditar.textContent = "Editar";
        botonEditar.className = "btn-editar";
        botonEditar.type = "button";
        botonEditar.addEventListener("click", () => {
            editarCita(cita.id);
        });

        const botonEliminar = document.createElement("button");
        botonEliminar.textContent = "Eliminar";
        botonEliminar.className = "btn-eliminar";
        botonEliminar.type = "button";
        botonEliminar.addEventListener("click", () => {
            eliminarCita(cita.id);
        });

        celdaAcciones.appendChild(botonEditar);
        celdaAcciones.appendChild(botonEliminar);

        fila.appendChild(celdaAcciones);
        cuerpoTabla.appendChild(fila);
    });
}

// Formatear fechas para mostrarlas en la tabla
function formatearFecha(fecha) {
    if (!fecha) return "";

    const partes = fecha.split("T");
    const fechaPartes = partes[0].split("-");

    const fechaFormateada =
        fechaPartes[2] + "/" +
        fechaPartes[1] + "/" +
        fechaPartes[0];

    if (partes.length > 1) {
        return fechaFormateada + " " + partes[1];
    }

    return fechaFormateada;
}

// ==========================================
// CREAR Y MODIFICAR CITAS
// ==========================================

formulario.addEventListener("submit", function(evento) {
    evento.preventDefault();

    // No guardar si hay errores
    if (!validarFormulario()) {
        return;
    }

    const idExistente = document.getElementById("idCita").value;

    // Crear identificador único basado en el instante de grabación
    let id = idExistente;

    if (!id) {
        id = String(Date.now());

        // Evitar colisiones si se crean dos citas muy rápido
        while (citas.some(cita => String(cita.id) === id)) {
            id = String(Number(id) + 1);
        }
    }

    const nuevaCita = new Cita(
        id,
        document.getElementById("nombre").value.trim(),
        document.getElementById("apellidos").value.trim(),
        document.getElementById("dni").value.trim().toUpperCase(),
        document.getElementById("telefono").value.trim(),
        document.getElementById("fechaNacimiento").value,
        document.getElementById("fechaCita").value,
        document.getElementById("observaciones").value.trim()
    );

    if (idExistente) {
        // Modificar una cita existente
        const indice = citas.findIndex(
            cita => String(cita.id) === idExistente
        );

        if (indice === -1) {
            alert("No se ha encontrado la cita.");
            return;
        }

        citas[indice] = nuevaCita;
    } else {
        // Añadir una nueva cita
        citas.push(nuevaCita);
    }

    guardarCookies();
    mostrarCitas();
    limpiarFormulario();
});

// ==========================================
// EDITAR UNA CITA
// ==========================================

function editarCita(id) {
    // Recuperar los datos desde las cookies,
    // no desde la tabla HTML
    cargarCookies();

    const cita = citas.find(
        elemento => String(elemento.id) === String(id)
    );

    if (!cita) {
        alert("No se ha encontrado la cita.");
        return;
    }

    document.getElementById("idCita").value = cita.id;
    document.getElementById("nombre").value = cita.nombre;
    document.getElementById("apellidos").value = cita.apellidos;
    document.getElementById("dni").value = cita.dni;
    document.getElementById("telefono").value = cita.telefono;
    document.getElementById("fechaNacimiento").value = cita.fechaNacimiento;
    document.getElementById("fechaCita").value = cita.fechaCita;
    document.getElementById("observaciones").value = cita.observaciones;

    limpiarErrores();

    tituloFormulario.textContent = "Modificar cita";
    btnGuardar.textContent = "Guardar cambios";

    // Volver al formulario
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

// ==========================================
// ELIMINAR UNA CITA
// ==========================================

function eliminarCita(id) {
    const confirmar = confirm(
        "¿Estás seguro de que deseas eliminar esta cita?"
    );

    if (!confirmar) {
        return;
    }

    citas = citas.filter(
        cita => String(cita.id) !== String(id)
    );

    guardarCookies();
    mostrarCitas();
    limpiarFormulario();
}

// ==========================================
// LIMPIAR FORMULARIO
// ==========================================

function limpiarFormulario() {
    formulario.reset();

    document.getElementById("idCita").value = "";

    tituloFormulario.textContent = "Nueva cita";
    btnGuardar.textContent = "Guardar cita";

    limpiarErrores();
}

// Botón cancelar
btnCancelar.addEventListener("click", limpiarFormulario);

// ==========================================
// INICIAR LA APLICACIÓN
// ==========================================

document.addEventListener("DOMContentLoaded", function() {
    cargarCookies();
    mostrarCitas();
});
