import { Entity, PrimaryKey, Property, OneToMany, Collection } from '@mikro-orm/core';
import { Product } from './Product';

@Entity()
export class Category {
    @PrimaryKey({ type: 'number' })
    id!: number;

    @Property({ type: 'string' })
    name!: string;

    @Property({ type: 'string', unique: true })
    slug!: string;

    @Property({ type: 'number', default: 0 })
    sortOrder: number = 0;

    @OneToMany(() => Product, product => product.category)
    products = new Collection<Product>(this);

    @Property({ type: 'date' })
    createdAt = new Date();

    @Property({ type: 'date', onUpdate: () => new Date() })
    updatedAt = new Date();
}
