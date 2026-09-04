import type {
  Request,
  Response
} from 'express';

import {
  existsSync,
  unlinkSync
} from 'node:fs';

import {
  relative
} from 'node:path';

import {
  prisma
} from '../lib/prisma.js';

import {
  validateVehicleDocument
} from '../validators/document.validator.js';


/* =========================================================
   TYPES
========================================================= */

interface AuthInfo {

  userId: number;

  role: string;

}


type DocumentTypeValue =
  | 'REGISTRATION_CERTIFICATE'
  | 'INSURANCE'
  | 'POLLUTION_CERTIFICATE'
  | 'ROAD_TAX'
  | 'FITNESS_CERTIFICATE'
  | 'WARRANTY'
  | 'SERVICE_DOCUMENT'
  | 'PURCHASE_INVOICE'
  | 'OTHER';


type ComplianceStatus =
  | 'VALID'
  | 'EXPIRING_SOON'
  | 'EXPIRED'
  | 'NO_EXPIRY';


/* =========================================================
   AUTH
========================================================= */

function getAuth(
  res: Response
): AuthInfo | null {

  const auth =
    res.locals.auth as
      AuthInfo |
      undefined;


  return auth ?? null;

}


/* =========================================================
   IDS
========================================================= */

function getVehicleId(
  req: Request
): number {

  return Number(
    req.params.vehicleId
  );

}


/* =========================================================
   DELETE UPLOADED FILE
========================================================= */

function removeUploadedFile(
  file:
    Express.Multer.File |
    undefined
): void {

  if (
    !file ||
    !existsSync(
      file.path
    )
  ) {

    return;

  }


  try {

    unlinkSync(
      file.path
    );

  }

  catch (error) {

    console.error(
      'Unable to remove uploaded document:',
      error
    );

  }

}


/* =========================================================
   VERIFY VEHICLE OWNERSHIP
========================================================= */

async function findOwnedVehicle(
  vehicleId: number,
  ownerId: number
) {

  return prisma.vehicle
    .findFirst({

      where: {

        id:
          vehicleId,

        ownerId

      },


      select: {

        id: true,

        registrationNumber: true,

        make: true,

        model: true

      }

    });

}


/* =========================================================
   COMPLIANCE STATUS
========================================================= */

function getComplianceStatus(
  expiryDate:
    Date |
    null
): {

  complianceStatus:
    ComplianceStatus;

  daysUntilExpiry:
    number |
    null;

} {

  if (!expiryDate) {

    return {

      complianceStatus:
        'NO_EXPIRY',

      daysUntilExpiry:
        null

    };

  }


  const today =
    new Date();


  const todayUtc =
    Date.UTC(

      today.getUTCFullYear(),

      today.getUTCMonth(),

      today.getUTCDate()

    );


  const expiryUtc =
    Date.UTC(

      expiryDate.getUTCFullYear(),

      expiryDate.getUTCMonth(),

      expiryDate.getUTCDate()

    );


  const millisecondsPerDay =
    1000 *
    60 *
    60 *
    24;


  const daysUntilExpiry =
    Math.ceil(
      (
        expiryUtc -
        todayUtc
      ) /
      millisecondsPerDay
    );


  if (
    daysUntilExpiry <
    0
  ) {

    return {

      complianceStatus:
        'EXPIRED',

      daysUntilExpiry

    };

  }


  if (
    daysUntilExpiry <=
    30
  ) {

    return {

      complianceStatus:
        'EXPIRING_SOON',

      daysUntilExpiry

    };

  }


  return {

    complianceStatus:
      'VALID',

    daysUntilExpiry

  };

}


/* =========================================================
   ADD COMPLIANCE INFORMATION
========================================================= */

function withComplianceStatus<
  T extends {
    expiryDate: Date | null;
  }
>(
  document: T
) {

  return {

    ...document,

    ...getComplianceStatus(
      document.expiryDate
    )

  };

}


/* =========================================================
   CREATE DOCUMENT
========================================================= */

