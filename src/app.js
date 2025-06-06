import express from 'express';
import cors from 'cors'; // Agregar cors
import marketRoutes from './routes/market.routes.js';

const app = express();

app.use(cors()); // Habilitar CORS para todas las rutas
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(marketRoutes);

app.use((req, res, next) => {
    res.status(404).json({
        message: "Favor realizar pruebas en los siguientes endpoints:",
        endpoints: [
            "https://apimarket-production-2ac8.up.railway.app/usuarios",
            "https://apimarket-production-2ac8.up.railway.app/productos"
        ]
    });
});

export default app;