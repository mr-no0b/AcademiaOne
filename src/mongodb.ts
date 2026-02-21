import mongoose from "mongoose";

type MongooseCache = {
	conn: typeof mongoose | null;
	promise: Promise<typeof mongoose> | null;
};

declare global {
	// eslint-disable-next-line no-var
	var _mongooseCache: MongooseCache | undefined;
}

const cache: MongooseCache = global._mongooseCache ?? {
	conn: null,
	promise: null,
};

global._mongooseCache = cache;

export async function connectMongo(): Promise<typeof mongoose> {
	const MONGODB_URI = process.env.MONGODB_URI;
	if (!MONGODB_URI) {
		throw new Error("Missing MONGODB_URI in environment");
	}

	if (cache.conn) return cache.conn;

	if (!cache.promise) {
		cache.promise = mongoose.connect(MONGODB_URI, {
			dbName: "academiaone",
		});
	}

	cache.conn = await cache.promise;
	return cache.conn;
}
