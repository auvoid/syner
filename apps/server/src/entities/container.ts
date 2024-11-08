import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  Relation,
} from 'typeorm';
import { File } from './file';
import { BaseEntity } from './base-entity';
import { Signature } from './signature';
import { User } from './user';

@Entity()
export class Container extends BaseEntity {
  @ManyToMany(() => File, (e) => e.id)
  @JoinTable()
  files: Relation<File[]>;

  @Column({ default: 'Signable Document' })
  name: string;

  @OneToMany(() => Signature, (e) => e.container, { onDelete: 'CASCADE' })
  signatures: Relation<Signature[]>;

  @Column('text', { array: true })
  invitees: string[];

  @ManyToOne(() => User, (e) => e.documents)
  ownedBy: User;
}
