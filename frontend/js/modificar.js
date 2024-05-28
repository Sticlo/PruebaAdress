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
    // Función para guardar cambios en la adquisición
// Función para guardar cambios en la adquisición
function guardarCambios(adquisicionId, cambios) {
    fetch(`/api/adquisiciones/${adquisicionId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(cambios), // Enviar solo los cambios en lugar de todos los datos del formulario
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Error al guardar los cambios: ${response.statusText}`);
        }
        return response.json();
    })
    .then(adquisicion => {
        // Cargar el historial actualizado
        cargarHistorial();
        console.log('Cambios guardados:', adquisicion);
            // Actualizar los datos principales de la adquisición en la página
        cargarDatosAdquisicion(id);

    })
    .catch(error => {
        console.error('Error al guardar los cambios:', error);
        alert(`Error al guardar los cambios: ${error.message}`);
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
