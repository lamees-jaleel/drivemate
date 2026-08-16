-- CreateTable
CREATE TABLE `expenses` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `vehicleId` INTEGER NOT NULL,
    `category` ENUM('FUEL', 'INSURANCE', 'PARKING', 'TOLL', 'ROAD_TAX', 'EMISSION_TEST', 'ACCESSORIES', 'WASH_CLEANING', 'OTHER') NOT NULL,
    `title` VARCHAR(120) NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `expenseDate` DATE NOT NULL,
    `odometerKm` INTEGER NULL,
    `merchant` VARCHAR(150) NULL,
    `notes` VARCHAR(1000) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `expenses_vehicleId_idx`(`vehicleId`),
    INDEX `expenses_expenseDate_idx`(`expenseDate`),
    INDEX `expenses_category_idx`(`category`),
    INDEX `expenses_vehicleId_expenseDate_idx`(`vehicleId`, `expenseDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `expenses` ADD CONSTRAINT `expenses_vehicleId_fkey` FOREIGN KEY (`vehicleId`) REFERENCES `vehicles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
