const API = "provedores.php";

let proveedores = [];
const tabla = document.getElementById("tabla-proveedores");
const modal = document.getElementById("modal");
const formEditar = document.getElementById("form-editar");
const formAgregar = document.getElementById("form-agregar");

// Cargar datos desde el archivo JSON
fetch(`${API}?route=provedores`)
  .then((res) => res.json())
  .then((data) => {
    proveedores = data;
    renderTabla();
  });

function renderTabla() {
  tabla.innerHTML = "";
  proveedores.forEach((p, i) => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${p.folio}</td>
      <td>${p.nombre}</td>
      <td>${p.direccion}</td>
      <td>${p.telefono}</td>
      <td>${p.correo}</td>
      <td>
        <button onclick="abrirModal(${i})">Editar</button>
        <button onclick="eliminarProveedor(${i})">Eliminar</button>
      </td>
    `;
    tabla.appendChild(fila);
  });
}

function abrirModal(indice) {
  const proveedor = proveedores[indice];
  formEditar.indice.value = indice;
  formEditar.nombre.value = proveedor.nombre;
  formEditar.direccion.value = proveedor.direccion;
  formEditar.telefono.value = proveedor.telefono;
  formEditar.correo.value = proveedor.correo;
  modal.classList.remove("oculto");
}

function cerrarModal() {
  modal.classList.add("oculto");
}

formEditar.addEventListener("submit", (e) => {
  e.preventDefault();
  const i = formEditar.indice.value;

  const proveedorActualizado = {
    nombre: formEditar.nombre.value,
    direccion: formEditar.direccion.value,
    telefono: formEditar.telefono.value,
    correo: formEditar.correo.value,
    productos: proveedores[i].productos || [],
    indice: i,
  };

  fetch(`${API}?route=provedores`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(proveedorActualizado),
  })
    .then((res) => res.json())
    .then(() => {
      // Actualiza la copia local y vuelve a renderizar
      proveedores[i] = proveedorActualizado;
      renderTabla();
      cerrarModal();
    });
});
function eliminarProveedor(i) {
  if (confirm("¿Estás seguro de eliminar este proveedor?")) {
    fetch(`${API}?route=provedores`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ indice: i }),
    })
      .then((res) => res.json())
      .then(() => {
        proveedores.splice(i, 1); // Elimina localmente
        renderTabla();
      });
  }
}

formAgregar.addEventListener("submit", (e) => {
  e.preventDefault();

  const correoNuevo = formAgregar.correo.value.toLowerCase();

  const existeCorreo = proveedores.some(
    (p) => p.correo.toLowerCase() === correoNuevo
  );

  if (existeCorreo) {
    alert("Ya existe un proveedor con ese correo.");
    return;
  }

  const nuevoProveedor = {
    nombre: formAgregar.nombre.value,
    direccion: formAgregar.direccion.value,
    telefono: formAgregar.telefono.value,
    correo: correoNuevo,
  };

  fetch(`${API}?route=provedores`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(nuevoProveedor),
  })
    .then((res) => {
      if (!res.ok) return res.json().then((err) => Promise.reject(err));
      return res.json();
    })
    .then(() => {
      proveedores.push({ ...nuevoProveedor, productos: [] });
      renderTabla();
      formAgregar.reset();
    })
    .catch((err) => {
      alert(err.error || "Error al agregar proveedor");
    });
});

const formBuscar = document.getElementById("form-buscar");
const inputFolio = document.getElementById("input-folio");
const divResultado = document.getElementById("resultado-busqueda");

formBuscar.addEventListener("submit", (e) => {
  e.preventDefault();
  const folioBuscado = inputFolio.value.trim().toLowerCase();

  if (!folioBuscado) {
    renderTabla(); // Muestra todos si está vacío
    return;
  }

  const filtrados = proveedores.filter((p) =>
    p.folio.toLowerCase().includes(folioBuscado)
  );

  tabla.innerHTML = "";

  if (filtrados.length === 0) {
    tabla.innerHTML = `<tr><td colspan="6">No se encontró ningún proveedor con ese folio</td></tr>`;
    return;
  }

  filtrados.forEach((p, i) => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${p.folio}</td>
      <td>${p.nombre}</td>
      <td>${p.direccion}</td>
      <td>${p.telefono}</td>
      <td>${p.correo}</td>
      <td>
        <button onclick="abrirModal(${proveedores.indexOf(p)})">Editar</button>
        <button onclick="eliminarProveedor(${proveedores.indexOf(
          p
        )})">Eliminar</button>
      </td>
    `;
    tabla.appendChild(fila);
  });
});

document.getElementById("btn-limpiar").addEventListener("click", () => {
  inputFolio.value = "";
  renderTabla();
});
