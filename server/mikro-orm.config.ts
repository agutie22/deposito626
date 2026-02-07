import { defineConfig } from '@mikro-orm/postgresql';
import dotenv from 'dotenv';
import { User } from './entities/User';
import { Category } from './entities/Category';
import { Product } from './entities/Product';
import { Customer } from './entities/Customer';
import { VerificationCode } from './entities/VerificationCode';

dotenv.config();

console.log('👉 Loading MikroORM Config...');

export default defineConfig({
    clientUrl: process.env.DATABASE_URL,
    debug: process.env.NODE_ENV !== 'production',
    entities: [User, Category, Product, Customer, VerificationCode],
});
