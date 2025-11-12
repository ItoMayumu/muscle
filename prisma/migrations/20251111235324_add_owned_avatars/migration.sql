-- AlterTable
ALTER TABLE "User" ADD COLUMN     "ownedAvatars" TEXT[] DEFAULT ARRAY['/avatars/level1.png']::TEXT[];
