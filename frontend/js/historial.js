// historial.js

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

// Función para volver al index.html
function volverIndex() {
    // Redirigir al usuario a la página index.html
    window.location.href = `/index.html`;
}

// Cargar el historial al cargar la página
window.onload = cargarHistorial;
