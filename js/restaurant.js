
const btnGuardaCliente = document.querySelector('#guardar-cliente');

// estructura para guarda

let cliente = {
    mesa: '',
    hora: '',
    pedido: []
}

const categorias = {
    1: 'pizza',
    2: 'postres',
    3: 'juegos',
    4: 'comida',
    5: 'cafe',
    6: 'bebidas'
}

btnGuardaCliente.addEventListener('click', guardaCliente);

function guardaCliente() {
    const mesa = document.querySelector('#mesa').value;
    const hora = document.querySelector('#hora').value;

    const camposVacios = [mesa, hora].some(campo => campo === '')

    if (camposVacios) {
        // console.log('campo vacios');
        const existeAlerta = document.querySelector('.invalid-feedback');
        if (!existeAlerta) {
            const alerta = document.createElement('div');
            alerta.classList.add('text-center', 'text-danger');
            alerta.textContent = 'Los campos son obligatorios';
            document.querySelector('.modal-body form').appendChild(alerta);

            setTimeout(() => {
                alerta.remove();
            }, 3000)
        }
    } else {
        // console.log('campo llenos');

        cliente = { ...cliente, mesa, hora };
        console.log(cliente);

        const modalForm = document.querySelector('#formulario');
        const modal = bootstrap.Modal.getInstance(modalForm);
        modal.hide();

        mostrarSecciones();

        obtenerMenu();


    }

    function mostrarSecciones() {
        const secciones = document.querySelectorAll('.d-none');
        //console.log(secciones);

        secciones.forEach(seccion => seccion.classList.remove('d-none'));
    }

    function obtenerMenu() {
        const url = 'http://localhost:3000/menu';
        fetch(url)
            .then(respuesta => respuesta.json())
            .then(resultado => mostrarMenu(resultado))
            .catch(error => console.log(error))
    }

    function mostrarMenu(menu) {
        const contenido = document.querySelector('#menu .contenido');
        menu.forEach(pos => {
            const fila = document.createElement('div');
            fila.classList.add('row', 'borde-top')
            const nombre = document.createElement('div')
            nombre.textContent = pos.nombre;
            nombre.classList.add('col-md-4', 'py-3');

            const precio = document.createElement('div');
            precio.textContent = '$' + pos.precio;
            precio.classList.add('col-md-3', 'py-3');

            const categoria = document.createElement('div');
            categoria.textContent = categorias[pos.categoria];
            categoria.classList.add('col-md-3', 'py-3');

            const inputCantidad = document.createElement('input');
            inputCantidad.type = 'number';
            inputCantidad.min = 0;
            inputCantidad.value = 0;
            inputCantidad.id = `producto-${pos.id}`;
            // inputCantidad.classList.add('col-1');
            inputCantidad.onchange = function () {
                const cantidad = parseInt(inputCantidad.value)
                agreagarOrden({ ...pos, cantidad })
            }

            const agreagar = document.createElement('div');
            agreagar.classList.add('col-md-1', 'py-3', 'w-10');
            agreagar.appendChild(inputCantidad)

            fila.appendChild(nombre);
            fila.appendChild(precio);
            fila.appendChild(categoria);
            fila.appendChild(agreagar);

            contenido.appendChild(fila);
        })
    }
}

function agreagarOrden(producto) {
    let { pedido } = cliente;

    //console.log(producto);
    if (producto.cantidad > 0) {
        //validar que el producto exita
        if (pedido.some(item => item.id === producto.id)) {
            //haya producto
            const pedidoActualizado = pedido.map(i => {
                if (i.id === producto.id) {
                    i.cantidad = producto.cantidad;
                }
                return i
            })

            cliente.pedido = [...pedidoActualizado]

        } else {
            //caso  que no  exista el producto
            //agregamo el nuevo
            cliente.pedido = [...pedido, producto];
            console.log(cliente);
        }
    } else {
        //caso cantidad es igual 0
        const resultado = pedido.filter(item => item.id !== producto.id);
        cliente.pedido = resultado

    }
    limpiarHTML()

    if (cliente.pedido.length) {
        actualizarResume();
    } else {
        mensajePedidoVacio();
    }
}
function actualizarResume() {
    const contenido = document.querySelector('#resumen .contenido');
    const resumen = document.createElement('p');
    resumen.classList.add('col-md-4', 'card', 'shadow', 'py-5', 'px-3');

    //mostrar la mesa
    const mesa = document.createElement('p');
    mesa.textContent = 'mesa: ';
    mesa.classList.add('fw-bold');

    const mesaCliente = document.createElement('span');
    mesaCliente.textContent = cliente.mesa;

    mesa.appendChild(mesaCliente);

    resumen.appendChild(mesa);
    contenido.appendChild(resumen);

    //mostrar hora
    const hora = document.createElement('p');

    hora.textContent = 'hora: ';
    hora.classList.add('fw-bold');

    const horaCliente = document.createElement('span');
    horaCliente.textContent = cliente.hora;
    hora.appendChild(horaCliente);

    //mostrar los items del menu solicitado
    const heading = document.createElement('h3');
    heading.textContent = 'pedido: ';
    heading.classList.add('my-4');

    const grupo = document.createElement('ul');
    grupo.classList.add('list-group')
    const { pedido } = cliente;
    pedido.forEach(item => {
        const { nombre, cantidad, precio, id } = item;
        const lista = document.createElement('li');
        lista.classList.add('list-group-item')

        const nombreP = document.createElement('h4');
        nombreP.textContent = nombre;
        nombreP.classList.add('text-center', 'my-4');

        const cantidadP = document.createElement('p');
        cantidadP.classList.add('fw-bold');
        cantidadP.textContent = 'cantidad: ';

        const cantidadValor = document.createElement('span');
        cantidadValor.textContent = cantidad;

        const precioP = document.createElement('p');
        precioP.classList.add('fw-bold');
        precioP.textContent = 'Precio: ';

        const precioValor = document.createElement('span');
        precioValor.textContent = `$${precio}`;


        const subtotalP = document.createElement('p');
        subtotalP.classList.add('fw-bold');
        subtotalP.textContent = "subTotal: $ ";

        const subtotalValor = document.createElement('span');
        subtotalValor.textContent = calcularSubtotal(item);

        //boton eliminar 
        const btnEliminar = document.createElement('button');
        btnEliminar.classList.add('btn', 'btn-danger');
        btnEliminar.textContent = 'Eliminar pedido';
        btnEliminar.onclick = function () {
            eliminarProducto(id)
        };

        cantidadP.appendChild(cantidadValor);
        precioP.appendChild(precioValor);
        subtotalP.appendChild(subtotalValor);

        lista.appendChild(nombreP);
        lista.appendChild(cantidadP);
        lista.appendChild(precioP);
        lista.appendChild(subtotalP);
        lista.appendChild(btnEliminar);

        grupo.appendChild(lista)

    })



    resumen.appendChild(mesa);
    resumen.appendChild(hora);
    resumen.appendChild(heading);
    resumen.appendChild(grupo);

    contenido.appendChild(resumen);

    //mostrar la calculacion del precio

    formularioPropina();
}

