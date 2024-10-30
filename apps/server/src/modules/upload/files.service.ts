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
import { File } from '../../entities/file';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(File)
    private repository: Repository<File>,
  ) {}

  async create(entity: DeepPartial<File>): Promise<File> {
    const entityCreate = this.repository.create(entity);
    await this.repository.save(entityCreate);
    return entityCreate;
  }

  async createBulk(entities: DeepPartial<File>[]): Promise<File[]> {
    const entitiesCreate = this.repository.create(entities);
    await this.repository.save(entitiesCreate);
    return entitiesCreate;
  }

  async findMany(
    options: FindOptionsWhere<File>,
    relations: FindOptionsRelations<File> = {},
    order: FindOptionsOrder<File> = {},
    paginate: { take: number; skip: number } | null = null,
  ): Promise<File[]> {
    const searchParams: FindManyOptions<File> = {
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
    options: FindOptionsWhere<File>,
    relations: FindOptionsRelations<File> = {},
    order: FindOptionsOrder<File> = {},
    paginate: { take: number; skip: number } | null = null,
  ): Promise<[File[], number]> {
    const searchParams: FindManyOptions<File> = {
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
    options: FindOptionsWhere<File>,
    relations: FindOptionsRelations<File> = {},
  ): Promise<File> {
    const entity = await this.repository.findOne({
      where: options,
      relations,
    });
    return entity;
  }

  async findById(
    id: string,
    relations: FindOptionsRelations<File> = {},
  ): Promise<File> {
    const entity = await this.repository.findOne({
      where: {
        id,
      } as unknown as FindOptionsWhere<File>,
      relations,
    });
    return entity;
  }

  async findByIdAndUpdate(id: string, entity: Partial<File>): Promise<File> {
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
