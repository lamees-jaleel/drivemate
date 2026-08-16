-- CreateTable
CREATE TABLE `vehicle_documents` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `vehicleId` INTEGER NOT NULL,
    `documentType` ENUM('REGISTRATION_CERTIFICATE', 'INSURANCE', 'POLLUTION_CERTIFICATE', 'ROAD_TAX', 'FITNESS_CERTIFICATE', 'WARRANTY', 'SERVICE_DOCUMENT', 'PURCHASE_INVOICE', 'OTHER') NOT NULL,
    `title` VARCHAR(150) NOT NULL,
    `documentNumber` VARCHAR(120) NULL,
    `provider` VARCHAR(150) NULL,
    `issueDate` DATE NULL,
    `expiryDate` DATE NULL,
    `filePath` VARCHAR(500) NULL,
    `originalFileName` VARCHAR(255) NULL,
    `mimeType` VARCHAR(100) NULL,
    `fileSize` INTEGER NULL,
    `notes` VARCHAR(1000) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `vehicle_documents_vehicleId_idx`(`vehicleId`),
    INDEX `vehicle_documents_documentType_idx`(`documentType`),
    INDEX `vehicle_documents_expiryDate_idx`(`expiryDate`),
    INDEX `vehicle_documents_vehicleId_expiryDate_idx`(`vehicleId`, `expiryDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `vehicle_documents` ADD CONSTRAINT `vehicle_documents_vehicleId_fkey` FOREIGN KEY (`vehicleId`) REFERENCES `vehicles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
