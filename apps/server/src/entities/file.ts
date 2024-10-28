import { Column, Entity, ManyToMany, Relation } from 'typeorm';
import { BaseEntity } from './base-entity';
import { Container } from './container';

@Entity()
export class File extends BaseEntity {
  @Column({ nullable: false })
  cid: string;

  @ManyToMany(() => Container, (e) => e.id)
  belongsTo: Relation<Container[]>;
}
