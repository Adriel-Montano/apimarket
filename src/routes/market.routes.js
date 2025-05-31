import { Router } from 'express';
import {
  getUsuarios,
  login,
  getProductos,
  getProductosId,
  postProductos,
  putProductos,
  deleteProductos,
  getCategorias,
  postCategoria,
  getProveedores,
  postProveedor,
  postMovimiento,
  postVenta,
  postOrdenCompra,
  getCierreInventario
} from '../controllers/marketControllers.js';
import { authMiddleware } from './middleware/auth.js';

const router = Router();

// Autenticación
router.get('/empleados', authMiddleware, getUsuarios);
router.post('/auth/login', login);

// Productos
router.get('/productos', authMiddleware, getProductos);
router.get('/productos/:id', authMiddleware, getProductosId);
router.post('/productos', authMiddleware, postProductos);
router.put('/productos/:id', authMiddleware, putProductos);
router.delete('/productos/:id', authMiddleware, deleteProductos);

// Categorías
router.get('/categorias', authMiddleware, getCategorias);
router.post('/categorias', authMiddleware, postCategoria);

// Proveedores
router.get('/proveedores', authMiddleware, getProveedores);
router.post('/proveedores', authMiddleware, postProveedor);

// Movimientos
router.post('/movimientos', authMiddleware, postMovimiento);

// Ventas
router.post('/ventas', authMiddleware, postVenta);

// Ordenes de Compra
router.post('/ordenes-compra', authMiddleware, postOrdenCompra);

// Cierre de Inventario
router.get('/cierre-inventario', authMiddleware, getCierreInventario);

export default router;