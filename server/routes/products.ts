import { Router } from 'express';
import { MikroORM } from '@mikro-orm/core';
import { Product } from '../entities/Product';
import { Category } from '../entities/Category';

const router = Router();

router.get('/', async (req, res) => {
    try {
        const em = (req as any).context.em; // Context from middleware

        // Fetch categories with products, sorted
        const categories = await em.find(Category, {}, {
            populate: ['products'],
            orderBy: { sortOrder: 'ASC', products: { sortOrder: 'ASC' } }
        });

        res.json(categories);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;
