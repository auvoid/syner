import {
  AfterLoad,
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  Relation,
} from 'typeorm';
import { hash, verify } from 'argon2';
import { BaseEntity } from './base-entity';
import { Session } from './session';
import { Container } from './container';
import { File } from './file';

@Entity()
export class User extends BaseEntity {
  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true, unique: true })
  did: string;

  @OneToMany(() => Session, (e) => e.user, { onDelete: 'CASCADE' })
  sessions: Relation<Session[]>;

  @Column({ default: false, nullable: false })
  emailVerified: boolean;

  @OneToMany(() => Container, (e) => e.ownedBy, { onDelete: 'CASCADE' })
  documents: Container[];

  @OneToMany(() => File, (e) => e.user, { onDelete: 'CASCADE' })
  files: File[];

  @Column({ default: false })
  verified: boolean;

  private tempPassword: string;
  @AfterLoad()
  private loadTempPassword(): void {
    this.tempPassword = this.password;
  }

  @BeforeInsert()
  @BeforeUpdate()
  async hashAndSaltPassword() {
    if (this.tempPassword !== this.password) {
      this.password = await hash(this.password);
    }
  }

  async verifyPassword(pwd: string) {
    return verify(this.password, pwd);
  }
}
