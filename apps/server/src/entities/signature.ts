import { Column, Entity, JoinColumn, ManyToOne, Relation } from 'typeorm';
import { BaseEntity } from './base-entity';
import { Container } from './container';

@Entity()
export class Signature extends BaseEntity {
  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  email: string;

  @Column({ nullable: false })
  signature: string;

  @ManyToOne(() => Container, (e) => e.id)
  @JoinColumn()
  belongs_to: Relation<Container>;
}