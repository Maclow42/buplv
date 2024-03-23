import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import prisma from '@/prisma/client';

export async function POST(req) {
	const data = await req.json();

	try{
		const response = await prisma.seller.create({
			data: {
				student_name: data.student_name,
				class: data.class,
				email: data.email,
				phone: data.phone,
				address: data.address,
				password: data.password,
			},
		});

		return NextResponse.json(response);
	}catch(error){
		console.error("Error parsing JSON:", error);
		return NextResponse.json({ error: "Invalid JSON input" }, { status: 400 });
	}

}