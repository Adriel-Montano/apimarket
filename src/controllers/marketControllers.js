import pool from '../config.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Obtener todos los empleados
export const getUsuarios = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT id_empleado, nombre, email, rol FROM empleados");
    res.json({ empleados: rows });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Algo salió mal', error: error.message });
  }
};

// Login con email y contraseña
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contraseña son requeridos' });
    }
    const [rows] = await pool.query("SELECT * FROM empleados WHERE email = ?", [email]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.clave);
    if (!isMatch) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }
    const token = jwt.sign(
      { id: user.id_empleado, email: user.email, rol: user.rol },
      process.env.JWT_SECRET || 'tu_secreto_jwt',
      { expiresIn: '1h' }
    );
    res.json({ token, user: { id: user.id_empleado, nombre: user.nombre, email: user.email, rol: user.rol } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Algo salió mal', error: error.message });
  }
};

// Obtener todos los productos
export const getProductos = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM productos");
    res.json({ productos: rows });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Algo salió mal', error: error.message });
  }
};

// Obtener producto por ID
export const getProductosId = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query("SELECT * FROM productos WHERE id_producto = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Algo salió mal', error: error.message });
  }
};

// Crear producto
export const postProductos = async (req, res) => {
  try {
    const { nombre, descripcion, precio_costo, precio_venta, cantidad, fotografia, id_proveedor, id_categoria } = req.body;
    if (!nombre || !precio_costo || !precio_venta || !cantidad) {
      return res.status(400).json({ message: 'Nombre, precio_costo, precio_venta y cantidad son requeridos' });
    }
    console.log('Datos recibidos en el POST:', { nombre, descripcion, precio_costo, precio_venta, cantidad, fotografia, id_proveedor, id_categoria });

    // Verificar si id_proveedor e id_categoria existen (si se proporcionan)
    if (id_proveedor) {
      const [proveedor] = await pool.query("SELECT id_proveedor FROM proveedores WHERE id_proveedor = ?", [id_proveedor]);
      if (proveedor.length === 0) {
        return res.status(400).json({ message: 'Proveedor no encontrado' });
      }
    }
    if (id_categoria) {
      const [categoria] = await pool.query("SELECT id_categoria FROM categorias WHERE id_categoria = ?", [id_categoria]);
      if (categoria.length === 0) {
        return res.status(400).json({ message: 'Categoría no encontrada' });
      }
    }

    // Nota: En lugar de generar manualmente el id_producto, deberías usar AUTO_INCREMENT en la base de datos
    const [result] = await pool.query(
      "INSERT INTO productos (nombre, descripcion, precio_costo, precio_venta, stock, fotografia, id_proveedor, id_categoria) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [nombre, descripcion || '', precio_costo, precio_venta, cantidad, fotografia || null, id_proveedor || null, id_categoria || null]
    );

    if (result.affectedRows > 0) {
      const [insertedProduct] = await pool.query("SELECT * FROM productos WHERE id_producto = ?", [result.insertId]);
      res.json({ message: "Producto agregado", id: result.insertId, producto: insertedProduct[0] });
    } else {
      res.status(500).json({ message: "No se pudo insertar el producto" });
    }
  } catch (error) {
    console.error('Error en postProductos:', error);
    return res.status(500).json({ message: "Algo salió mal", error: error.message });
  }
};

