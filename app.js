const API = "index.php";
const APIPROVEDORES = "provedores.php";

const tabla = document.querySelector("#tabla-productos tbody");
const folioFiltro = document.querySelector("#folio_filtro");

const formBuscar = document.querySelector("#form-buscar-folio");

const btnLimpiar = document.querySelector("#btn-limpiar");

const modalEditar = document.querySelector("#modal-editar");
const formEditar = document.querySelector("#form-editar");
const btnCerrarModal = document.querySelector("#cerrar-modal");

window.addEventListener("load", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const folio = urlParams.get("folio");

  if (folio) {
    folioFiltro.textContent = `Filtrando por folio: ${folio}`;
  }
});

const formCrear = document.querySelector("#form-crear");

function cargarProductos() {
  fetch(`${API}?route=productos`)
    .then((res) => res.json())
    .then((productos) => {
      tabla.innerHTML = "";
      productos.forEach((p) => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
          <td>${p.folio}</td>
          <td>${p.nombre}</td>
          <td>$${p.precio}</td>
          <td>${p.stock}</td>
          <td>${p.provedor}</td>
          <td>
            <button onclick="eliminarProducto('${p.folio}')">Eliminar</button>
            <button onclick="editarProducto('${p.folio}')">Editar</button>
          </td>
        `;
        tabla.appendChild(fila);
      });
    });
}

formCrear.addEventListener("submit", (e) => {
  e.preventDefault();
  const datos = Object.fromEntries(new FormData(formCrear));
  datos.precio = Number(datos.precio);
  datos.stock = Number(datos.stock);

  fetch(`${API}?route=producto`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  })
    .then((res) => res.json())
    .then(() => {
      formCrear.reset();
      cargarProductos();
    });
});

formBuscar.addEventListener("submit", (e) => {
  e.preventDefault();
  const folio = formBuscar.folio.value.trim();
  if (!folio) return;

  fetch(`${API}?route=producto&folio=${encodeURIComponent(folio)}`)
    .then((res) => res.json())
    .then((producto) => {
      tabla.innerHTML = "";
      if (producto.error) {
        tabla.innerHTML = `<tr><td colspan="5">${producto.error}</td></tr>`;
      } else {
        const fila = document.createElement("tr");
        fila.innerHTML = `
          <td>${producto.folio}</td>
          <td>${producto.nombre}</td>
          <td>$${producto.precio}</td>
          <td>${producto.stock}</td>
          <td>
            <button onclick="eliminarProducto('${producto.folio}')">Eliminar</button>
            <button onclick="editarProducto('${producto.folio}')">Editar</button>
          </td>
          
        `;
        tabla.appendChild(fila);
      }
    });
});

btnLimpiar.addEventListener("click", () => {
  formBuscar.folio.value = "";
  cargarProductos();
});

function eliminarProducto(folio) {
  fetch(`${API}?route=producto`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folio }),
  })
    .then((res) => res.json())
    .then(() => cargarProductos());
}

// Mostrar la modal con los datos cargados
function editarProducto(folio) {
  fetch(`${API}?route=producto&folio=${encodeURIComponent(folio)}`)
    .then((res) => res.json())
    .then((producto) => {
      if (producto.error) {
        alert(producto.error);
        return;
      }

      formEditar.folio.value = producto.folio;
      formEditar.nombre.value = producto.nombre;
      formEditar.precio.value = producto.precio;
      formEditar.stock.value = producto.stock;

      cargarProvedoresEnEditar(producto.provedor); // <== Aquí cargamos y seleccionamos el proveedor

      modalEditar.classList.add("activo");
    });
}

// Enviar el formulario de edición
formEditar.addEventListener("submit", (e) => {
  e.preventDefault();
  const datos = Object.fromEntries(new FormData(formEditar));
  datos.precio = Number(datos.precio);
  datos.stock = Number(datos.stock);

  fetch(`${API}?route=producto`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  })
    .then((res) => res.json())
    .then(() => {
      modalEditar.classList.remove("activo");
      cargarProductos();
    });
});

btnCerrarModal.addEventListener("click", () => {
  modalEditar.classList.remove("activo");
});

function cargarProvedoresEnEditar(proveedorSeleccionado = "") {
  fetch(`${API}?route=provedores`)
    .then((res) => res.json())
    .then((provedores) => {
      const select = document.querySelector("#select-provedores-editar");
      select.innerHTML = '<option value="">Seleccione un proveedor</option>';
      provedores.forEach((p) => {
        const option = document.createElement("option");
        option.value = p.nombre; // O p.correo si quieres usar el correo como identificador único
        option.textContent = p.nombre;
        if (p.nombre === proveedorSeleccionado) option.selected = true;
        select.appendChild(option);
      });
    });
}

function cargarProvedoresEnEditar(proveedorSeleccionado = "") {
  fetch(`${API}?route=provedores`)
    .then((res) => res.json())
    .then((provedores) => {
      const select = document.querySelector("#select-provedores-editar");
      select.innerHTML = '<option value="">Seleccione un proveedor</option>';
      provedores.forEach((p) => {
        const option = document.createElement("option");
        option.value = p;
        option.textContent = p;
        if (p === proveedorSeleccionado) option.selected = true;
        select.appendChild(option);
      });
    });
}

function cargarProvedoresEnCrear() {
  fetch(`${APIPROVEDORES}/src/provedores/provedores.php/?route=provedores`)
    .then((res) => res.json())
    .then((provedores) => {
      const select = document.querySelector("#select-provedores");
      select.innerHTML = '<option value="">Seleccione un proveedor</option>';
      provedores.forEach((p) => {
        const option = document.createElement("option");
        option.value = p.nombre; // Aquí accedemos a la propiedad correcta
        option.textContent = p.nombre;
        select.appendChild(option);
      });
    });
}

// Llamamos a la función al cargar la página
window.addEventListener("load", () => {
  cargarProvedoresEnCrear(); // Cargar proveedores en el formulario de crear
});

formEditar.addEventListener("submit", (e) => {
  e.preventDefault();
  const datos = Object.fromEntries(new FormData(formEditar));
  datos.precio = Number(datos.precio);
  datos.stock = Number(datos.stock);

  fetch(`${API}?route=producto`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  })
    .then((res) => res.json())
    .then(() => {
      modalEditar.classList.remove("activo");
      cargarProductos();
    });
});

function editarProducto(folio) {
  fetch(`${API}?route=producto&folio=${encodeURIComponent(folio)}`)
    .then((res) => res.json())
    .then((producto) => {
      if (producto.error) {
        alert(producto.error);
        return;
      }

      formEditar.folio.value = producto.folio;
      formEditar.nombre.value = producto.nombre;
      formEditar.precio.value = producto.precio;
      formEditar.stock.value = producto.stock;

      cargarProvedoresEnEditar(producto.provedor); // Aquí cargamos y seleccionamos el proveedor

      modalEditar.classList.add("activo");
    });
}

btnCerrarModal.addEventListener("click", () => {
  modalEditar.classList.remove("activo");
});

// Inicial
cargarProductos();
