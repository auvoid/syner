import {
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
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

  @Get()
  async helloWorld() {
    return 'Hello';
  }

  @Post()
  @UseInterceptors(
    FilesInterceptor('files', 2, {
      storage: diskStorage({
        destination: './uploads',
        filename: (_, file, callback) => {
          const uniqueSuffix = uuidv4();
          const fileExtension = file.originalname.split('.').pop();
          callback(null, `${uniqueSuffix}.${fileExtension}`);
        },
      }),
      fileFilter: (_, file, callback) => {
        if (
          file.mimetype === 'application/pdf' ||
          file.mimetype === 'application/x-pkcs12'
        ) {
          callback(null, true);
        } else {
          callback(null, false);
        }
      },
    }),
  )
  async signPdf(
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 4096 * 4096 }),
          new FileTypeValidator({ fileType: /(pdf|p12)$/ }), // Allow only PDF and P12 files
        ],
      }),
    )
    files: Express.Multer.File[],
  ) {
    const pdfFile = files.find((file) => file.mimetype === 'application/pdf');
    const p12File = files.find(
      (file) => file.mimetype === 'application/x-pkcs12',
    );

    if (!pdfFile || !p12File) {
      throw new Error('Both PDF and P12 key files are required');
    }
    const pdfBuffer = await readFile(pdfFile.path);
    const signer = new P12Signer(await readFile(p12File.path));
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
      message: 'Files uploaded successfully',
      pdfFilePath: pdfFile.path,
      p12FilePath: p12File.path,
    };
  }
}
