document.addEventListener('DOMContentLoaded', () => {
    const formModificar = document.getElementById('form-modificar');

    // Obtener el ID de la adquisición de los parámetros de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    // Verifica que el ID se haya obtenido correctamente
    if (!id) {
        console.error('ID de adquisición no proporcionado en la URL');
        alert('ID de adquisición no proporcionado en la URL');
        return;
    }

    // Función para cargar datos de la adquisición
    function cargarDatosAdquisicion(id) {
        fetch(`/api/adquisiciones/${id}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error al obtener los datos de la adquisición: ${response.statusText}`);
                }
                return response.json();
            })
            .then(adquisicion => {
                // Asegúrate de que los datos existen antes de asignarlos a los inputs
                if (!adquisicion) {
                    throw new Error('No se encontraron datos para esta adquisición');
                }
                document.getElementById('presupuesto').value = adquisicion.presupuesto || '';
                document.getElementById('unidad').value = adquisicion.unidad || '';
                document.getElementById('tipo').value = adquisicion.tipo || '';
                document.getElementById('cantidad').value = adquisicion.cantidad || '';
                document.getElementById('valor-unitario').value = adquisicion['valor-unitario'] || '';
                document.getElementById('fecha').value = adquisicion.fecha || '';
                document.getElementById('proveedor').value = adquisicion.proveedor || '';
                document.getElementById('documentacion').value = adquisicion.documentacion || '';
            })
            .catch(error => {
                console.error('Error fetching adquisicion:', error);
                alert(`Error al cargar los datos de la adquisición: ${error.message}`);
            });
    }

    // Función para cargar el historial de adquisiciones
    function cargarHistorial() {
        fetch('/api/adquisiciones')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error al cargar el historial de adquisiciones: ${response.statusText}`);
                }
                return response.json();
            })
            .then(adquisiciones => {
                // Limpiar el cuerpo de la tabla
                const historialBody = document.getElementById('historialBody');
                historialBody.innerHTML = '';

                // Recorrer todas las adquisiciones y agregarlas a la tabla
                adquisiciones.forEach(adquisicion => {
                    // Crear una fila para la adquisición actual
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${adquisicion.presupuesto}</td>
                        <td>${adquisicion.unidad}</td>
                        <td>${adquisicion.tipo}</td>
                        <td>${adquisicion.cantidad}</td>
                        <td>${adquisicion['valor-unitario']}</td>
                        <td>${adquisicion.cantidad * adquisicion['valor-unitario']}</td>
                        <td>${adquisicion.fecha}</td>
                        <td>${adquisicion.proveedor}</td>
                        <td>${adquisicion.documentacion}</td>
                    `;
                    historialBody.appendChild(row);

                    // Verificar si hay historial de cambios para esta adquisición
                    if (adquisicion.historial && adquisicion.historial.length > 0) {
                        // Crear una celda extra para mostrar el historial de cambios
                        const historialCell = document.createElement('td');
                        historialCell.setAttribute('colspan', '9');

                        // Construir el historial de cambios como una lista dentro de la celda
                        const cambiosList = document.createElement('ul');
                        adquisicion.historial.forEach(cambio => {
                            // Crear un elemento de lista para cada cambio
                            const cambioItem = document.createElement('li');
                            cambioItem.innerHTML = `<p><strong>Fecha:</strong> ${cambio.fecha}</p>`;
                            // Iterar sobre los cambios y agregarlos al elemento de lista
                            for (const key in cambio.cambios) {
                                if (Object.hasOwnProperty.call(cambio.cambios, key)) {
                                    cambioItem.innerHTML += `<p><strong>${key}:</strong> ${cambio.cambios[key]}</p>`;
                                }
                            }
                            cambiosList.appendChild(cambioItem);
                        });

                        // Agregar la lista de cambios a la celda de historial
                        historialCell.appendChild(cambiosList);

                        // Crear una nueva fila para el historial y agregar la celda a esta fila
                        const historialRow = document.createElement('tr');
                        historialRow.appendChild(historialCell);

                        // Insertar la fila del historial después de la fila actual de la adquisición
                        row.parentNode.insertBefore(historialRow, row.nextSibling);
                    }
                });
            })
            .catch(error => {
                console.error('Error fetching historial:', error);
                alert(`Error al cargar el historial de adquisiciones: ${error.message}`);
            });
    }

    // Cargar los datos de la adquisición cuando la página se carga
    cargarDatosAdquisicion(id);

    // Event listener para el formulario de modificación
    formModificar.addEventListener('submit', event => {
        event.preventDefault();

        // Recolectar los datos del formulario
        const formData = new FormData(event.target);

        // Convertir los datos a un objeto
        const adquisicionData = {};
        formData.forEach((value, key) => {
            adquisicionData[key] = value;
        });

        // Enviar los datos modificados al servidor
        fetch(`/api/adquisiciones/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(adquisicionData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to modify adquisicion: ${response.statusText}`);
            }
            return response.json();
        })
        .then(() => {
            // Redirigir al usuario a la página principal después de modificar la adquisición
            window.location.href = '/index.html';
        })
        .catch(error => {
            console.error('Error modifying adquisicion:', error);
            alert(`Error al modificar la adquisición: ${error.message}`);
        });
    });
});
