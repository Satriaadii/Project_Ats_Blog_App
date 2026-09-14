import express from "express";
import type { Request, Response } from "express";
import { z } from "zod";
import connection from "./db/index.ts";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

// Schema validasi Zod
const contentchema = z.object({
  category_id: z.string().min(1, "Category ID harus diisi"),
  title: z.string().min(1, "Title harus diisi"),
  content: z.string().min(1, "Content harus diisi"),
});

app.get("/api/posts", async (_req: Request, res: Response) => {
  try {
    const [content] = await connection.query("SELECT * FROM posts");

    return res.status(200).json({
      message: "Berhasil fetch post!",
      data: content,
    });
  } catch (_error) {
    return res.status(500).json({
      message: "Terjadi kesalahan server",
    });
  }
});

app.post("/api/posts", async (_req: Request, res: Response) => {
  try {
    const validated = contentchema.parse(_req.body);
    const { category_id, title, content } = validated;

    await connection.execute("INSERT INTO posts (category_id, title, content) VALUES (?, ?, ?)", [
      category_id,
      title,
      content
    ]);

    res.status(201).json({
      message: "Berhasil tambah post!",
    });
  }catch (error) {
    if (error instanceof z.ZodError) {
        return res.status(400).json({
            errors: error.issues.map((err) => ({
                field: err.path[0],
                message: err.message
            }))
        });
    } else {
      res.status(500).json({
        message: "Terjadi kesalahan server",
      });
    }
  }
});

app.put("/api/posts/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        message: "ID tidak valid",
      });
    }

    const validated = contentchema.parse(req.body);
    const { category_id, title, content } = validated;

    const [result] = await connection.execute(
      "UPDATE posts SET category_id = ?, title = ?, content = ? WHERE id = ?",
      [category_id, title, content, id]
    );

    if ((result as any).affectedRows === 0) {
      return res.status(404).json({
        message: "Post tidak ditemukan",
      });
    }

    res.status(200).json({
      message: "Berhasil update post!",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        errors: error.issues.map((err) => ({
          field: err.path[0],
          message: err.message,
        })),
      });
    }

    return res.status(500).json({
      message: "Terjadi kesalahan server",
    });
  }
});

app.delete("/api/posts/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        message: "ID tidak valid",
      });
    }

    const [result] = await connection.execute("DELETE FROM posts WHERE id = ?", [
      id,
    ]);
    
    if ((result as any).affectedRows === 0) {
      return res.status(404).json({
        message: "Post tidak ditemukan",
      });
    }

    res.status(200).json({
      message: "Berhasil hapus post!",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Terjadi kesalahan server",
    });
  }
});

app.get("/api/categories", async (_req: Request, res: Response) => {
  try {
    const [content] = await connection.query("SELECT * FROM categories");

    return res.status(200).json({
      message: "Berhasil fetch categories!",
      data: content,
    });
  } catch (_error) {
    return res.status(500).json({
      message: "Terjadi kesalahan server",
    });
  }
});

app.post("/api/categories", async (_req: Request, res: Response) => {
  try {
    const { nama } = _req.body;

    const [result] = await connection.execute("INSERT INTO categories (nama) VALUES (?)", [nama]);

    return res.status(201).json({
      message: "Berhasil create category!",
      data: { id: (result as any).insertId, nama: nama },
    });
  } catch (_error) {
    return res.status(500).json({
      message: "Terjadi kesalahan server",
    });
  }
});

app.put("/api/categories/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        message: "ID tidak valid",
      });
    }

    const { nama } = req.body;

    const [result] = await connection.execute("UPDATE categories SET nama = ? WHERE id = ?", [nama, id]);

    if ((result as any).affectedRows === 0) {
      return res.status(404).json({
        message: "Category tidak ditemukan",
      });
    }

    res.status(200).json({
      message: "Berhasil update category!",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Terjadi kesalahan server",
    });
  }
});

app.delete("/api/categories/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        message: "ID tidak valid",
      });
    }

    const [result] = await connection.execute("DELETE FROM categories WHERE id = ?", [id]);

    if ((result as any).affectedRows === 0) {
      return res.status(404).json({
        message: "Category tidak ditemukan",
      });
    }

    res.status(200).json({
      message: "Berhasil hapus category!",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Terjadi kesalahan server",
    });
  }
});

app.listen(3000, () => {
  console.log("Server berjalan di http://localhost:3000");
});
