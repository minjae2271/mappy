"use client";

import { useParams, useRouter } from "next/navigation";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";

export default function EuropePage() {
  const { region } = useParams();
  const router = useRouter();

  const config = {
    name: "Europe",
    projection: "geoMercator",
    scale: 500,
    center: [15, 55],
    jsonPath: "/europe.json",
  }

  return <main className="w-full h-full flex flex-col items-center justify-center py-4 px-6 gap-4">
    <h1 className="text-2xl font-bold">{region}</h1>
    <div className="w-full h-full border-2 border-gray-300 rounded-md">
      <ComposableMap
        projection={config.projection}
        projectionConfig={{
          scale: config.scale,
          center: config.center as [number, number]
        }}
        style={{
          width: "100%",
          height: "100%",
        }}
      >
        <ZoomableGroup center={[0, 0]} zoom={1}>
            <Geographies geography={config.jsonPath}>
            {({ geographies }) => (
                geographies.map(geo => (
                <Geography key={geo.rsmKey} geography={geo}
                    fill="#DDD"
                    stroke="#FFF"
                    strokeWidth={1}
                    style={{
                        default: { outline: "none", cursor: "pointer" },
                        hover: { fill: "#000", outline: "none" },
                        pressed: { outline: "none" },
                      }}
                    onClick={() => {
                        router.push(`/map/europe/${geo.properties.name}`);
                    }}
                    />

                ))
            )}
            </Geographies>    
        </ZoomableGroup>
      </ComposableMap>
    </div>
  </main>
}