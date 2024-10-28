import { Entity, JoinTable, ManyToMany, OneToMany, Relation } from 'typeorm';
import { File } from './file';
import { BaseEntity } from './base-entity';
import { Signature } from './signature';

@Entity()
export class Container extends BaseEntity {
  @ManyToMany(() => File, (e) => e.id)
  @JoinTable()
  files: Relation<File[]>;

  @OneToMany(() => Signature, (e) => e.id, { onDelete: 'CASCADE' })
  signatures: Relation<Signature[]>;
}
