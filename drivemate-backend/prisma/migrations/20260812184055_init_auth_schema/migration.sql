-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fullName` VARCHAR(80) NOT NULL,
    `phone` VARCHAR(20) NOT NULL,
    `email` VARCHAR(150) NOT NULL,
    `address` VARCHAR(255) NOT NULL,
    `passwordHash` VARCHAR(255) NOT NULL,
    `role` ENUM('VEHICLE_OWNER', 'DIAGNOSTIC_EXPERT', 'COMPLIANCE_ADVISOR', 'ROADSIDE_RESPONDER', 'ADMIN') NOT NULL DEFAULT 'VEHICLE_OWNER',
    `accountStatus` ENUM('ACTIVE', 'PENDING_VERIFICATION', 'SUSPENDED', 'REJECTED') NOT NULL DEFAULT 'ACTIVE',
    `termsAccepted` BOOLEAN NOT NULL DEFAULT false,
    `termsAcceptedAt` DATETIME(3) NULL,
    `lastLoginAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_phone_key`(`phone`),
    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `professional_profiles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `qualification` VARCHAR(100) NOT NULL,
    `specialization` VARCHAR(120) NOT NULL,
    `yearsOfExperience` INTEGER NOT NULL,
    `organizationName` VARCHAR(150) NOT NULL,
    `certificateNumber` VARCHAR(100) NOT NULL,
    `serviceLocation` VARCHAR(150) NOT NULL,
    `verificationDocumentPath` VARCHAR(500) NOT NULL,
    `verificationStatus` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `verificationNote` VARCHAR(500) NULL,
    `reviewedById` INTEGER NULL,
    `reviewedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `professional_profiles_userId_key`(`userId`),
    INDEX `professional_profiles_verificationStatus_idx`(`verificationStatus`),
    INDEX `professional_profiles_certificateNumber_idx`(`certificateNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `professional_profiles` ADD CONSTRAINT `professional_profiles_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `professional_profiles` ADD CONSTRAINT `professional_profiles_reviewedById_fkey` FOREIGN KEY (`reviewedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