// Actualizar producto
export const putProductos = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, precio_costo, precio_venta, cantidad, fotografia, id_proveedor, id_categoria } = req.body;

    const [rows] = await pool.query("SELECT * FROM productos WHERE id_producto = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    const currentProducto = rows[0];
    const updatedProducto = {
      nombre: nombre !== undefined ? nombre : currentProducto.nombre,
      descripcion: descripcion !== undefined ? descripcion : currentProducto.descripcion,
      precio_costo: precio_costo !== undefined ? parseFloat(precio_costo) : currentProducto.precio_costo,
      precio_venta: precio_venta !== undefined ? parseFloat(precio_venta) : currentProducto.precio_venta,
      stock: cantidad !== undefined ? parseInt(cantidad) : currentProducto.stock,
      fotografia: fotografia !== undefined ? fotografia : currentProducto.fotografia,
      id_proveedor: id_proveedor !== undefined ? id_proveedor : currentProducto.id_proveedor,
      id_categoria: id_categoria !== undefined ? id_categoria : currentProducto.id_categoria,
    };

    const [result] = await pool.query(
      "UPDATE productos SET nombre = ?, descripcion = ?, precio_costo = ?, precio_venta = ?, stock = ?, fotografia = ?, id_proveedor = ?, id_categoria = ? WHERE id_producto = ?",
      [
        updatedProducto.nombre,
        updatedProducto.descripcion,
        updatedProducto.precio_costo,
        updatedProducto.precio_venta,
        updatedProducto.stock,
        updatedProducto.fotografia,
        updatedProducto.id_proveedor,
        updatedProducto.id_categoria,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    const [updatedRows] = await pool.query("SELECT * FROM productos WHERE id_producto = ?", [id]);
    res.json(updatedRows[0]);
  } catch (error) {
    console.error('Error en putProductos:', error);
    return res.status(500).json({ message: "Algo salió mal", error: error.message });
  }
};

// Eliminar producto
export const deleteProductos = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query("DELETE FROM productos WHERE id_producto = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }
    res.json({ message: "Producto eliminado" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al eliminar el producto", error: error.message });
  }
};

// Categorías
export const getCategorias = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM categorias");
    res.json({ categorias: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Algo salió mal', error: error.message });
  }
};

export const postCategoria = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    if (!nombre) {
      return res.status(400).json({ message: 'Nombre es requerido' });
    }
    const [result] = await pool.query(
      "INSERT INTO categorias (nombre, descripcion) VALUES (?, ?)",
      [nombre, descripcion || '']
    );
    res.json({ message: "Categoría registrada", id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Algo salió mal', error: error.message });
  }
};

// Proveedores
export const getProveedores = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM proveedores");
    res.json({ proveedores: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Algo salió mal', error: error.message });
  }
};

export const postProveedor = async (req, res) => {
  try {
    const { nombre, contacto, telefono, email } = req.body;
    if (!nombre) {
      return res.status(400).json({ message: 'Nombre es requerido' });
    }
    const [result] = await pool.query(
      "INSERT INTO proveedores (nombre, contacto, telefono, email) VALUES (?, ?, ?, ?)",
      [nombre, contacto || '', telefono || '', email || '']
    );
    res.json({ message: "Proveedor registrado", id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Algo salió mal', error: error.message });
  }
};

// Movimientos
export const postMovimiento = async (req, res) => {
  try {
    const { id_producto, tipo, cantidad, motivo, id_empleado } = req.body;
    if (!id_producto || !tipo || !cantidad || !id_empleado) {
      return res.status(400).json({ message: 'id_producto, tipo, cantidad e id_empleado son requeridos' });
    }
    if (!['entrada', 'salida'].includes(tipo)) {
      return res.status(400).json({ message: 'Tipo debe ser "entrada" o "salida"' });
    }
    const [producto] = await pool.query("SELECT stock FROM productos WHERE id_producto = ?", [id_producto]);
    if (producto.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    const nuevoStock = tipo === 'entrada' ? producto[0].stock + parseInt(cantidad) : producto[0].stock - parseInt(cantidad);
    if (nuevoStock < 0) {
      return res.status(400).json({ message: 'Stock insuficiente para realizar la salida' });
    }
    const [result] = await pool.query(
      "INSERT INTO movimientos (id_producto, tipo, cantidad, motivo, id_empleado) VALUES (?, ?, ?, ?, ?)",
      [id_producto, tipo, cantidad, motivo || '', id_empleado]
    );
    await pool.query("UPDATE productos SET stock = ? WHERE id_producto = ?", [nuevoStock, id_producto]);
    res.json({ message: "Movimiento registrado", id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Algo salió mal', error: error.message });
  }
};

// Ventas
export const postVenta = async (req, res) => {
  try {
    const { id_cliente, id_empleado, productos } = req.body;
    if (!id_empleado || !productos || !Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({ message: 'id_empleado y productos (no vacíos) son requeridos' });
    }
    let total = 0;
    for (const item of productos) {
      if (!item.id_producto || !item.cantidad) {
        return res.status(400).json({ message: 'Cada producto debe tener id_producto y cantidad' });
      }
      const [producto] = await pool.query("SELECT precio_venta, stock FROM productos WHERE id_producto = ?", [item.id_producto]);
      if (producto.length === 0) {
        return res.status(404).json({ message: `Producto con id ${item.id_producto} no encontrado` });
      }
      if (producto[0].stock < item.cantidad) {
        return res.status(400).json({ message: `Stock insuficiente para el producto ${item.id_producto}` });
      }
      total += producto[0].precio_venta * item.cantidad;
      await pool.query("UPDATE productos SET stock = ? WHERE id_producto = ?", [producto[0].stock - item.cantidad, item.id_producto]);
    }
    const [ventaResult] = await pool.query(
      "INSERT INTO ventas (id_cliente, id_empleado, total) VALUES (?, ?, ?)",
      [id_cliente || null, id_empleado, total]
    );
    const id_venta = ventaResult.insertId;
    for (const item of productos) {
      const [producto] = await pool.query("SELECT precio_venta FROM productos WHERE id_producto = ?", [item.id_producto]);
      await pool.query(
        "INSERT INTO detalle_venta (id_venta, id_producto, cantidad, precio_unitario, subtotal) VALUES (?, ?, ?, ?, ?)",
        [id_venta, item.id_producto, item.cantidad, producto[0].precio_venta, producto[0].precio_venta * item.cantidad]
      );
    }
    res.json({ message: "Venta registrada", id_venta });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Algo salió mal', error: error.message });
  }
};

// Ordenes de Compra
export const postOrdenCompra = async (req, res) => {
  try {
    const { id_proveedor, total, estado } = req.body;
    if (!id_proveedor || !total) {
      return res.status(400).json({ message: 'id_proveedor y total son requeridos' });
    }
    const [proveedor] = await pool.query("SELECT id_proveedor FROM proveedores WHERE id_proveedor = ?", [id_proveedor]);
    if (proveedor.length === 0) {
      return res.status(400).json({ message: 'Proveedor no encontrado' });
    }
    const [result] = await pool.query(
      "INSERT INTO ordenes_compra (id_proveedor, total, estado) VALUES (?, ?, ?)",
      [id_proveedor, total, estado || 'pendiente']
    );
    res.json({ message: "Orden de compra creada", id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Algo salió mal', error: error.message });
  }
};

// Cierre de Inventario
export const getCierreInventario = async (req, res) => {
  try {
    const [productos] = await pool.query("SELECT id_producto, nombre, stock FROM productos");
    const lowStock = productos.filter(p => p.stock < 10);
    res.json({ productos, lowStock });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Algo salió mal', error: error.message });
  }
};