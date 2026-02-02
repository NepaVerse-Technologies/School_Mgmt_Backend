import dotenv from "dotenv";
dotenv.config();

import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seed() {
  console.log("🌱 Seeding database...");

  const roles = [
    "SUPERADMIN",
    "ADMIN",
    "ACCOUNTANT",
    "TEACHER",
    "STAFF",
    "STUDENT",
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role },
      update: {},
      create: { name: role },
    });
  }

  const superAdminRole = await prisma.role.findUnique({
    where: { name: "SUPERADMIN" },
  });

  const password = await bcrypt.hash("superadmin123", 10);

  await prisma.user.upsert({
    where: { email: "superadmin@system.com" },
    update: {},
    create: {
      name: "Super Admin",
      email: "superadmin@system.com",
      password,
      roleId: superAdminRole.id,
      schoolId: null,
    },
  });

  console.log("✅ Seeding complete");
}

seed()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
