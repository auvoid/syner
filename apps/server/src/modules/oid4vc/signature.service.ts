import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  FindOptionsOrder,
  FindOptionsWhere,
  FindOptionsRelations,
  FindManyOptions,
  DeepPartial,
} from 'typeorm';
import { Signature } from '../../entities';

@Injectable()
export class SignatureService {
  constructor(
    @InjectRepository(Signature) private repository: Repository<Signature>,
  ) {}

  async create(entity: DeepPartial<Signature>): Promise<Signature> {
    const entityCreate = this.repository.create(entity);
    await this.repository.save(entityCreate);
    return entityCreate;
  }

  async createBulk(entities: DeepPartial<Signature>[]): Promise<Signature[]> {
    const entitiesCreate = this.repository.create(entities);
    await this.repository.save(entitiesCreate);
    return entitiesCreate;
  }

  async findMany(
    options: FindOptionsWhere<Signature>,
    relations: FindOptionsRelations<Signature> = {},
    order: FindOptionsOrder<Signature> = {},
    paginate: { take: number; skip: number } | null = null,
  ): Promise<Signature[]> {
    const searchParams: FindManyOptions<Signature> = {
      where: options,
      relations,
      order,
    };
    if (paginate) {
      searchParams.take = paginate.take;
      searchParams.skip = paginate.skip;
    }
    const entities = await this.repository.find(searchParams);
    return entities;
  }

  async findManyAndCount(
    options: FindOptionsWhere<Signature>,
    relations: FindOptionsRelations<Signature> = {},
    order: FindOptionsOrder<Signature> = {},
    paginate: { take: number; skip: number } | null = null,
  ): Promise<[Signature[], number]> {
    const searchParams: FindManyOptions<Signature> = {
      where: options,
      relations,
      order,
    };
    if (paginate) {
      searchParams.take = paginate.take;
      searchParams.skip = paginate.skip;
    }
    const entities = await this.repository.findAndCount(searchParams);
    return entities;
  }

  async findOne(
    options: FindOptionsWhere<Signature>,
    relations: FindOptionsRelations<Signature> = {},
  ): Promise<Signature> {
    const entity = await this.repository.findOne({
      where: options,
      relations,
    });
    return entity;
  }

  async findById(
    id: string,
    relations: FindOptionsRelations<Signature> = {},
  ): Promise<Signature> {
    const entity = await this.repository.findOne({
      where: { id } as unknown as FindOptionsWhere<Signature>,
      relations,
    });
    return entity;
  }

  async findByIdAndUpdate(
    id: string,
    entity: Partial<Signature>,
  ): Promise<Signature> {
    const current = await this.findById(id);
    const toSave = this.repository.create({
      ...current,
      ...entity,
    });

    const updated = await this.repository.save(toSave);
    return updated;
  }

  async findByIdAndDelete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
