import { IsEmail, IsString, ValidateNested } from 'class-validator';

export class CreateContainerDTO {
    @IsString()
    fileId: string;

    @IsEmail({}, { each: true })
    invitees: string[];
}
