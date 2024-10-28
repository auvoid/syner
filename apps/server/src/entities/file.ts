import { Column, Entity, ManyToMany, Relation } from 'typeorm';
import { BaseEntity } from './base-entity';
import { Container } from './container';

@Entity()
export class File extends BaseEntity {
  @Column({ unique: true, nullable: false })
  location: string;

  @Column({ nullable: false })
  hash: string;

  @ManyToMany(() => Container, (e) => e.id)
  belongsTo: Relation<Container[]>;
}
