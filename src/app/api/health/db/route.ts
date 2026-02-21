import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";

export async function GET() {
	try {
		const mongoose = await connectMongo();
		return NextResponse.json({
			ok: true,
			readyState: mongoose.connection.readyState,
			db: mongoose.connection.name,
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		return NextResponse.json(
			{ ok: false, error: message },
			{ status: 500 },
		);
	}
}
