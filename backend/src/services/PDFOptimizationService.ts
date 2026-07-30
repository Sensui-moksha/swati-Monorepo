import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { Types } from "mongoose";
import { env } from "../config/index";
import { optimizationRepository } from "../repositories/OptimizationRepository";
import { streamingRepository } from "../repositories/StreamingRepository";
import { OptimizationProvider } from "../models/PDFOptimizationJob";

interface OptimizationResult {
  outputPath: string;
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number;
}

export class PDFOptimizationService {
  private availableProvider: OptimizationProvider | null = null;
  private providerDetected = false;

  /** Detect installed CLI tools at startup. Called once. */
  async detectAvailableProvider(): Promise<OptimizationProvider | null> {
    if (this.providerDetected) return this.availableProvider;

    const configured = env.PDF_OPTIMIZATION_PROVIDER;
    if (configured !== "auto") {
      const ok = await this.checkBinary(this.getBinaryName(configured as OptimizationProvider));
      this.availableProvider = ok ? (configured as OptimizationProvider) : null;
      this.providerDetected = true;
      return this.availableProvider;
    }

    // Auto-detect in preference order
    const candidates: OptimizationProvider[] = ["qpdf", "ghostscript", "mupdf", "ocrmypdf"];
    for (const provider of candidates) {
      if (await this.checkBinary(this.getBinaryName(provider))) {
        this.availableProvider = provider;
        this.providerDetected = true;
        console.log(`[PDFOptimizationService] Using provider: ${provider}`);
        return provider;
      }
    }

    this.providerDetected = true;
    console.warn("[PDFOptimizationService] No optimization tool found. Install qpdf, ghostscript, mutool, or ocrmypdf.");
    return null;
  }

  private getBinaryName(provider: OptimizationProvider): string {
    return { qpdf: "qpdf", ghostscript: "gs", mupdf: "mutool", ocrmypdf: "ocrmypdf" }[provider];
  }

  private checkBinary(name: string): Promise<boolean> {
    return new Promise((resolve) => {
      const child = spawn("which", [name], { stdio: "ignore" });
      child.on("close", (code) => resolve(code === 0));
      child.on("error", () => resolve(false));
    });
  }

  /**
   * Optimize a PDF. Original file is NEVER modified.
   * Output goes to PDF_OPTIMIZED_DIR/<sha-based-subpath>.pdf
   */
  async optimizePDF(
    originalPath: string,
    outputDir: string,
  ): Promise<OptimizationResult> {
    const provider = await this.detectAvailableProvider();
    if (!provider) throw new Error("No PDF optimization tool available");

    await fs.promises.mkdir(outputDir, { recursive: true });
    const outputPath = path.join(outputDir, path.basename(originalPath));

    const originalSize = (await fs.promises.stat(originalPath)).size;

    await this.runOptimizer(provider, originalPath, outputPath);

    const optimizedSize = (await fs.promises.stat(outputPath)).size;
    const compressionRatio = originalSize > 0 ? optimizedSize / originalSize : 1;

    return { outputPath, originalSize, optimizedSize, compressionRatio };
  }

  private runOptimizer(
    provider: OptimizationProvider,
    inputPath: string,
    outputPath: string,
  ): Promise<void> {
    const commands: Record<OptimizationProvider, { bin: string; args: string[] }> = {
      qpdf: {
        bin: "qpdf",
        args: ["--linearize", "--object-streams=generate", inputPath, outputPath],
      },
      ghostscript: {
        bin: "gs",
        args: [
          "-dBATCH", "-dNOPAUSE", "-sDEVICE=pdfwrite",
          "-dCompatibilityLevel=1.4",
          "-dPDFSETTINGS=/ebook",
          "-dFastWebView=true",
          `-sOutputFile=${outputPath}`,
          inputPath,
        ],
      },
      mupdf: {
        bin: "mutool",
        args: ["clean", "-gggg", "-z", inputPath, outputPath],
      },
      ocrmypdf: {
        bin: "ocrmypdf",
        args: ["--optimize", "3", "--skip-text", inputPath, outputPath],
      },
    };

    const { bin, args } = commands[provider];

    return new Promise((resolve, reject) => {
      const child = spawn(bin, args, { stdio: ["ignore", "ignore", "pipe"] });
      let stderr = "";
      child.stderr?.on("data", (d: Buffer) => { stderr += d.toString(); });
      child.on("close", (code) => {
        if (code === 0) resolve();
        else reject(new Error(`${bin} exited ${code}: ${stderr.slice(0, 200)}`));
      });
      child.on("error", (err) => reject(new Error(`Failed to spawn ${bin}: ${err.message}`)));
    });
  }

  /**
   * Queue a PDF for optimization (called by worker or API endpoint).
   * Idempotent — skips if already done or in-progress.
   */
  async queueOptimization(
    storagePathId: string | Types.ObjectId,
    originalPath: string,
  ): Promise<{ jobId: string; skipped: boolean }> {
    const existing = await optimizationRepository.findByStoragePath(storagePathId);
    if (existing && ["pending", "processing", "done"].includes(existing.status)) {
      return { jobId: existing._id.toString(), skipped: true };
    }

    const job = await optimizationRepository.createJob(storagePathId, originalPath);
    return { jobId: job._id.toString(), skipped: false };
  }

  /**
   * Process one pending job. Called by the optimization worker.
   */
  async processJob(jobId: string): Promise<void> {
    const job = await optimizationRepository.findById(jobId);
    if (!job) throw new Error(`Job ${jobId} not found`);
    if (job.attempt >= job.maxAttempts) {
      await optimizationRepository.markFailed(jobId, "Max attempts exceeded");
      return;
    }

    const provider = await this.detectAvailableProvider();
    if (!provider) {
      await optimizationRepository.markFailed(jobId, "No optimization provider available");
      return;
    }

    await optimizationRepository.markProcessing(jobId, provider);
    await streamingRepository.updateOptimizationStatus(job.storagePathId, "processing");

    try {
      const outputDir = path.join(
        env.PDF_OPTIMIZED_DIR,
        job.storagePathId.toString().slice(0, 2),
      );
      const result = await this.optimizePDF(job.originalPath, outputDir);

      await optimizationRepository.markDone(
        jobId,
        result.outputPath,
        result.originalSize,
        result.optimizedSize,
      );
      await streamingRepository.markOptimized(job.storagePathId, result.outputPath);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await optimizationRepository.markFailed(jobId, message);
      await streamingRepository.updateOptimizationStatus(job.storagePathId, "failed");
    }
  }
}

export const pdfOptimizationService = new PDFOptimizationService();
