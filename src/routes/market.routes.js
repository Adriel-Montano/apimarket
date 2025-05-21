import { Router } from 'express';
import { getUsuarios, getUsuario, getProductos, postProductos, putProductos, deleteProductos, getProductosId } from '../controllers/marketControllers.js';

const router = Router();

// Ruta para consultar usuarios
router.get('/usuarios', getUsuarios);

// Ruta para consultar productos
router.get('/productos', getProductos);

// Ruta para consultar productos por ID
router.get('/productos/:id', getProductosId);

// Ruta para iniciar sesión (Login)
router.post('/usuarios/login', getUsuario);

// Ruta para ingresar producto
router.post('/productos', postProductos);

// Ruta para actualizar producto
router.put('/productos/:id', putProductos);

// Ruta para eliminar producto
router.delete('/productos/:id', deleteProductos);

export default router;