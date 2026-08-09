"use client";

import { useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { BlogCategoryForm } from "./blog-category-form";
import { BlogCategoryRowActions } from "./blog-category-row-actions";
import type { BlogCategory } from "@/lib/db/schema";
import { localizedFirst } from "@/lib/validations/blog";

export function BlogCategoriesManager({ categories }: { categories: BlogCategory[] }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<BlogCategory | null>(null);

  function openCreate() {
    setEditing(null);
    setOpen(true);
  }

  function openEdit(category: BlogCategory) {
    setEditing(category);
    setOpen(true);
  }

  return (
    <>
      <div className="flex justify-end">
        <Button onClick={openCreate} className="rounded-full">
          <Plus className="mr-2 h-4 w-4" />
          Tambah Kategori
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Kategori" : "Kategori Baru"}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? "Ubah nama, slug, atau deskripsi kategori."
                : "Buat kategori baru untuk artikel blog."}
            </DialogDescription>
          </DialogHeader>
          <BlogCategoryForm
            category={editing ?? undefined}
            onClose={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-secondary text-left text-muted-foreground">
            <th className="p-4 font-medium">Nama</th>
            <th className="p-4 font-medium">Slug</th>
            <th className="p-4 font-medium">Deskripsi</th>
            <th className="p-4 font-medium" />
          </tr>
        </thead>
        <tbody>
          {categories.length === 0 && (
            <tr>
              <td colSpan={4} className="p-8 text-center text-muted-foreground">
                Belum ada kategori. Buat kategori pertama supaya artikel bisa
                dikelompokkan.
              </td>
            </tr>
          )}
          {categories.map((cat) => (
            <tr
              key={cat.id}
              className="border-b border-secondary last:border-0 hover:bg-accent/40 transition-colors"
            >
              <td className="p-4 font-medium">{localizedFirst(cat.name)}</td>
              <td className="p-4 text-muted-foreground">/blog/category/{cat.slug}</td>
              <td className="max-w-md p-4 text-muted-foreground">
                <span className="line-clamp-1">{localizedFirst(cat.description) || "-"}</span>
              </td>
              <td className="p-4 text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="rounded-full"
                    onClick={() => openEdit(cat)}
                  >
                    <Pencil className="mr-1.5 h-3.5 w-3.5" />
                    Edit
                  </Button>
                  <BlogCategoryRowActions item={cat} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
