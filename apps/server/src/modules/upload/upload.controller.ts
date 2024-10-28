import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { pinata } from '../../services/pinata.service';
import { FilesService } from './files.service';
import { IsAuthenticated } from 'src/guards/auth.guard';
import { CurrentUser } from 'src/decorators';
import { User } from 'src/entities';

@Controller('upload')
export class UploadController {
  constructor(private readonly filesService: FilesService) {}

  @Post('/pdf')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'pdfFile', maxCount: 1 }], {
      storage: memoryStorage(), // Switch to memory storage
      fileFilter: (_, file, callback) => {
        if (file.mimetype === 'application/pdf') {
          callback(null, true);
        } else {
          callback(null, false);
        }
      },
    }),
  )
  @IsAuthenticated()
  async uploadPdf(
    @CurrentUser() user: User,
    @UploadedFiles()
    files: {
      pdfFile: Express.Multer.File[];
    },
  ) {
    const pdfFile = files?.pdfFile?.[0];
    if (!pdfFile) {
      throw new Error('PDF file is required');
    }

    const file = new File([pdfFile.buffer], uuidv4(), {
      type: pdfFile.mimetype,
    });

    const upload = await pinata.upload.file(file);
    const uploadedFile = await this.filesService.create({
      user,
      cid: upload.cid,
    });

    return uploadedFile;
  }
}
