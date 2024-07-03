const fs = require('fs');
const { parse } = require('csv-parse');
const { stringify } = require('csv-stringify');
const pool = require('./config.js');


async function obtenerUsuarios() {
    const [rows] = await pool.query('SELECT * FROM usuarios');
    return rows;
}


async function exportarUsuarios(res) {
    const usuarios = await obtenerUsuarios();
    const csvPath = 'usuarios.csv';

    const csvStream = fs.createWriteStream(csvPath);
    const stringifier = stringify({ header: true });

    stringifier.pipe(csvStream);

    usuarios.forEach((usuario) => {
        stringifier.write(usuario);
    });

    stringifier.end();

    csvStream.on('finish', () => {
        res.writeHead(200, { 'Content-Disposition': 'attachment; filename=usuarios.csv' });
        fs.createReadStream(csvPath).pipe(res);
    });
}


async function importarUsuarios(res) {
    const csvPath = 'usuarios.csv';
    const usuarios = [];

    fs.createReadStream(csvPath)
        .pipe(parse({ columns: true }))
        .on('data', (data) => {
            usuarios.push(data);
        })
        .on('end', async () => {
            const connection = await pool.getConnection();
            try {
                await connection.beginTransaction();

                for (const user of usuarios) {
                    const [existingUser] = await connection.execute(
                        'SELECT * FROM usuarios WHERE id = ? OR correo = ?',
                        [user.id, user.correo]
                    );

                    if (existingUser.length === 0) {
                        await connection.execute(
                            'INSERT INTO usuarios (id, nombres, apellidos, direccion, correo, dni, edad, fecha_creacion, telefono) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                            [user.id, user.nombres, user.apellidos, user.direccion, user.correo, user.dni, user.edad, user.fecha_creacion, user.telefono]
                        );
                    }
                }

                await connection.commit();
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Usuarios importados exitosamente' }));
            } catch (error) {
                await connection.rollback();
                console.error('Error al importar usuarios:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Error al importar usuarios' }));
            } finally {
                connection.release();
            }
        });
}

module.exports = {
    obtenerUsuarios,
    exportarUsuarios,
    importarUsuarios,
};
