import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class User {
    @PrimaryKey({ type: 'number' })
    id!: number;

    @Property({ type: 'date' })
    createdAt = new Date();

    @Property({ type: 'string', nullable: true })
    name?: string;
}
