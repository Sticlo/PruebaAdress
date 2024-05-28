const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3001; // Usar el puerto proporcionado por el entorno o 3001 como predeterminado
const dataFile = path.join(__dirname, 'adquisiciones.json');

app.use(bodyParser.json());
app.use(cors()); // Habilitar CORS para permitir solicitudes desde el frontend
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Load data from file
async function loadData() {
    try {
        // Verificar si el archivo existe
        const fileExists = await fs.access(dataFile).then(() => true).catch(() => false);
        if (!fileExists) {
            // Si el archivo no existe, crearlo con un array vacío
            await fs.writeFile(dataFile, '[]', 'utf8');
        }

        // Ahora cargar los datos desde el archivo
        const rawData = await fs.readFile(dataFile, 'utf8');
        return JSON.parse(rawData);
    } catch (err) {
        console.error('Error loading data:', err);
        throw err;
    }
}

// Save data to file
async function saveData(data) {
    try {
        // Ahora escribir los datos en el archivo
        const jsonData = JSON.stringify(data, null, 2);
        await fs.writeFile(dataFile, jsonData, 'utf8');
        return true; // Indicar que los datos se guardaron correctamente
    } catch (err) {
        console.error('Error saving data:', err);
        return false; // Indicar que hubo un error al guardar los datos
    }
}

// Generar un ID único
function generateId() {
    return Math.floor(Math.random() * 1000000);
}

// Get all adquisiciones
app.get('/api/adquisiciones', async (req, res) => {
    try {
        const adquisiciones = await loadData();
        res.json(adquisiciones);
    } catch (err) {
        res.status(500).json({ error: 'Failed to load data' });
    }
});

// Get a single adquisicion by ID
app.get('/api/adquisiciones/:id', async (req, res) => {
    try {
        const adquisiciones = await loadData();
        const id = parseInt(req.params.id, 10);
        const adquisicion = adquisiciones.find(a => a.id === id);
        if (adquisicion) {
            res.json(adquisicion);
        } else {
            res.status(404).json({ error: 'Adquisicion not found' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Failed to load data' });
    }
});

// Create new adquisicion
app.post('/api/adquisiciones', async (req, res) => {
    try {
        const adquisiciones = await loadData();
        const newAdquisicion = req.body;
        newAdquisicion.id = generateId(); // Generar un ID único
        newAdquisicion.historial = []; // Inicializar el historial de cambios
        console.log('New adquisicion:', newAdquisicion); // Registrar el nuevo registro
        adquisiciones.push(newAdquisicion);
        const success = await saveData(adquisiciones); // Guardar los datos y verificar si fue exitoso
        if (success) {
            res.status(201).json(newAdquisicion); // Enviar respuesta con el nuevo registro
        } else {
            res.status(500).json({ error: 'Failed to save data' }); // Enviar error si falla el guardado
        }
    } catch (err) {
        res.status(500).json({ error: 'Failed to save data' });
    }
});

// Update an adquisicion
app.put('/api/adquisiciones/:id', async (req, res) => {
    try {
        const adquisiciones = await loadData();
        const id = parseInt(req.params.id, 10);
        const updatedAdquisicion = req.body;
        const index = adquisiciones.findIndex(a => a.id === id);
        if (index !== -1) {
            const existingAdquisicion = adquisiciones[index];

            // Crear un objeto para almacenar el historial de cambios
            const cambio = {
                fecha: new Date().toISOString(),
                cambios: { ...updatedAdquisicion } // Guardar la información modificada
            };

            // Agregar el cambio al historial de la adquisición existente
            if (!existingAdquisicion.historial) {
                existingAdquisicion.historial = []; // Inicializar el historial si no existe
            }
            existingAdquisicion.historial.push(cambio);

            // Actualizar los datos principales de la adquisición con los cambios
            for (const key in updatedAdquisicion) {
                if (updatedAdquisicion.hasOwnProperty(key) && key !== 'historial') {
                    existingAdquisicion[key] = updatedAdquisicion[key];
                }
            }

            // Guardar los cambios en el historial y en los datos de la adquisición
            const success = await saveData(adquisiciones);
            if (success) {
                res.json(existingAdquisicion);
            } else {
                res.status(500).json({ error: 'Failed to save data' });
            }
        } else {
            res.status(404).json({ error: 'Adquisicion not found' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Failed to update data' });
    }
});

// Delete an adquisicion
app.delete('/api/adquisiciones/:id', async (req, res) => {
    try {
        const adquisiciones = await loadData();
        const id = parseInt(req.params.id, 10);
        const index = adquisiciones.findIndex(a => a.id === id);
        if (index !== -1) {
            adquisiciones.splice(index, 1);
            const success = await saveData(adquisiciones);
            if (success) {
                res.status(204).send();
            } else {
                res.status(500).json({ error: 'Failed to delete data' });
            }
        } else {
            res.status(404).json({ error: 'Adquisicion not found' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete data' });
    }
});

app.listen(port, () => {
    console.log(`API listening at http://localhost:${port}`);
});
