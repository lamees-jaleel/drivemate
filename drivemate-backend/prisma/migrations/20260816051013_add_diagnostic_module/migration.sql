-- CreateTable
CREATE TABLE `diagnostic_requests` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `vehicleId` INTEGER NOT NULL,
    `expertId` INTEGER NULL,
    `concernType` ENUM('ENGINE', 'TRANSMISSION', 'BRAKES', 'ELECTRICAL', 'BATTERY', 'TYRES_SUSPENSION', 'OVERHEATING', 'WARNING_LIGHT', 'NOISE_VIBRATION', 'FUEL_EFFICIENCY', 'OTHER') NOT NULL,
    `urgency` ENUM('LOW', 'NORMAL', 'HIGH') NOT NULL DEFAULT 'NORMAL',
    `title` VARCHAR(120) NOT NULL,
    `symptoms` VARCHAR(1500) NOT NULL,
    `odometerKm` INTEGER NULL,
    `status` ENUM('PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `acceptedAt` DATETIME(3) NULL,
    `startedAt` DATETIME(3) NULL,
    `completedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `diagnostic_requests_vehicleId_idx`(`vehicleId`),
    INDEX `diagnostic_requests_expertId_idx`(`expertId`),
    INDEX `diagnostic_requests_status_idx`(`status`),
    INDEX `diagnostic_requests_createdAt_idx`(`createdAt`),
    INDEX `diagnostic_requests_concernType_idx`(`concernType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `diagnostic_reports` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `requestId` INTEGER NOT NULL,
    `findings` VARCHAR(2000) NOT NULL,
    `suspectedCause` VARCHAR(1500) NULL,
    `severity` ENUM('MINOR', 'MODERATE', 'MAJOR', 'CRITICAL') NOT NULL,
    `safeToDrive` BOOLEAN NOT NULL,
    `recommendedAction` VARCHAR(2000) NOT NULL,
    `estimatedRepairCost` DECIMAL(10, 2) NULL,
    `followUpRequired` BOOLEAN NOT NULL DEFAULT false,
    `followUpNotes` VARCHAR(1000) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `diagnostic_reports_requestId_key`(`requestId`),
    INDEX `diagnostic_reports_severity_idx`(`severity`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `diagnostic_requests` ADD CONSTRAINT `diagnostic_requests_vehicleId_fkey` FOREIGN KEY (`vehicleId`) REFERENCES `vehicles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `diagnostic_requests` ADD CONSTRAINT `diagnostic_requests_expertId_fkey` FOREIGN KEY (`expertId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `diagnostic_reports` ADD CONSTRAINT `diagnostic_reports_requestId_fkey` FOREIGN KEY (`requestId`) REFERENCES `diagnostic_requests`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
