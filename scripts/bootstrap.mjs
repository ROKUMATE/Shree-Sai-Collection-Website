// Production bootstrap: runs on every container start (idempotent).
// Creates the four base categories and an admin user from env vars if none exists.
// Plain Node + generated Prisma client only — no dev dependencies needed.

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

const CATEGORIES = [
  { name: "Sarees", slug: "sarees", tagline: "Handpicked weaves for every occasion" },
  { name: "Dress Material", slug: "dress-material", tagline: "Unstitched suits & fabrics" },
  { name: "Jewellery", slug: "jewellery", tagline: "Traditional pieces that hold their shine" },
  { name: "Cosmetics", slug: "cosmetics", tagline: "Everyday beauty essentials" },
];

async function main() {
  for (const c of CATEGORIES) {
    await db.category.upsert({ where: { slug: c.slug }, update: {}, create: c });
  }

  const admins = await db.user.count({ where: { role: "ADMIN" } });
  if (admins === 0) {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    if (!email || !password) {
      console.warn(
        "No admin user exists and ADMIN_EMAIL/ADMIN_PASSWORD are not set — skipping admin creation."
      );
      return;
    }
    await db.user.create({
      data: {
        name: process.env.ADMIN_NAME || "Store Admin",
        email: email.toLowerCase(),
        password: await bcrypt.hash(password, 10),
        role: "ADMIN",
      },
    });
    console.log(`Created admin user ${email}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
