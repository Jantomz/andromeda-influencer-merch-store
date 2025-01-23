import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

if (!uri || !dbName) {
    throw new Error(
        "Please define the MONGODB_URI and MONGODB_DB environment variables inside .env.local"
    );
}

let cachedClient: MongoClient | null = null;

async function connectToDatabase() {
    if (cachedClient) {
        return cachedClient;
    }

    const client = new MongoClient(uri as string, {});

    await client.connect();
    cachedClient = client;
    return client;
}

export async function GET(req: NextRequest) {
    const client = await connectToDatabase();
    const db = client.db(dbName);
    const { searchParams } = new URL(req.url);
    const params = Object.fromEntries(searchParams.entries());

    const tokenId = params.token_id;

    if (!tokenId) {
        return NextResponse.json(
            { error: "Please provide a token_id in query" },
            { status: 400 }
        );
    }

    try {
        const collection = db.collection("event-metadata");
        const nftMetadata = await collection.findOne(
            { token_id: tokenId },
            { projection: { _id: 0 } }
        );
        return NextResponse.json(nftMetadata, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch data" },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    const client = await connectToDatabase();
    const db = client.db(dbName);
    const data = await req.json();

    if (!data) {
        return NextResponse.json(
            { error: "Please provide data" },
            { status: 400 }
        );
    }

    const requiredFields = [
        "token_id",
        "name",
        "description",
        "image",
        "attributes",
    ];
    for (const field of requiredFields) {
        if (!data[field]) {
            return NextResponse.json(
                { error: `Missing required field: ${field}` },
                { status: 400 }
            );
        }
    }

    if (!Array.isArray(data.attributes)) {
        return NextResponse.json(
            { error: "Attributes must be an array" },
            { status: 400 }
        );
    }

    for (const attribute of data.attributes) {
        if (
            !attribute.display_type ||
            !attribute.trait_type ||
            !attribute.value
        ) {
            return NextResponse.json(
                {
                    error: "Each attribute must have display_type, trait_type, and value",
                },
                { status: 400 }
            );
        }

        if (
            attribute.trait_type === "tiers" &&
            !Array.isArray(attribute.value)
        ) {
            return NextResponse.json(
                { error: "Tiers attribute value must be an array" },
                { status: 400 }
            );
        }
    }

    try {
        const collection = db.collection("event-metadata");
        const nftMetadata = await collection.insertOne(data);
        return NextResponse.json(nftMetadata, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to insert data" },
            { status: 500 }
        );
    }
}
