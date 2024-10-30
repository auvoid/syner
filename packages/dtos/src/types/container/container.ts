import { Expose } from 'class-transformer';
import { IsEmail, IsString, ValidateNested } from 'class-validator';

export class CreateContainerDTO {
    @IsString()
    fileId: string;

    @IsString()
    name: string;

    @IsEmail({}, { each: true })
    invitees: string[];
}

export class ContainerDTO {
    @Expose()
    id: string;

    @Expose()
    invitees: string[];

    @Expose()
    name: string;

    @Expose()
    files: Record<string, any>;

    @Expose()
    signatures: Record<string, any>;

    @Expose()
    createdAt: Date;

    @Expose()
    updatedAt: Date;
}
