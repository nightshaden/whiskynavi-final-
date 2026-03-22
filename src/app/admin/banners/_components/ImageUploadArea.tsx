"use client";

import { ImagePlus, Trash2 } from "lucide-react";
import Image from "next/image";
import { type DragEvent, type RefObject, useState } from "react";

interface ImageUploadAreaProps {
  label: string;
  name: string;
  previewUrl: string | null;
  inputRef: RefObject<HTMLInputElement | null>;
  onFileChange: (file: File | null) => void;
  onRemove: () => void;
}

export default function ImageUploadArea({
  label,
  name,
  previewUrl,
  inputRef,
  onFileChange,
  onRemove,
}: ImageUploadAreaProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith("image/")) {
      // input에도 파일을 설정해서 form 제출 시 포함되도록
      const dt = new DataTransfer();
      dt.items.add(file);
      if (inputRef.current) {
        inputRef.current.files = dt.files;
      }
      onFileChange(file);
    }
  };

  return (
    <div>
      <label className="typo-medium-14 mb-2 block text-gray-700">
        {label}
      </label>
      <input
        ref={inputRef}
        type="file"
        name={name}
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0] ?? null;
          onFileChange(file);
        }}
      />

      {previewUrl ? (
        <div
          className={`group relative h-48 w-full overflow-hidden rounded-lg border ${
            isDragOver ? "border-amber-400 ring-2 ring-amber-200" : "border-gray-200"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Image
            src={previewUrl}
            alt={label}
            fill
            className="object-cover"
            unoptimized={previewUrl.startsWith("blob:")}
          />
          <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="typo-medium-14 cursor-pointer rounded-lg bg-white px-3 py-2 text-gray-700 hover:bg-gray-100"
            >
              변경
            </button>
            <button
              type="button"
              onClick={onRemove}
              className="typo-medium-14 cursor-pointer rounded-lg bg-red-600 px-3 py-2 text-white hover:bg-red-700"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
            isDragOver
              ? "border-amber-500 bg-amber-50"
              : "border-gray-300 bg-gray-50 hover:border-amber-400 hover:bg-amber-50"
          }`}
        >
          <ImagePlus
            size={32}
            className={`mb-2 ${isDragOver ? "text-amber-500" : "text-gray-400"}`}
          />
          <span className={`text-sm ${isDragOver ? "text-amber-600" : "text-gray-500"}`}>
            {isDragOver ? "여기에 놓으세요" : "클릭 또는 드래그하여 이미지 업로드"}
          </span>
        </div>
      )}
    </div>
  );
}
