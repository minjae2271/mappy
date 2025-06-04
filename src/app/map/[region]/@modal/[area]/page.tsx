'use client';

import { useParams } from 'next/navigation';
import BackButton from '@/components/BackButton';

export default function AreaModal() {
  const { area } = useParams();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative bg-white p-6 rounded-2xl shadow-xl w-full max-w-md">
        <BackButton />
        <h2 className="text-xl font-semibold mb-4">{area}</h2>
      </div>
    </div>
  );
}
