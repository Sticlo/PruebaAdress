document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('tableBody');
    const searchInput = document.getElementById('searchInput');
    const formAdquisicion = document.getElementById('form-adquisicion');

    // Load and display data on page load
    function loadDataAndDisplay() {
        fetch('/api/adquisiciones')
            .then(response => response.json())
            .then(adquisiciones => {
                displayData(adquisiciones);
            })
            .catch(error => console.error('Error fetching adquisiciones:', error));
    }

    loadDataAndDisplay();

    // Event listener for search input
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase();
        fetch('/api/adquisiciones')
            .then(response => response.json())
            .then(adquisiciones => {
                const filteredAdquisiciones = adquisiciones.filter(adq => {
                    return Object.values(adq).some(value =>
                        value.toString().toLowerCase().includes(query)
                    );
                });
                displayData(filteredAdquisiciones);
            })
            .catch(error => console.error('Error fetching adquisiciones:', error));
    });

    // Event listener for form submission to register new adquisicion
    formAdquisicion.addEventListener('submit', event => {
        event.preventDefault(); // Prevent default form submission
        
        // Collect form data using FormData constructor directly
        const formData = new FormData(formAdquisicion);
    
        // Convert formData to a plain object
        const adquisicionData = Object.fromEntries(formData);
    
        // Send data to server to register new adquisicion
        fetch('/api/adquisiciones', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(adquisicionData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to register adquisicion');
            }
            return response.json();
        })
        .then(newAdquisicion => {
            // Append new adquisicion to table
            appendAdquisicionToTable(newAdquisicion);
            // Reset form
            formAdquisicion.reset();
            // Show success message to user
            alert('Adquisición registrada exitosamente.');
        })
        .catch(error => {
            console.error('Error registering adquisicion:', error);
            // Show error message to user
            alert('Error al registrar la adquisición. Por favor, inténtalo de nuevo más tarde.');
        });
    });
    

    function displayData(adquisiciones) {
        tableBody.innerHTML = '';
    
        adquisiciones.forEach(adquisicion => {
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
                <td class="actions">
                    <button class="modificar" data-id="${adquisicion.id}">Modificar</button>
                    <button class="desactivar" data-id="${adquisicion.id}">Desactivar</button>
                    <button class="historial" data-id="${adquisicion.id}">Historial</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    
        // Add event listeners for action buttons
        const modifyButtons = document.querySelectorAll('.modificar');
        const deactivateButtons = document.querySelectorAll('.desactivar');
        const historyButtons = document.querySelectorAll('.historial');
    
        modifyButtons.forEach(button => {
            button.addEventListener('click', () => {
                const id = button.getAttribute('data-id');
                modifyAdquisicion(id);
            });
        });
    
        deactivateButtons.forEach(button => {
            button.addEventListener('click', () => {
                const id = button.getAttribute('data-id');
                deactivateAdquisicion(id);
            });
        });
    
        historyButtons.forEach(button => {
            button.addEventListener('click', () => {
                const id = button.getAttribute('data-id');
                showHistory(id);
            });
        });
    }
    

    // Function to append a new adquisicion to the table
    function appendAdquisicionToTable(adquisicion) {
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
            <td class="actions">
                <button class="modificar" data-id="${adquisicion.id}">Modificar</button>
                <button class="desactivar" data-id="${adquisicion.id}">Desactivar</button>
                <button class="historial" data-id="${adquisicion.id}">Historial</button>
            </td>
        `;
        tableBody.appendChild(row);
    }

    // Add event listeners for action buttons
    tableBody.addEventListener('click', event => {
        const target = event.target;
        if (target.classList.contains('modificar')) {
            const id = target.getAttribute('data-id');
            modifyAdquisicion(id);
        } else if (target.classList.contains('desactivar')) {
            const id = target.getAttribute('data-id');
            deactivateAdquisicion(id);
        } else if (target.classList.contains('historial')) {
            const id = target.getAttribute('data-id');
            showHistory(id);
        }
    });

    function modifyAdquisicion(id) {
        window.location.href = `modificar.html?id=${id}`;
    }

    function deactivateAdquisicion(id) {
        // Confirmar con el usuario antes de eliminar el registro
        if (confirm('¿Estás seguro de que deseas desactivar esta adquisición?')) {
            fetch(`/api/adquisiciones/${id}`, {
                method: 'DELETE'
            })
            .then(response => {
                if (response.ok) {
                    // Si la eliminación fue exitosa, recargar los datos
                    loadDataAndDisplay();
                } else {
                    console.error('Error deleting adquisicion:', response.statusText);
                }
            })
            .catch(error => console.error('Error deleting adquisicion:', error));
        }
    }
    

    function showHistory(id) {
        window.location.href = `/historial.html?id=${id}`;
        console.log(`Mostrar historial de adquisición con ID: ${id}`);
    }
});
