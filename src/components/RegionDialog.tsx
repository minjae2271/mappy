"use client";

import { Feature, Geometry } from "geojson";
import { geoPath, geoMercator } from "d3-geo";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState, useRef, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Rnd } from "react-rnd";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";

interface RegionDialogProps {
  selectedArea: Feature<Geometry> & {
    properties: {
      name?: string;
      STATE_NAME?: string;
      CTP_KOR_NM?: string;
    };
  } | null;
  onClose: () => void;
}

function getRegionName(feature?: RegionDialogProps["selectedArea"]) {
  return feature?.properties?.name || feature?.properties?.STATE_NAME || feature?.properties?.CTP_KOR_NM;
}

function base64ToFile(base64: string, filename: string) {
  const arr = base64.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while(n--) u8arr[n] = bstr.charCodeAt(n);
  return new File([u8arr], filename, { type: mime });
}

export function RegionDialog({ selectedArea, onClose }: RegionDialogProps) {
  const [image, setImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 400, height: 300 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createBrowserSupabaseClient();

  const regionKey = getRegionName(selectedArea);

  useEffect(() => {
    if (selectedArea) {
      setImage(null);
      setSize({ width: 400, height: 300 });
      setPosition({ x: 0, y: 0 });
    }
  }, [selectedArea]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (image && containerRef.current) {
      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      setPosition({
        x: (rect.width - size.width) / 2,
        y: (rect.height - size.height) / 2,
      });
    }
  }, [image, size]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async () => {
    if (!image || !regionKey) return;

    setIsSubmitting(true);

    const file = base64ToFile(image, `${regionKey}-${Date.now()}.png`);

    const { data: storageData, error: storageError } = await supabase
      .storage
      .from("region-images")
      .upload(`overlays/${file.name}`, file, {
        cacheControl: "3600",
        upsert: true
      });

    if (storageError) {
      console.error("Storage upload failed", storageError);
      alert("이미지 업로드에 실패했습니다.");
      setIsSubmitting(false);
      return;
    }

    const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/region-images/${storageData.path}`;

    const { error: dbError } = await supabase
      .from("region_overlays")
      .insert({
        region: regionKey,
        image_url: imageUrl,
        x: position.x,
        y: position.y,
        width: size.width,
        height: size.height
      });

    if (dbError) {
      console.log("DB insert failed", dbError);
      alert("DB 저장에 실패했습니다.");
    } else {
      alert("등록이 완료되었습니다.");
      onClose();
    }

    setIsSubmitting(false);
  };

  const pathD = useMemo(() => {
    if (!selectedArea) return "";
    return geoPath(geoMercator().fitSize([100, 100], selectedArea))(selectedArea) || "";
  }, [selectedArea]);

  return (
    <Dialog open={!!selectedArea} onOpenChange={onClose}>
      <DialogContent className="!w-screen !h-screen !max-w-none !p-0 !m-0 !rounded-none">
        <DialogHeader className="px-6 py-4">
          <DialogTitle>{regionKey}</DialogTitle>
        </DialogHeader>
        <div ref={containerRef} className="w-full h-[calc(100vh-100px)] border-t overflow-hidden bg-slate-50 relative">
          {image ? (
            <div className="relative w-full h-full">
              <Rnd
                size={size}
                position={position}
                onDragStop={(e, d) => setPosition({ x: d.x, y: d.y })}
                onResize={(e, direction, ref, delta, pos) => {
                  setSize({
                    width: ref.offsetWidth,
                    height: ref.offsetHeight,
                  });
                  setPosition(pos);
                }}
                bounds="parent"
                minWidth={100}
                minHeight={100}
                maxWidth={800}
                maxHeight={600}
                dragHandleClassName="drag-handle"
                enableResizing={{
                  top: false,
                  right: false,
                  bottom: false,
                  left: false,
                  topRight: true,
                  bottomRight: true,
                  bottomLeft: true,
                  topLeft: true
                }}
                className="!absolute z-10"
                dragGrid={[1, 1]}
                resizeGrid={[1, 1]}
              >
                <div className="w-full h-full drag-handle cursor-move">
                  <img 
                    src={image} 
                    alt="Uploaded" 
                    className="w-full h-full object-contain opacity-30 transition-all duration-100"
                  />
                </div>
              </Rnd>
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 100 100"
                preserveAspectRatio="xMidYMid meet"
                className="absolute inset-0 z-0 pointer-events-none"
              >
                <path
                  d={pathD}
                  fill="#999999"
                  fillOpacity="0.2"
                  stroke="#FFF"
                  strokeWidth={0.5}
                />
              </svg>
              <div className="absolute bottom-4 right-4 z-20 flex gap-2">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                />
                <Button variant="outline" onClick={handleUploadClick}>
                  사진 첨부하기
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setImage(null)}
                >
                  이미지 삭제
                </Button>
                <Button
                  disabled={isSubmitting}
                  onClick={handleSubmit}
                >
                  {isSubmitting ? "등록 중..." : "등록하기"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 100 100"
                preserveAspectRatio="xMidYMid meet"
                className="absolute inset-0 pointer-events-none"
              >
                <path
                  d={pathD}
                  fill="#999999"
                  fillOpacity="0.2"
                  stroke="#FFF"
                  strokeWidth={0.5}
                />
              </svg>
              <div className="relative z-10">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                />
                <Button variant="outline" onClick={handleUploadClick}>
                  사진 첨부하기
                </Button>
              </div>
            </div>
          )}
        </div>
        <div className="py-4 px-6">
          <p>이 지역에 대한 상세 정보를 여기에 표시할 수 있습니다.</p>
          <p>예: 인구, 면적, 주요 도시 등</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
