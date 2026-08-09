"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { marked } from "marked";
import DOMPurify from "dompurify";
import ModalImageUploader from "@/components/ui/image-uploader";
import type {
  ImageUploadModalRef,
  UploadedImage,
} from "@/components/ui/image-uploader/_types";
import {
  Bold,
  Eye,
  EyeOff,
  Heading1,
  Heading2,
  ImageIcon,
  Italic,
  List,
  ListOrdered,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BlogEditorProps {
  initialContent?: string;
  initialContentType?: "html" | "markdown";
  onContentChange?: (html: string) => void;
  placeholder?: string;
  className?: string;
}

function sanitizePreview(html: string): string {
  return DOMPurify.sanitize(html);
}

export function BlogEditor({
  initialContent = "",
  initialContentType = "html",
  onContentChange,
  placeholder = "Tulis konten artikel di sini...",
  className,
}: BlogEditorProps) {
  const [isPreview, setIsPreview] = useState(false);
  const [isContentLoaded, setIsContentLoaded] = useState(false);
  const [previewContent, setPreviewContent] = useState(initialContent);
  const [previewFormat, setPreviewFormat] = useState<"html" | "markdown">(
    initialContentType
  );
  const imageUploaderRef = useRef<ImageUploadModalRef>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      ImageExtension.configure({
        inline: false,
        allowBase64: false,
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    editorProps: {
      attributes: {
        class:
          "prose prose-stone dark:prose-invert max-w-none focus:outline-none min-h-[400px] px-4 py-3",
      },
    },
    immediatelyRender: false,
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML();
      setPreviewContent(html);
      setPreviewFormat("html");
      onContentChange?.(html);
    },
  });

  useEffect(() => {
    if (!editor || !initialContent || isContentLoaded) return;

    const loadContent = async () => {
      let html: string;
      try {
        if (initialContentType === "markdown") {
          html = (await marked.parse(initialContent)) as string;
          editor.commands.setContent(html);
        } else {
          html = initialContent;
          editor.commands.setContent(html);
        }
      } catch {
        html = `<p>${initialContent.replace(/\n/g, "</p><p>")}</p>`;
        editor.commands.setContent(html);
      }
      onContentChange?.(html);
      setIsContentLoaded(true);
    };

    loadContent();
  }, [editor, initialContent, initialContentType, isContentLoaded, onContentChange]);

  useEffect(() => {
    return () => {
      editor?.destroy();
    };
  }, [editor]);

  const handleImageUploadComplete = useCallback(
    (images: UploadedImage[]) => {
      if (!editor) return;
      images.forEach((img) => {
        const url = img.url;
        editor.chain().focus().setImage({ src: url }).run();
      });
    },
    [editor]
  );

  if (!editor) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-3xl border border-border bg-card",
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-1 border-b border-border bg-muted/40 px-3 py-2">
        <ToolbarButton
          icon={Bold}
          label="Bold"
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
        />
        <ToolbarButton
          icon={Italic}
          label="Italic"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
        />
        <ToolbarButton
          icon={Heading1}
          label="Heading 1"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive("heading", { level: 1 })}
        />
        <ToolbarButton
          icon={Heading2}
          label="Heading 2"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive("heading", { level: 2 })}
        />
        <ToolbarButton
          icon={List}
          label="Bullet List"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
        />
        <ToolbarButton
          icon={ListOrdered}
          label="Ordered List"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
        />

        <div className="mx-1 h-5 w-px bg-border" />

        <button
          type="button"
          onClick={() => imageUploaderRef.current?.open()}
          className="rounded-full p-2 transition-colors hover:bg-accent"
          title="Insert Image"
        >
          <ImageIcon className="h-4 w-4" />
        </button>

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsPreview((v) => !v)}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              isPreview
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent"
            )}
          >
            {isPreview ? (
              <>
                <EyeOff className="h-3.5 w-3.5" /> Edit
              </>
            ) : (
              <>
                <Eye className="h-3.5 w-3.5" /> Preview
              </>
            )}
          </button>
        </div>
      </div>

      {isPreview ? (
        <div className="prose prose-stone dark:prose-invert max-w-none px-4 py-3">
          <div
            dangerouslySetInnerHTML={{
              __html: sanitizePreview(previewContent || "<p>Konten masih kosong</p>"),
            }}
          />
        </div>
      ) : (
        <EditorContent editor={editor} />
      )}

      <ModalImageUploader
        ref={imageUploaderRef}
        title="Upload Gambar Artikel"
        description="Pilih gambar untuk dimasukkan ke artikel. Gambar dikompres otomatis."
        config={{
          maxFiles: 5,
          maxFileSize: 8,
          enableCrop: false,
          enableCompression: true,
          compressionOptions: {
            targetMaxSizeKB: 800,
            maxWidth: 1600,
            initialWebPQuality: 0.85,
          },
          enableMultiple: true,
          autoUpload: true,
        }}
        onUploadComplete={handleImageUploadComplete}
      />
    </div>
  );
}

function ToolbarButton({
  icon: Icon,
  label,
  onClick,
  isActive,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  isActive: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full p-2 transition-colors hover:bg-accent",
        isActive && "bg-primary text-primary-foreground hover:bg-primary"
      )}
      title={label}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
