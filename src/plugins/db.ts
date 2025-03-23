import { MongoClient, ReadPreference, Db, MongoClientOptions } from "mongodb";
import { Context } from "hono";

// 全局存储 MongoClient 和 Db 实例
let client: MongoClient | null = null;
let db: Db | null = null;

const uri = Deno.env.get("MONGODB_URI") || "";

if (!uri) {
  throw new Error("MONGODB_URI is not defined in environment variables");
}

// 连接池配置
const options: MongoClientOptions = {
  maxPoolSize: 50, // 最大连接池大小
  minPoolSize: 5, // 最小连接池大小

  // 超时配置
  serverSelectionTimeoutMS: 30000, // 选择服务器的超时时间
  socketTimeoutMS: 30000, // 套接字超时时间
  connectTimeoutMS: 30000, // 连接超时时间

  // 安全性配置
  ssl: true, // 启用SSL/TLS连接

  // 重试配置
  retryWrites: true, // 启用写操作重试
  retryReads: true, // 启用读操作重试

  // 读操作优先级
  readPreference: ReadPreference.PRIMARY_PREFERRED,
};

async function connectToMongo(uri: string): Promise<Db> {
  if (!client) {
    client = new MongoClient(uri, options);
    await client.connect();
  }
  return client.db();
}

// 获取或初始化数据库连接
export async function getDb(c: Context): Promise<Db> {
  if (!db) {
    db = await connectToMongo(uri);
  }
  return db;
}
