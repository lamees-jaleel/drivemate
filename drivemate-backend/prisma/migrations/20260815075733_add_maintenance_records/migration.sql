-- CreateTable
CREATE TABLE `maintenance_records` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `vehicleId` INTEGER NOT NULL,
    `maintenanceType` ENUM('ROUTINE_SERVICE', 'OIL_CHANGE', 'REPAIR', 'TYRE_SERVICE', 'BATTERY_SERVICE', 'INSPECTION', 'OTHER') NOT NULL,
    `title` VARCHAR(120) NOT NULL,
    `serviceDate` DATE NOT NULL,
    `odometerKm` INTEGER NOT NULL,
    `serviceCenter` VARCHAR(150) NULL,
    `description` VARCHAR(1000) NULL,
    `cost` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `nextServiceDate` DATE NULL,
    `nextServiceOdometerKm` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `maintenance_records_vehicleId_idx`(`vehicleId`),
    INDEX `maintenance_records_serviceDate_idx`(`serviceDate`),
    INDEX `maintenance_records_nextServiceDate_idx`(`nextServiceDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `maintenance_records` ADD CONSTRAINT `maintenance_records_vehicleId_fkey` FOREIGN KEY (`vehicleId`) REFERENCES `vehicles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
