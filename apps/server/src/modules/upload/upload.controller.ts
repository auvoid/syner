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

@Controller('upload')
export class UploadController {
  constructor() {}

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
  async uploadPdf(
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

    return {
      upload, // Return the PDF buffer directly
    };
  }
}