function formularioPropina() {
    const contenido = document.querySelector('#resumen .contenido');
    const formulario = document.createElement('div');
    formulario.classList.add('cold-md-4', 'formulario');

    const heading = document.createElement('h3');
    heading.classList.add('my-4');
    heading.textContent = 'propina';

    //propina 5%
    const op5 = document.createElement('input');
    op5.type = 'radio';
    op5.name = 'propina';
    op5.value = '5';
    op5.classList.add('form-check-input');
    op5.onclick = calcularPropina;

    const labelop5 = document.createElement('label');
    labelop5.textContent = '5%';
    labelop5.classList.add('form-check-label');


    //propina 10$
    const op10 = document.createElement('input');
    op10.type = 'radio';
    op10.name = 'propina';
    op10.value = '10';
    op10.classList.add('form-check-input');
    op10.onclick = calcularPropina;

    const labelop10 = document.createElement('label');
    labelop10.textContent = '10%';
    labelop10.classList.add('form-check-label');


    formulario.appendChild(heading);
    formulario.appendChild(op5);
    formulario.appendChild(labelop5);
    formulario.appendChild(op10);
    formulario.appendChild(labelop10);


    contenido.appendChild(formulario);




    function calcularPropina() {
        console.log('calcular propina');
        const radioSeleccionado = document.querySelector('[name="propina"]:checked').value;

        const { pedido } = cliente;
        let subtotal = 0;
        pedido.forEach(i => {
            subtotal += i.cantidad * i.precio;
        })

        const divTotales = document.createElement('div');
        divTotales.classList.add('total-pagar');

        //propina
        const propina = (subtotal * parseInt(radioSeleccionado)) / 100;
        const iva = subtotal * 0.16;
        const total = propina + subtotal + iva;

        //subtotal
        const subtotalP = document.createElement('p');
        subtotalP.textContent = 'subtotal pedido: ';
        subtotalP.classList.add('fw-bold', 'fs-3', 'mt-5');

        const subtotalValor = document.createElement('span');
        subtotalValor.textContent = `$${subtotal}`,
            subtotalP.appendChild(subtotalValor);

        //iva
        const ivaP = document.createElement('p');
        ivaP.textContent = 'IVA 16%';

        const ivaValor = document.createElement('span');
        ivaP.appendChild(ivaValor);

        //propina

        const propinaP = document.createElement('p');
        propinaP.textContent = 'propina: ';

        const propinaValor = document.createElement('p');
        propinaValor.textContent = `$${propina}`;
        propinaP.appendChild(propinaValor);

        const totalP = document.createElement('p');
        totalP.textContent = 'total a pagar: ';

        const totalValor = document.createElement('span');
        totalValor.textContent = `$${total}`;
        totalP.appendChild(totalValor);

        const totalPagarDiv = document.querySelector('.total-pagar');
        if (totalPagarDiv) {
            totalPagarDiv.remove()
        };

        divTotales.appendChild(subtotalP);
        divTotales.appendChild(ivaP);
        divTotales.appendChild(propinaP);
        divTotales.appendChild(totalP)

        const formulario = document.querySelector('.formulario');
        formulario.appendChild(divTotales);

    }

    //producto pedido

}

function calcularSubtotal(p) {
    const { cantidad, precio } = p;
    return `${cantidad * precio}`;
}

function eliminarProducto(id) {
    const { pedido } = cliente;
    cliente.pedido = pedido.filter(i => i.id !== id);

    limpiarHTML();

    console.log(cliente.pedido.length > 0);
    if (cliente.pedido.length) {
        actualizarResume();
    } else {
        mensajePedidoVacio();
        //mensaje pedido
    }

    //ahora como eliminamos el producto debemos actualizar la cantidad a cero
    const productoEliminar = `#producto-${id}`;
    const inputEliminado = document.querySelector(productoEliminar);
    inputEliminado.value = 0;



}
function mensajePedidoVacio() {
    const contenido = document.querySelector('#resumen .contenido');
    const texto = document.createElement('p');
    texto.classList.add('text-center');
    texto.textContent = 'agrega producto al pedido';
    contenido.appendChild(texto);
}

function limpiarHTML() {
    const contenido = document.querySelector('#resumen .contenido')
    while (contenido.firstChild) {
        contenido.removeChild(contenido.firstChild)
    }
}