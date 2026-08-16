-- CreateTable
CREATE TABLE `vehicles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ownerId` INTEGER NOT NULL,
    `registrationNumber` VARCHAR(20) NOT NULL,
    `make` VARCHAR(80) NOT NULL,
    `model` VARCHAR(80) NOT NULL,
    `variant` VARCHAR(80) NULL,
    `manufacturingYear` INTEGER NOT NULL,
    `fuelType` ENUM('PETROL', 'DIESEL', 'CNG', 'LPG', 'ELECTRIC', 'HYBRID', 'OTHER') NOT NULL,
    `transmission` ENUM('MANUAL', 'AUTOMATIC', 'AMT', 'CVT', 'DCT', 'OTHER') NULL,
    `color` VARCHAR(50) NULL,
    `vin` VARCHAR(50) NULL,
    `engineNumber` VARCHAR(50) NULL,
    `odometerKm` INTEGER NOT NULL DEFAULT 0,
    `purchaseDate` DATE NULL,
    `ownershipType` ENUM('OWNED', 'FINANCED', 'LEASED') NOT NULL DEFAULT 'OWNED',
    `status` ENUM('ACTIVE', 'SOLD', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `vehicles_registrationNumber_key`(`registrationNumber`),
    UNIQUE INDEX `vehicles_vin_key`(`vin`),
    UNIQUE INDEX `vehicles_engineNumber_key`(`engineNumber`),
    INDEX `vehicles_ownerId_idx`(`ownerId`),
    INDEX `vehicles_make_model_idx`(`make`, `model`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `vehicles` ADD CONSTRAINT `vehicles_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
