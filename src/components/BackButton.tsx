'use client';

import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition"
      aria-label="닫기"
    >
      <X className="w-5 h-5" />
    </button>
  );
}
