'use client';

import BackButton from '@/components/BackButton';
import { useMapStore } from '@/store/mapStore';

export default function AreaModal() {
  const { properties, type, geometry } = useMapStore();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative bg-white p-6 rounded-2xl shadow-xl w-full max-w-md">
        <BackButton />
        <h2 className="text-xl font-semibold mb-4">{properties.area}</h2>
        <p>{properties.region}</p>
        <p>{type}</p>
      </div>
    </div>
  );
}
