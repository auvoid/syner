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
import { Container } from '../../entities/container';

@Injectable()
export class ContainersService {
  constructor(
    @InjectRepository(Container)
    private repository: Repository<Container>,
  ) {}

  async create(entity: DeepPartial<Container>): Promise<Container> {
    const entityCreate = this.repository.create(entity);
    await this.repository.save(entityCreate);
    return entityCreate;
  }

  async createBulk(entities: DeepPartial<Container>[]): Promise<Container[]> {
    const entitiesCreate = this.repository.create(entities);
    await this.repository.save(entitiesCreate);
    return entitiesCreate;
  }

  async findMany(
    options: FindOptionsWhere<Container>,
    relations: FindOptionsRelations<Container> = {},
    order: FindOptionsOrder<Container> = {},
    paginate: { take: number; skip: number } | null = null,
  ): Promise<Container[]> {
    const searchParams: FindManyOptions<Container> = {
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
    options: FindOptionsWhere<Container>,
    relations: FindOptionsRelations<Container> = {},
    order: FindOptionsOrder<Container> = {},
    paginate: { take: number; skip: number } | null = null,
  ): Promise<[Container[], number]> {
    const searchParams: FindManyOptions<Container> = {
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
    options: FindOptionsWhere<Container>,
    relations: FindOptionsRelations<Container> = {},
  ): Promise<Container> {
    const entity = await this.repository.findOne({
      where: options,
      relations,
    });
    return entity;
  }

  async findById(
    id: string,
    relations: FindOptionsRelations<Container> = {},
  ): Promise<Container> {
    const entity = await this.repository.findOne({
      where: {
        id,
      } as unknown as FindOptionsWhere<Container>,
      relations,
    });
    return entity;
  }

  async findByIdAndUpdate(
    id: string,
    entity: Partial<Container>,
  ): Promise<Container> {
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
