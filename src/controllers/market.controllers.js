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
    const { name, description, price_cost, price_sale, quantity, image } = req.body;

    const [result] = await pool.query(
      "UPDATE productos SET nombre = ?, descripcion = ?, precio_costo = ?, precio_venta = ?, cantidad = ?, fotografia = ? WHERE id = ?",
      [name, description, price_cost, price_sale, quantity, image, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }
    res.json({ message: "Producto actualizado" });
  } catch (error) {
    return res.status(500).json({ message: 'Algo salió mal' });
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
// aver