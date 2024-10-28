import { Column, Entity, ManyToMany, ManyToOne, Relation } from 'typeorm';
import { BaseEntity } from './base-entity';
import { Container } from './container';
import { User } from './user';

@Entity()
export class File extends BaseEntity {
  @Column({ nullable: false })
  cid: string;

  @ManyToMany(() => Container, (e) => e.id)
  container: Relation<Container[]>;

  @ManyToOne(() => User, (e) => e.files)
  user: User;
}
