import { NextApiRequest, NextApiResponse } from "next";
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

    const client = new MongoClient(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    await client.connect();
    cachedClient = client;
    return client;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const client = await connectToDatabase();
    const db = client.db(dbName);

    switch (req.method) {
        case "GET":
            try {
                const collection = db.collection("nft-metadata");
                const nftMetadata = await collection.find({}).toArray();
                res.status(200).json(nftMetadata);
            } catch (error) {
                res.status(500).json({ error: "Failed to fetch data" });
            }
            break;
        default:
            res.setHeader("Allow", ["GET"]);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
