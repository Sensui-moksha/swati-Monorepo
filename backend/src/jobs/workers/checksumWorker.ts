import { Worker, Job } from "bullmq";
import crypto from "crypto";
import fs from "fs";
import { env } from "../../config/index";
import { QUEUES, registerWorker } from "../queueManager";
import { streamingRepository } from "../../repositories/StreamingRepository";
import { storageRepository } from "../../repositories/StorageRepository";

interface ChecksumJobData {
  storagePathId: string;
  expectedSha256?: string;
}

export function startChecksumWorker(): Worker {
  const { Redis } = require("ioredis");
  const connection = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null });

  const worker = new Worker<ChecksumJobData>(
    QUEUES.CHECKSUM_VERIFICATION,
    async (_job: Job<ChecksumJobData>) => {
      const record = await streamingRepository.findPDFById(_job.data.storagePathId);
      if (!record?.metadata?.pdfPath) return;

      const pdfPath = record.metadata.pdfPath;
      let accessible = true;
      try {
        await fs.promises.access(pdfPath, fs.constants.R_OK);
      } catch {
        accessible = false;
      }

      if (!accessible) {
        await storageRepository.updateById(record._id, { status: "missing" });
        console.warn(`[ChecksumWorker] Missing: ${pdfPath}`);
        return;
      }

      // Compute SHA-256 via stream — never loads whole PDF into memory
      const actualSha256 = await computeSha256Stream(pdfPath);

      if (_job.data.expectedSha256 && actualSha256 !== _job.data.expectedSha256) {
        await storageRepository.updateById(record._id, { status: "corrupted" });
        console.error(`[ChecksumWorker] Corrupted: ${pdfPath} — expected ${_job.data.expectedSha256}, got ${actualSha256}`);
        return;
      }

      await streamingRepository.updateChecksumSha256(record._id, actualSha256);
      console.log(`[ChecksumWorker] Verified: ${pdfPath}`);
    },
    { connection, concurrency: 3 },
  );

  worker.on("failed", (_job, err) => {
    console.error("[ChecksumWorker] Failed:", err.message);
  });

  registerWorker(worker);
  return worker;
}

function computeSha256Stream(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash("sha256");
    const stream = fs.createReadStream(filePath, { highWaterMark: 64 * 1024 });
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("end", () => resolve(hash.digest("hex")));
    stream.on("error", reject);
  });
}
