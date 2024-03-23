import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import prisma from '@/prisma/client';

export async function GET(req) {
	try {
	  const data = await req.json();
	  console.log(data);
  
	  if (!data.name) {
		return NextResponse.json({ message: "Missing name" }, { status: 400 });
	  }
  
	  const sellers = await prisma.seller.findMany({
		where: {
		  name: {
			contains: req.query.name,
		  },
		},
	  });
  
	  return NextResponse.json(sellers);
	} catch (error) {
	  console.error("Error parsing JSON:", error);
	  return NextResponse.json({ error: "Invalid JSON input" }, { status: 400 });
	}
  }
  

export async function POST(req) {
	const data = await req.json();

	const response = await prisma.seller.findFirst({
		where: {
			student_name: data.name,
		},
	});

	return NextResponse.json(response);
}


