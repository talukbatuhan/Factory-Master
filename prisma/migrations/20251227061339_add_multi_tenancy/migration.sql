/*
  Warnings:

  - You are about to drop the column `createdAt` on the `BOMItem` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `BOMItem` table. All the data in the column will be lost.
  - You are about to drop the column `parentPartId` on the `BOMItem` table. All the data in the column will be lost.
  - You are about to drop the column `sortOrder` on the `BOMItem` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `BOMItem` table. All the data in the column will be lost.
  - You are about to drop the column `reference` on the `InventoryTransaction` table. All the data in the column will be lost.
  - You are about to drop the column `transactionDate` on the `InventoryTransaction` table. All the data in the column will be lost.
  - You are about to alter the column `balanceAfter` on the `InventoryTransaction` table. The data in that column could be lost. The data in that column will be cast from `Float` to `Int`.
  - You are about to alter the column `quantity` on the `InventoryTransaction` table. The data in that column could be lost. The data in that column will be cast from `Float` to `Int`.
  - You are about to drop the column `createdById` on the `Part` table. All the data in the column will be lost.
  - You are about to drop the column `currentRevision` on the `Part` table. All the data in the column will be lost.
  - You are about to drop the column `parentId` on the `Part` table. All the data in the column will be lost.
  - You are about to drop the column `partType` on the `Part` table. All the data in the column will be lost.
  - You are about to alter the column `reorderLevel` on the `Part` table. The data in that column could be lost. The data in that column will be cast from `Float` to `Int`.
  - You are about to alter the column `stockQuantity` on the `Part` table. The data in that column could be lost. The data in that column will be cast from `Float` to `Int`.
  - You are about to drop the column `changeDescription` on the `PartRevision` table. All the data in the column will be lost.
  - You are about to drop the column `createdById` on the `PartRevision` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `PartRevision` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `ProcessStep` table. All the data in the column will be lost.
  - You are about to drop the column `estimatedDuration` on the `ProcessStep` table. All the data in the column will be lost.
  - You are about to drop the column `machineRequired` on the `ProcessStep` table. All the data in the column will be lost.
  - You are about to drop the column `partId` on the `ProcessStep` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `ProcessStep` table. All the data in the column will be lost.
  - You are about to drop the column `stepOrder` on the `ProcessStep` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `ProcessStep` table. All the data in the column will be lost.
  - You are about to drop the column `completedDate` on the `ProductionOrder` table. All the data in the column will be lost.
  - You are about to alter the column `quantity` on the `ProductionOrder` table. The data in that column could be lost. The data in that column will be cast from `Float` to `Int`.
  - You are about to drop the column `createdAt` on the `SupplierPart` table. All the data in the column will be lost.
  - You are about to drop the column `productURL` on the `SupplierPart` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `SupplierPart` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - Added the required column `partId` to the `BOMItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `InventoryTransaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `Part` table without a default value. This is not possible if the table is not empty.
  - Added the required column `partId` to the `Process` table without a default value. This is not possible if the table is not empty.
  - Added the required column `order` to the `ProcessStep` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `ProductionOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `Supplier` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `passwordHash` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "taxId" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "website" TEXT,
    "logo" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BOMItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "partId" TEXT NOT NULL,
    "componentPartId" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'pcs',
    CONSTRAINT "BOMItem_partId_fkey" FOREIGN KEY ("partId") REFERENCES "Part" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BOMItem_componentPartId_fkey" FOREIGN KEY ("componentPartId") REFERENCES "Part" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_BOMItem" ("componentPartId", "id", "quantity", "unit") SELECT "componentPartId", "id", "quantity", "unit" FROM "BOMItem";
DROP TABLE "BOMItem";
ALTER TABLE "new_BOMItem" RENAME TO "BOMItem";
CREATE UNIQUE INDEX "BOMItem_partId_componentPartId_key" ON "BOMItem"("partId", "componentPartId");
CREATE TABLE "new_InventoryTransaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "partId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "balanceAfter" INTEGER NOT NULL,
    "referenceId" TEXT,
    "notes" TEXT,
    "recordedById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InventoryTransaction_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "InventoryTransaction_partId_fkey" FOREIGN KEY ("partId") REFERENCES "Part" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "InventoryTransaction_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_InventoryTransaction" ("balanceAfter", "id", "notes", "partId", "quantity", "recordedById", "type") SELECT "balanceAfter", "id", "notes", "partId", "quantity", "recordedById", "type" FROM "InventoryTransaction";
DROP TABLE "InventoryTransaction";
ALTER TABLE "new_InventoryTransaction" RENAME TO "InventoryTransaction";
CREATE TABLE "new_Part" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "partNumber" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL DEFAULT 'COMPONENT',
    "materialType" TEXT,
    "stockQuantity" INTEGER NOT NULL DEFAULT 0,
    "unit" TEXT NOT NULL DEFAULT 'pcs',
    "reorderLevel" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Part_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Part" ("createdAt", "description", "id", "materialType", "name", "partNumber", "reorderLevel", "stockQuantity", "unit", "updatedAt") SELECT "createdAt", "description", "id", "materialType", "name", "partNumber", "reorderLevel", "stockQuantity", "unit", "updatedAt" FROM "Part";
DROP TABLE "Part";
ALTER TABLE "new_Part" RENAME TO "Part";
CREATE UNIQUE INDEX "Part_companyId_partNumber_key" ON "Part"("companyId", "partNumber");
CREATE TABLE "new_PartFile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "partId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "originalPath" TEXT,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER,
    "revision" TEXT,
    "uploadedById" TEXT NOT NULL,
    "uploadedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PartFile_partId_fkey" FOREIGN KEY ("partId") REFERENCES "Part" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PartFile_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_PartFile" ("fileName", "filePath", "fileSize", "fileType", "id", "originalPath", "partId", "revision", "uploadedAt", "uploadedById") SELECT "fileName", "filePath", "fileSize", "fileType", "id", "originalPath", "partId", "revision", "uploadedAt", "uploadedById" FROM "PartFile";
DROP TABLE "PartFile";
ALTER TABLE "new_PartFile" RENAME TO "PartFile";
CREATE TABLE "new_PartRevision" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "partId" TEXT NOT NULL,
    "revision" TEXT NOT NULL,
    "description" TEXT,
    "changeLog" TEXT,
    "approvedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PartRevision_partId_fkey" FOREIGN KEY ("partId") REFERENCES "Part" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_PartRevision" ("createdAt", "id", "partId", "revision") SELECT "createdAt", "id", "partId", "revision" FROM "PartRevision";
DROP TABLE "PartRevision";
ALTER TABLE "new_PartRevision" RENAME TO "PartRevision";
CREATE TABLE "new_Process" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "partId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Process_partId_fkey" FOREIGN KEY ("partId") REFERENCES "Part" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Process" ("createdAt", "description", "id", "name", "updatedAt") SELECT "createdAt", "description", "id", "name", "updatedAt" FROM "Process";
DROP TABLE "Process";
ALTER TABLE "new_Process" RENAME TO "Process";
CREATE UNIQUE INDEX "Process_partId_key" ON "Process"("partId");
CREATE TABLE "new_ProcessStep" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "processId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "machine" TEXT,
    "setupTime" INTEGER,
    "cycleTime" INTEGER,
    CONSTRAINT "ProcessStep_processId_fkey" FOREIGN KEY ("processId") REFERENCES "Process" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ProcessStep" ("description", "id", "name", "processId") SELECT "description", "id", "name", "processId" FROM "ProcessStep";
DROP TABLE "ProcessStep";
ALTER TABLE "new_ProcessStep" RENAME TO "ProcessStep";
CREATE TABLE "new_ProductionOrder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "partId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PLANNED',
    "startDate" DATETIME,
    "targetDate" DATETIME,
    "completionDate" DATETIME,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdById" TEXT,
    CONSTRAINT "ProductionOrder_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProductionOrder_partId_fkey" FOREIGN KEY ("partId") REFERENCES "Part" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ProductionOrder_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ProductionOrder" ("createdAt", "createdById", "id", "notes", "orderNumber", "partId", "quantity", "startDate", "status", "targetDate", "updatedAt") SELECT "createdAt", "createdById", "id", "notes", "orderNumber", "partId", "quantity", "startDate", "status", "targetDate", "updatedAt" FROM "ProductionOrder";
DROP TABLE "ProductionOrder";
ALTER TABLE "new_ProductionOrder" RENAME TO "ProductionOrder";
CREATE UNIQUE INDEX "ProductionOrder_companyId_orderNumber_key" ON "ProductionOrder"("companyId", "orderNumber");
CREATE TABLE "new_Supplier" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'LOCAL',
    "contactPerson" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "address" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Supplier_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Supplier" ("address", "contactPerson", "createdAt", "email", "id", "name", "notes", "phone", "type", "updatedAt", "website") SELECT "address", "contactPerson", "createdAt", "email", "id", "name", "notes", "phone", "type", "updatedAt", "website" FROM "Supplier";
DROP TABLE "Supplier";
ALTER TABLE "new_Supplier" RENAME TO "Supplier";
CREATE TABLE "new_SupplierPart" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "supplierId" TEXT NOT NULL,
    "partId" TEXT NOT NULL,
    "supplierSKU" TEXT,
    "unitPrice" REAL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "leadTimeDays" INTEGER,
    "minOrderQty" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "SupplierPart_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SupplierPart_partId_fkey" FOREIGN KEY ("partId") REFERENCES "Part" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_SupplierPart" ("currency", "id", "leadTimeDays", "partId", "supplierId", "supplierSKU", "unitPrice") SELECT "currency", "id", "leadTimeDays", "partId", "supplierId", "supplierSKU", "unitPrice" FROM "SupplierPart";
DROP TABLE "SupplierPart";
ALTER TABLE "new_SupplierPart" RENAME TO "SupplierPart";
CREATE UNIQUE INDEX "SupplierPart_supplierId_partId_key" ON "SupplierPart"("supplierId", "partId");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'OPERATOR',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "User_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_User" ("createdAt", "email", "id", "name", "role", "updatedAt") SELECT "createdAt", "email", "id", "name", "role", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_companyId_email_key" ON "User"("companyId", "email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Company_taxId_key" ON "Company"("taxId");
