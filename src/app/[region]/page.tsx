"use client";

import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { Feature, Geometry } from "geojson";
import { notFound } from "next/navigation";
import type { Region } from "@/components/Navbar";
import { use } from "react";
import { useState, useCallback } from "react";
import { zoom, zoomIdentity } from "d3-zoom";
import { select } from "d3-selection";
import { geoPath, geoMercator } from "d3-geo";
import { geoCentroid } from "d3-geo";
import { RegionDialog } from "@/components/RegionDialog";

interface ExtendedFeature extends Feature<Geometry> {
  rsmKey: string;
  properties: {
    name?: string;
    STATE_NAME?: string;
    CTP_KOR_NM?: string;
  };
}

interface RegionConfig {
  name: string;
  projection: "geoMercator" | "geoAlbersUsa" | "geoAzimuthalEqualArea";
  scale: number;
  center: [number, number];
  jsonPath: string;
  filterCountries?: string[];
  getFeatureName?: (feature: ExtendedFeature) => string | undefined;
  debug?: boolean;
}

interface SelectedArea extends Feature<Geometry> {
  properties: {
    name?: string;
    STATE_NAME?: string;
    CTP_KOR_NM?: string;
  };
}

const regionConfigs: Record<Region, RegionConfig> = {
  korea: {
    name: "Korea",
    projection: "geoMercator",
    scale: 5500,
    center: [127.8, 36],
    // jsonPath: "skorea-municipalities-2018-geo.json",
    jsonPath: "https://raw.githubusercontent.com/southkorea/southkorea-maps/master/kostat/2018/json/skorea-provinces-2018-geo.json",
    getFeatureName: (feature) => feature.properties.name
  },
  usa: {
    name: "USA",
    projection: "geoAlbersUsa",
    scale: 1000,
    center: [-97, 38],
    jsonPath: "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json",
    getFeatureName: (feature) => feature.properties.name
  },
  europe: {
    name: "Europe",
    projection: "geoMercator",
    scale: 500,
    center: [15, 55],
    jsonPath: "/europe.json",
    getFeatureName: (feature) => {
      const name = feature.properties.name;
      if (!name) return undefined;
      
      // 디버깅을 위해 콘솔에 출력
      console.log("Country name from data:", name);
      return name;
    },
    debug: true
  }
};

export default function RegionPage({ params }: { params: Promise<{ region: Region }> }) {
  const resolvedParams = use(params);
  const config = regionConfigs[resolvedParams.region];
  const [position, setPosition] = useState({ coordinates: [0, 0], zoom: 1 });
  const [selectedArea, setSelectedArea] = useState<SelectedArea | null>(null);

  if (!config) {
    notFound();
  }

  const handleZoom = useCallback((event: any) => {
    if (event.transform) {
      const { x, y, k } = event.transform;
      setPosition({
        coordinates: [x, y],
        zoom: k
      });
    }
  }, []);

  const handleWheel = useCallback((event: React.WheelEvent) => {
    const map = select("#map-container");
    const zoomBehavior = zoom()
      .scaleExtent([1, 8])
      .on("zoom", handleZoom);

    map.call(zoomBehavior as any)
       .call(
         zoomBehavior.transform as any,
         zoomIdentity
           .translate(position.coordinates[0], position.coordinates[1])
           .scale(
             event.deltaY < 0 
               ? Math.min(position.zoom * 1.2, 8) 
               : Math.max(position.zoom / 1.2, 1)
           )
       );
  }, [position, handleZoom]);

  return (
    <div className="relative w-full h-full">
      <ComposableMap
        projection={config.projection}
        projectionConfig={{
          scale: config.scale,
          center: config.center
        }}
        style={{
          width: "100%",
          height: "100%",
        }}
      >
        <g
          transform={`translate(${position.coordinates[0]}, ${position.coordinates[1]}) scale(${position.zoom})`}
        >
          <Geographies geography={config.jsonPath}>
            {({ geographies }: { geographies: ExtendedFeature[] }) => {
              if (config.debug) {
                console.log("All available countries:", 
                  geographies.map(geo => geo.properties.name).sort());
              }
              
              return geographies
                .filter(geo => {
                  const name = config.getFeatureName?.(geo);
                  return !config.filterCountries || 
                         config.filterCountries.includes(name || '');
                })
                .map((geo) => {
                  const name = config.getFeatureName?.(geo);
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill="#DDD"
                      stroke="#FFF"
                      strokeWidth={0.5}
                      style={{
                        default: { outline: "none", cursor: "pointer" },
                        hover: { fill: "#F53", outline: "none" },
                        pressed: { outline: "none" },
                      }}
                      onClick={() => {
                        const areaName = config.getFeatureName?.(geo);
                        if (areaName) {
                          console.log("Area name from config:", areaName);
                          setSelectedArea({
                            type: "Feature",
                            geometry: geo.geometry,
                            properties: {
                              name: areaName,
                              STATE_NAME: geo.properties.STATE_NAME,
                              CTP_KOR_NM: geo.properties.CTP_KOR_NM
                            }
                          });
                        }
                      }}
                      data-tooltip-id="map-tooltip"
                      data-tooltip-content={name}
                    />
                  );
                });
            }}
          </Geographies>
        </g>
      </ComposableMap>

      <RegionDialog selectedArea={selectedArea} onClose={() => setSelectedArea(null)} />
    </div>
  );
} 