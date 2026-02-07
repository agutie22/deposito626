import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import { Category } from './Category';

@Entity()
export class Product {
    @PrimaryKey({ type: 'number' })
    id!: number;

    @Property({ type: 'string' })
    name!: string;

    @Property({ type: 'text', nullable: true })
    description?: string;

    @Property({ type: 'decimal', precision: 10, scale: 2 })
    price!: number;

    @Property({ type: 'string', nullable: true })
    imageUrl?: string;

    @Property({ type: 'string', default: 'in_stock' })
    stockStatus!: 'in_stock' | 'limited' | 'out_of_stock';

    @ManyToOne(() => Category)
    category!: Category;

    @Property({ type: 'number', default: 0 })
    sortOrder: number = 0;

    @Property({ type: 'date' })
    createdAt = new Date();

    @Property({ type: 'date', onUpdate: () => new Date() })
    updatedAt = new Date();
}
