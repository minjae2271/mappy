import { create } from 'zustand';
import { Feature, Geometry } from 'geojson';

interface MapStore {
  type: "Feature" | "GeometryCollection" | "LineString" | "MultiLineString" | "MultiPoint" | "MultiPolygon" | "Point" | "Polygon";
  geometry: Geometry;
  properties: {
    region: string;
    area: string;
  };
  setGeometry: (geometry: Geometry) => void;
  setType: (type: MapStore["type"]) => void;
  setRegion: (region: string) => void;
  setArea: (area: string) => void;
}

export const useMapStore = create<MapStore>((set, get) => ({
    type: "Feature",
    geometry: {
      type: "Polygon",
      coordinates: [],
    },
    properties: {
      region: '',
      area: '',
    },
    setGeometry: (geometry) => set({ geometry: geometry }),
    setType: (type) => set({ type: type }),
    setRegion: (region) => set({ properties: { ...get().properties, region } }),
    setArea: (area) => set({ properties: { ...get().properties, area } }),
}));
