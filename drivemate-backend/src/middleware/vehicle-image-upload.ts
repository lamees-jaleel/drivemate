import multer from 'multer';

import {
  mkdirSync
} from 'node:fs';

import {
  extname,
  join
} from 'node:path';

import {
  randomUUID
} from 'node:crypto';


/* =========================================================
   UPLOAD DIRECTORY
========================================================= */

const uploadDirectory =
  join(
    process.cwd(),
    'uploads',
    'vehicles'
  );


mkdirSync(
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

    destination: (
      req,
      file,
      callback
    ) => {

      callback(
        null,
        uploadDirectory
      );

    },


    filename: (
      req,
      file,
      callback
    ) => {

      const extension =
        extname(
          file.originalname
        )
          .toLowerCase();


      const fileName =
        `${Date.now()}-${randomUUID()}${extension}`;


      callback(
        null,
        fileName
      );

    }

  });


/* =========================================================
   FILE FILTER
========================================================= */

const allowedMimeTypes =
  new Set([

    'image/jpeg',

    'image/png'

  ]);


const allowedExtensions =
  new Set([

    '.jpg',

    '.jpeg',

    '.png'

  ]);


const fileFilter:
  multer.Options['fileFilter'] =
  (
    req,
    file,
    callback
  ) => {

    const extension =
      extname(
        file.originalname
      )
        .toLowerCase();


    const validMimeType =
      allowedMimeTypes
        .has(
          file.mimetype
        );


    const validExtension =
      allowedExtensions
        .has(
          extension
        );


    if (
      !validMimeType ||
      !validExtension
    ) {

      callback(
        new Error(
          'Only JPG, JPEG and PNG files are allowed.'
        )
      );

      return;

    }


    callback(
      null,
      true
    );

  };


/* =========================================================
   MULTER
========================================================= */

export const vehicleImageUpload =
  multer({

    storage,

    fileFilter,

    limits: {

      fileSize:
        5 * 1024 * 1024

    }

  });
