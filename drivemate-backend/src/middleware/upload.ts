import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';


/* =========================================================
   UPLOAD DIRECTORY
========================================================= */

const uploadDirectory =
  path.join(
    process.cwd(),
    'uploads',
    'verifications'
  );


/*
  Create directory automatically
  if it does not exist.
*/
fs.mkdirSync(
  uploadDirectory,
  {
    recursive: true
  }
);


/* =========================================================
   STORAGE
========================================================= */

const storage =
  multer.diskStorage({

    destination:
      (
        req,
        file,
        callback
      ) => {

        callback(
          null,
          uploadDirectory
        );

      },


    filename:
      (
        req,
        file,
        callback
      ) => {

        const extension =
          path.extname(
            file.originalname
          ).toLowerCase();


        const uniqueName =
          `${Date.now()}-${crypto.randomUUID()}${extension}`;


        callback(
          null,
          uniqueName
        );

      }

  });


/* =========================================================
   FILE FILTER
========================================================= */

const allowedMimeTypes = [
  'application/pdf',
  'image/jpeg',
  'image/png'
];


const allowedExtensions = [
  '.pdf',
  '.jpg',
  '.jpeg',
  '.png'
];


const fileFilter:
  multer.Options['fileFilter'] =
  (
    req,
    file,
    callback
  ) => {

    const extension =
      path.extname(
        file.originalname
      ).toLowerCase();


    const validMimeType =
      allowedMimeTypes.includes(
        file.mimetype
      );


    const validExtension =
      allowedExtensions.includes(
        extension
      );


    if (
      validMimeType &&
      validExtension
    ) {

      callback(
        null,
        true
      );

      return;
    }


    callback(
      new Error(
        'Only PDF, JPG, JPEG and PNG verification documents are allowed.'
      )
    );

  };


/* =========================================================
   MULTER INSTANCE
========================================================= */

export const verificationUpload =
  multer({

    storage,

    fileFilter,

    limits: {

      fileSize:
        5 * 1024 * 1024

    }

  });