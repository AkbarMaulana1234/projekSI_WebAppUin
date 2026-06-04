import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";

export interface RevisionDocumentPair {
  before: string | null;
  after: string | null;
}

export interface RevisionArchiveEntry {
  id: string;
  rabId: number;
  createdAt: string;
  rab: RevisionDocumentPair;
  tor: RevisionDocumentPair;
}

const archiveRoot = () =>
  path.resolve(process.cwd(), "uploads", "revision-archive");

const metadataPath = (rabId: number) =>
  path.join(archiveRoot(), String(rabId), "revisions.json");

const normalizeUploadPath = (filePath?: string | null) =>
  filePath ? filePath.replace(/\\/g, "/") : null;

export const readRevisionArchive = async (
  rabId: number,
): Promise<RevisionArchiveEntry[]> => {
  const filePath = metadataPath(rabId);
  if (!fsSync.existsSync(filePath)) return [];

  try {
    const raw = await fs.readFile(filePath, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const getRevisionArchiveEntry = async (
  rabId: number,
  revisionId: string,
) => {
  const revisions = await readRevisionArchive(rabId);
  return revisions.find((entry) => entry.id === revisionId) || null;
};

export const resolveRevisionFilePath = (
  entry: RevisionArchiveEntry,
  documentType: "rab" | "tor",
  side: "before" | "after",
) => {
  const storedPath = entry[documentType]?.[side];
  if (!storedPath) return null;

  const cwd = process.cwd();
  const absolutePath = path.resolve(cwd, storedPath);
  if (!absolutePath.startsWith(cwd)) return null;
  return absolutePath;
};

export const saveRevisionArchiveEntry = async (
  rabId: number,
  entry: Omit<RevisionArchiveEntry, "id" | "rabId" | "createdAt">,
) => {
  const dir = path.join(archiveRoot(), String(rabId));
  await fs.mkdir(dir, { recursive: true });

  const revisions = await readRevisionArchive(rabId);
  const now = new Date();
  const archiveEntry: RevisionArchiveEntry = {
    id: now.getTime().toString(),
    rabId,
    createdAt: now.toISOString(),
    rab: {
      before: normalizeUploadPath(entry.rab.before),
      after: normalizeUploadPath(entry.rab.after),
    },
    tor: {
      before: normalizeUploadPath(entry.tor.before),
      after: normalizeUploadPath(entry.tor.after),
    },
  };

  revisions.push(archiveEntry);
  await fs.writeFile(metadataPath(rabId), JSON.stringify(revisions, null, 2));
  return archiveEntry;
};
