require('dotenv').config();
const http = require('http');
const { obtenerUsuarios, exportarUsuarios, importarUsuarios } = require('./controller.js');


const server = http.createServer(async (req, res) => {
    if (req.method === 'GET' && req.url === '/api/usuarios') {
        try {
            const usuarios = await obtenerUsuarios();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(usuarios));
        } catch (error) {
            console.error('Error al obtener usuarios:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Error al obtener usuarios' }));
        }
    } else if (req.method === 'GET' && req.url === '/api/usuarios/export') {
        try {
            await exportarUsuarios(res);
        } catch (error) {
            console.error('Error al exportar usuarios:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Error al exportar usuarios' }));
        }
    } else if (req.method === 'POST' && req.url === '/api/usuarios/import') {
        try {
            await importarUsuarios(res);
        } catch (error) {
            console.error('Error al importar usuarios:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Error al importar usuarios' }));
        }
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Ruta no encontrada' }));
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor levantado en el puerto http://localhost/${PORT}`);
});
