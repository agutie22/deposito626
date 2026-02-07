import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { MikroORM } from '@mikro-orm/core';
import type { PostgreSqlDriver } from '@mikro-orm/postgresql';
import ormConfig from './mikro-orm.config';

import productRoutes from './routes/products';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(helmet());
app.use(express.json());

console.log('⏳ Initializing Server...');

const init = async () => {
    try {
        console.log('⏳ Connecting to MikroORM...');
        const orm = await MikroORM.init<PostgreSqlDriver>(ormConfig);
        console.log('✅ Connected to Database (MikroORM/Neon)');

        // Request context middleware (Updated for cleanliness)
        app.use((req, res, next) => {
            (req as any).context = { em: orm.em.fork() };
            next();
        });

        app.use('/api/products', productRoutes);

        app.get('/', (req, res) => {
            res.json({ message: 'Deposito626 API is running' });
        });

        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error('❌ Error starting server:', error);
        process.exit(1);
    }
};

init();
