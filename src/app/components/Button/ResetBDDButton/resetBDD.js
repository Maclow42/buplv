"use server";

import prisma from "@/app/lib/prisma";
import bcrypt from "bcryptjs";

export async function resetBDD(id, password) {
  try {
    const seller = await prisma.seller.findFirst({
      where: {
        id: id,
      },
      select: {
        password: true,
      },
    });

    // Compare password with hashed password
    const isCorrectPassword = bcrypt.compareSync(password, seller.password);

    // If password is incorrect, return error message
    if (!isCorrectPassword) throw new Error("Mot de passe incorrect.");

    await prisma.$executeRaw`SELECT public.reset_database()`;

    console.log("La base de données a été réinitialisée");

    return {
      success: true,
      msg: "La base de données a été réinitialisée.",
    };
  } catch (e) {
    console.log(e.message);
    return {
      success: false,
      msg: e.message,
    };
  }
}