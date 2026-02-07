import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class Customer {
    @PrimaryKey({ type: 'number' })
    id!: number;

    @Property({ type: 'string', unique: true })
    phoneNumber!: string;

    @Property({ type: 'boolean', default: false })
    isVerified: boolean = false;

    @Property({ type: 'date', nullable: true })
    lastOrderDate?: Date;

    @Property({ type: 'number', default: 0 })
    totalOrders: number = 0;

    @Property({ type: 'date' })
    createdAt = new Date();

    @Property({ type: 'date', onUpdate: () => new Date() })
    updatedAt = new Date();
}