export async function createDocument(
  req: Request,
  res: Response
): Promise<void> {

  try {

    const auth =
      getAuth(
        res
      );


    if (!auth) {

      removeUploadedFile(
        req.file
      );


      res.status(401).json({

        success: false,

        message:
          'Authentication required.'

      });

      return;

    }


    const vehicleId =
      getVehicleId(
        req
      );


    if (
      !Number.isInteger(
        vehicleId
      ) ||
      vehicleId <= 0
    ) {

      removeUploadedFile(
        req.file
      );


      res.status(400).json({

        success: false,

        message:
          'Invalid vehicle ID.'

      });

      return;

    }


    /* =====================================================
       VEHICLE OWNERSHIP
    ===================================================== */

    const vehicle =
      await findOwnedVehicle(
        vehicleId,
        auth.userId
      );


    if (!vehicle) {

      removeUploadedFile(
        req.file
      );


      res.status(404).json({

        success: false,

        message:
          'Vehicle not found.'

      });

      return;

    }


    /* =====================================================
       VALIDATION
    ===================================================== */

    const validation =
      validateVehicleDocument(

        req.body,

        Boolean(
          req.file
        )

      );


    if (
      !validation.valid
    ) {

      removeUploadedFile(
        req.file
      );


      res.status(400).json({

        success: false,

        message:
          'Document validation failed.',

        errors:
          validation.errors

      });

      return;

    }


    if (!req.file) {

      res.status(400).json({

        success: false,

        message:
          'Document file is required.'

      });

      return;

    }


    /* =====================================================
       NORMALIZE
    ===================================================== */

    const documentType =
      String(
        req.body.documentType
      )
        .trim() as
          DocumentTypeValue;


    const title =
      String(
        req.body.title
      ).trim();


    const documentNumberValue =
      String(
        req.body.documentNumber ??
        ''
      ).trim();


    const providerValue =
      String(
        req.body.provider ??
        ''
      ).trim();


    const issueDateValue =
      String(
        req.body.issueDate ??
        ''
      ).trim();


    const expiryDateValue =
      String(
        req.body.expiryDate ??
        ''
      ).trim();


    const notesValue =
      String(
        req.body.notes ??
        ''
      ).trim();


    const issueDate =
      issueDateValue
        ? new Date(
            `${issueDateValue}T00:00:00.000Z`
          )
        : null;


    const expiryDate =
      expiryDateValue
        ? new Date(
            `${expiryDateValue}T00:00:00.000Z`
          )
        : null;


    const storedPath =
      relative(
        process.cwd(),
        req.file.path
      )
        .replace(
          /\\/g,
          '/'
        );


    /* =====================================================
       CREATE
    ===================================================== */

    const document =
      await prisma
        .vehicleDocument
        .create({

          data: {

            vehicleId,

            documentType,

            title,

            documentNumber:
              documentNumberValue ||
              null,

            provider:
              providerValue ||
              null,

            issueDate,

            expiryDate,

            filePath:
              storedPath,

            originalFileName:
              req.file.originalname,

            mimeType:
              req.file.mimetype,

            fileSize:
              req.file.size,

            notes:
              notesValue ||
              null

          }

        });


    res.status(201).json({

      success: true,

      message:
        'Vehicle document added successfully.',

      document:
        withComplianceStatus(
          document
        )

    });

  }

  catch (error) {

    removeUploadedFile(
      req.file
    );


    console.error(
      'Create document error:',
      error
    );


    res.status(500).json({

      success: false,

      message:
        'Unable to add vehicle document. Please try again.'

    });

  }

}


/* =========================================================
   GET ALL DOCUMENTS
========================================================= */

export async function getDocuments(
  req: Request,
  res: Response
): Promise<void> {

  try {

    const auth =
      getAuth(
        res
      );


    if (!auth) {

      res.status(401).json({

        success: false,

        message:
          'Authentication required.'

      });

      return;

    }


    const vehicleId =
      getVehicleId(
        req
      );


    if (
      !Number.isInteger(
        vehicleId
      ) ||
      vehicleId <= 0
    ) {

      res.status(400).json({

        success: false,

        message:
          'Invalid vehicle ID.'

      });

      return;

    }


    const vehicle =
      await findOwnedVehicle(
        vehicleId,
        auth.userId
      );


    if (!vehicle) {

      res.status(404).json({

        success: false,

        message:
          'Vehicle not found.'

      });

      return;

    }


    const documents =
      await prisma
        .vehicleDocument
        .findMany({

          where: {

            vehicleId

          },


          orderBy: [
            {
              expiryDate:
                'asc'
            },
            {
              createdAt:
                'desc'
            }
          ],
          include: {
            renewals: {
              orderBy: { createdAt: 'desc' },
              take: 1
            }
          }
        });


    const documentsWithStatus =
      documents.map(
        document =>
          withComplianceStatus(
            document
          )
      );


    const complianceAlertCount =
      documentsWithStatus
        .filter(
          document =>

            document.complianceStatus ===
              'EXPIRED' ||

            document.complianceStatus ===
              'EXPIRING_SOON'

        )
        .length;


    res.status(200).json({

      success: true,

      vehicle,

      count:
        documentsWithStatus.length,

      complianceAlertCount,

      documents:
        documentsWithStatus

    });

  }

  catch (error) {

    console.error(
      'Get documents error:',
      error
    );


    res.status(500).json({

      success: false,

      message:
        'Unable to load vehicle documents. Please try again.'

    });

  }

}


