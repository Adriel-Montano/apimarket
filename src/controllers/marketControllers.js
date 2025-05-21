import pool from '../config.js';

export const getUsuarios = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM usuarios");
    res.json({ usuarios: rows });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Algo salió mal' });
  }
};

export const getUsuario = async (req, res) => {
  try {
    const { username, password } = req.body;
    const [rows] = await pool.query(
      "SELECT * FROM usuarios WHERE nombre = ? AND clave = ?",
      [username, password]
    );
    if (rows.length <= 0) {
      return res.status(404).json({ message: "Usuario no Encontrado" });
    }
    res.json({ message: "Encontrado" });
  } catch (error) {
    return res.status(500).json({ message: 'Algo salió mal' });
  }
};

export const getProductos = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM productos");
    res.json({ productos: rows });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Algo salió mal' });
  }
};

export const getProductosId = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query("SELECT * FROM productos WHERE id = ?", [id]);
    if (rows.length <= 0) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }
    res.json({ productos: rows });
  } catch (error) {
    return res.status(500).json({ message: "Algo salió mal" });
  }
};

export const postProductos = async (req, res) => {
  try {
    const { name, description, price_cost, price_sale, quantity, image } = req.body;
    const [result] = await pool.query("SELECT MAX(id) AS last_id FROM productos");
    const lastId = result[0].last_id || 0;
    const newId = lastId + 1;
    const [insertResult] = await pool.query(
      "INSERT INTO productos (id, nombre, descripcion, precio_costo, precio_venta, cantidad, fotografia) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [newId, name, description, price_cost, price_sale, quantity, image]
    );
    if (insertResult.affectedRows > 0) {
      res.json({ message: "Producto Agregado", id: newId });
    } else {
      res.status(404).json({ message: "No se ingresó el producto" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Algo salió mal' });
  }
};

export const putProductos = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, precio_costo, precio_venta, cantidad, fotografia } = req.body;
    console.log('Datos recibidos en el PUT:', { id, nombre, descripcion, precio_costo, precio_venta, cantidad, fotografia });

    // Obtener el producto actual para usar los valores existentes como fallback
    const [rows] = await pool.query("SELECT * FROM productos WHERE id = ?", [id]);
    console.log('Producto actual en la base de datos:', rows);
    if (rows.length <= 0) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    const currentProducto = rows[0];
    const updatedProducto = {
      nombre: nombre !== undefined ? nombre : currentProducto.nombre,
      descripcion: descripcion !== undefined ? descripcion : currentProducto.descripcion,
      precio_costo: precio_costo !== undefined ? precio_costo : currentProducto.precio_costo,
      precio_venta: precio_venta !== undefined ? precio_venta : currentProducto.precio_venta,
      cantidad: cantidad !== undefined ? cantidad : currentProducto.cantidad,
      fotografia: fotografia !== undefined ? fotografia : currentProducto.fotografia,
    };
    console.log('Datos a actualizar:', updatedProducto);

    const [result] = await pool.query(
      "UPDATE productos SET nombre = ?, descripcion = ?, precio_costo = ?, precio_venta = ?, cantidad = ?, fotografia = ? WHERE id = ?",
      [
        updatedProducto.nombre,
        updatedProducto.descripcion,
        updatedProducto.precio_costo,
        updatedProducto.precio_venta,
        updatedProducto.cantidad,
        updatedProducto.fotografia,
        id,
      ]
    );
    console.log('Resultado de la actualización:', result);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    // Obtener el producto actualizado para devolverlo en la respuesta
    const [updatedRows] = await pool.query("SELECT * FROM productos WHERE id = ?", [id]);
    console.log('Producto después de la actualización:', updatedRows);
    res.json(updatedRows[0]);
  } catch (error) {
    console.error('Error en putProductos:', error);
    return res.status(500).json({ message: "Algo salió mal", error: error.message });
  }
};

export const deleteProductos = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query("DELETE FROM productos WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }
    res.json({ message: "Producto eliminado" });
  } catch (error) {
    return res.status(500).json({ message: 'Algo salió mal' });
  }
};