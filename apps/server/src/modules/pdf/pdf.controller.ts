import {
  Controller,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { P12Signer } from '@signpdf/signer-p12';
import { readFile, writeFile } from 'fs/promises';
import { plainAddPlaceholder } from '@signpdf/placeholder-plain';
import signpdf from '@signpdf/signpdf';
import path from 'path';

@Controller('pdf')
export class PdfController {
  constructor() {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'pdfFile', maxCount: 1 },
        { name: 'p12File', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: './uploads',
          filename: (_, file, callback) => {
            const uniqueSuffix = uuidv4();
            const fileExtension = file.originalname.split('.').pop();
            callback(null, `${uniqueSuffix}.${fileExtension}`);
          },
        }),
        fileFilter: (_, file, callback) => {
          if (file.mimetype === 'application/pdf') {
            callback(null, true);
          } else {
            callback(null, false);
          }
        },
      },
    ),
  )
  async signPdf(
    @UploadedFiles()
    files: {
      pdfFile: Express.Multer.File;
      p12File: Express.Multer.File;
    },
  ) {
    if (!files.pdfFile || !files.p12File) {
      throw new Error('Both PDF and P12 key files are required');
    }

    const pdfBuffer = await readFile(files.pdfFile.path);
    const signer = new P12Signer(await readFile(files.p12File.path));
    const pdfWithPlaceholder = plainAddPlaceholder({
      pdfBuffer,
      reason: 'The user is declaring consent.',
      contactInfo: 'info@info.com',
      name: 'John Doe',
      location: 'Location',
    });

    const signedPdf = await signpdf.sign(pdfWithPlaceholder, signer);
    const signedPdfPath = path.join('./uploads', `${uuidv4()}-signed.pdf`);
    await writeFile(signedPdfPath, signedPdf);

    return {
      message: 'Files uploaded and signed successfully',
      pdfFilePath: files.pdfFile.path,
      p12FilePath: files.p12File.path,
      signedPdfPath,
    };
  }
}