/* =========================================================
   GET ONE DOCUMENT
========================================================= */

export async function getDocumentById(
  req: Request,
  res: Response
): Promise<void> {

  try {

    const auth =
      getAuth(
        res
      );


    if (!auth) {

      res.status(401).json({

        success: false,

        message:
          'Authentication required.'

      });

      return;

    }


    const vehicleId =
      getVehicleId(
        req
      );


    const documentId =
      Number(
        req.params.documentId
      );


    if (
      !Number.isInteger(
        vehicleId
      ) ||
      vehicleId <= 0
    ) {

      res.status(400).json({

        success: false,

        message:
          'Invalid vehicle ID.'

      });

      return;

    }


    if (
      !Number.isInteger(
        documentId
      ) ||
      documentId <= 0
    ) {

      res.status(400).json({

        success: false,

        message:
          'Invalid document ID.'

      });

      return;

    }


    const vehicle =
      await findOwnedVehicle(
        vehicleId,
        auth.userId
      );


    if (!vehicle) {

      res.status(404).json({

        success: false,

        message:
          'Vehicle not found.'

      });

      return;

    }


    const document =
      await prisma
        .vehicleDocument
        .findFirst({

          where: {

            id:
              documentId,

            vehicleId

          }

        });


    if (!document) {

      res.status(404).json({

        success: false,

        message:
          'Vehicle document not found.'

      });

      return;

    }


    res.status(200).json({

      success: true,

      document:
        withComplianceStatus(
          document
        )

    });

  }

  catch (error) {

    console.error(
      'Get document error:',
      error
    );


    res.status(500).json({

      success: false,

      message:
        'Unable to load vehicle document. Please try again.'

    });

  }

}/* =========================================================
   CREATE RENEWAL REQUEST
========================================================= */

export async function createRenewalRequest(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const auth = getAuth(res);
    if (!auth) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const vehicleId = getVehicleId(req);
    const documentId = Number(req.params.documentId);

    if (!Number.isInteger(vehicleId) || vehicleId <= 0 || !Number.isInteger(documentId) || documentId <= 0) {
      res.status(400).json({ success: false, message: 'Invalid vehicle or document ID.' });
      return;
    }

    const vehicle = await findOwnedVehicle(vehicleId, auth.userId);
    if (!vehicle) {
      res.status(404).json({ success: false, message: 'Vehicle not found.' });
      return;
    }

    const document = await prisma.vehicleDocument.findFirst({
      where: { id: documentId, vehicleId }
    });
    if (!document) {
      res.status(404).json({ success: false, message: 'Document not found.' });
      return;
    }

    const existingRenewal = await prisma.documentRenewalRequest.findFirst({
      where: {
        documentId,
        status: { in: ['PENDING', 'ACCEPTED', 'IN_PROGRESS'] }
      }
    });

    if (existingRenewal) {
      res.status(400).json({ success: false, message: 'Renewal request already in progress.' });
      return;
    }

    const { providerType, preferredDate, notes } = req.body;

    let parsedPreferredDate = null;
    if (preferredDate) {
      parsedPreferredDate = new Date(preferredDate);
    }

    const renewal = await prisma.documentRenewalRequest.create({
      data: {
        ownerId: auth.userId,
        vehicleId,
        documentId,
        providerType: providerType || 'DRIVEMATE_EXPERT',
        preferredDate: parsedPreferredDate,
        notes: notes || null
      }
    });

    res.status(201).json({ success: true, message: 'Renewal request created successfully.', renewal });
  } catch (error) {
    console.error('Create renewal request error:', error);
    res.status(500).json({ success: false, message: 'Unable to submit renewal request. Please try again.' });
  }
}
