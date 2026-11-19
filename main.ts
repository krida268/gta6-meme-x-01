// main.ts — titik masuk entry make.fun gta6-meme-x-01.
//
// Entry bounty ini adalah postingan X itu sendiri: berkas POST.json di
// direktori bot menamai URL postingan tersebut, dan grader membaca
// POST.json dari direktori output. Jadi satu-satunya tugas program ini
// adalah menyalin POST.json dari direktori bot ke direktori output,
// apa adanya, tanpa mengubah satu byte pun.
//
// Lokasi kedua direktori bisa diatur lewat environment variable:
//   MAKEFUN_BOT_DIR     (bawaan: /bot)
//   MAKEFUN_OUTPUT_DIR  (bawaan: /output)
// Di luar kontainer grader, kedua variable itu menunjuk ke folder repo
// dan folder keluaran lokal, misalnya:
//   MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts
//
// Program ini hanya memakai pustaka standar Node, tidak menyentuh
// jaringan maupun jam sistem, dan selalu menghasilkan keluaran yang
// sama untuk masukan yang sama.

import { copyFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import { join } from "node:path";

const POST_FILENAME = "POST.json";

function botDirectory(): string {
  return process.env.MAKEFUN_BOT_DIR ?? "/bot";
}

function outputDirectory(): string {
  return process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
}

// Berhenti dengan kode 1 dan pesan yang menjelaskan masalahnya, supaya
// kegagalan terlihat jelas di log grader alih-alih diam-diam lolos.
function abort(reason: string): never {
  console.error(`main.ts: ${reason}`);
  process.exit(1);
}

function run(): void {
  const sourcePath = join(botDirectory(), POST_FILENAME);
  const targetDir = outputDirectory();
  const targetPath = join(targetDir, POST_FILENAME);

  if (!existsSync(sourcePath)) {
    abort(`POST.json tidak ditemukan di direktori bot: ${sourcePath}`);
  }

  // Direktori output mungkin belum ada; buat dulu (beserta induknya).
  mkdirSync(targetDir, { recursive: true });

  try {
    copyFileSync(sourcePath, targetPath);
  } catch (err) {
    abort(
      `gagal menyalin ${sourcePath} ke ${targetPath}: ${(err as Error).message}`,
    );
  }

  // Verifikasi hasil salinan: ukuran berkas tujuan harus persis sama
  // dengan sumbernya. Salinan yang terpotong di tengah jalan akan
  // membuat grader menolak entry, jadi lebih baik gagal keras di sini
  // dengan pesan jelas daripada menyerahkan berkas yang rusak.
  const sourceSize = statSync(sourcePath).size;
  const targetSize = statSync(targetPath).size;
  if (targetSize !== sourceSize) {
    abort(
      `salinan tidak utuh: ${targetPath} berukuran ${targetSize} byte, ` +
        `padahal sumbernya ${sourceSize} byte`,
    );
  }
}

run();
