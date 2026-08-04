import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

export class JsonStore<T> {
  constructor(
    private readonly filePath: string,
    private readonly fallback: T
  ) {}

  async read(): Promise<T> {
    try {
      const raw = await readFile(this.filePath, "utf8");
      return JSON.parse(raw) as T;
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      if (code === "ENOENT") return structuredClone(this.fallback);
      throw error;
    }
  }

  async write(value: T): Promise<void> {
    await mkdir(dirname(this.filePath), { recursive: true });
    await writeFile(this.filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  }

  async update(mutator: (value: T) => T | Promise<T>): Promise<T> {
    const current = await this.read();
    const next = await mutator(current);
    await this.write(next);
    return next;
  }
}