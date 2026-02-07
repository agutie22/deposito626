import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class VerificationCode {
    @PrimaryKey({ type: 'number' })
    id!: number;

    @Property({ type: 'string' })
    phoneNumber!: string;

    @Property({ type: 'string' })
    code!: string;

    @Property({ type: 'date' })
    expiresAt!: Date;

    @Property({ type: 'date' })
    createdAt = new Date();
}
