import { useMemo, useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Loader } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ProductImageGalleryProps = {
  images?: Array<string | null | undefined>;
  name: string;
};

export const ProductImageGallery = ({
  images,
  name,
}: ProductImageGalleryProps) => {
  const mainImages = useMemo(
    () =>
      Array.isArray(images)
        ? images.filter((src): src is string => Boolean(src))
        : [],
    [images]
  );
  const hasImages = mainImages.length > 0;

  const [mainRef, mainApi] = useEmblaCarousel({
    loop: mainImages.length > 1,
    align: "start",
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [isLoading, setIsLoading] = useState(hasImages);
  const [loadedSlides, setLoadedSlides] = useState<Record<number, boolean>>({});

  useEffect(() => {
    setSelectedIndex(0);
    setLoadedSlides({});
    setIsLoading(hasImages);
    mainApi?.scrollTo(0);
  }, [hasImages, mainApi, mainImages]);

  const handleSelect = useCallback(() => {
    if (!mainApi) return;
    const index = mainApi.selectedScrollSnap();
    setSelectedIndex(index);
    setCanScrollPrev(mainApi.canScrollPrev());
    setCanScrollNext(mainApi.canScrollNext());
  }, [mainApi]);

  useEffect(() => {
    if (!mainApi) return;
    handleSelect();
    mainApi.on("select", handleSelect);
    mainApi.on("reInit", handleSelect);

    return () => {
      mainApi.off("select", handleSelect);
      mainApi.off("reInit", handleSelect);
    };
  }, [mainApi, handleSelect]);

  useEffect(() => {
    if (!hasImages) {
      setIsLoading(false);
      return;
    }
    setIsLoading(!loadedSlides[selectedIndex]);
  }, [selectedIndex, hasImages, loadedSlides]);

  const handleThumbClick = useCallback(
    (index: number) => {
      if (!mainApi) return;
      mainApi.scrollTo(index);
    },
    [mainApi]
  );

  const handleImageLoad = useCallback(
    (index: number) => {
      setLoadedSlides((prev) => {
        if (prev[index]) return prev;
        const next = { ...prev, [index]: true };
        return next;
      });
      if (index === selectedIndex) {
        setIsLoading(false);
      }
    },
    [selectedIndex]
  );

  return (
    <div className="space-y-4">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted/30 shadow-sm">
        {hasImages ? (
          <>
            {isLoading && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}
            <div ref={mainRef} className="h-full">
              <div className="flex h-full">
                {mainImages.map((src, index) => (
                  <div
                    key={`${src}-${index}`}
                    className="relative flex-[0_0_100%]"
                  >
                    <img
                      src={src}
                      alt={`${name} bilde ${index + 1}`}
                      loading={index === selectedIndex ? "eager" : "lazy"}
                      decoding="async"
                      onLoad={() => handleImageLoad(index)}
                      onError={() => handleImageLoad(index)}
                      className={cn(
                        "h-full w-full object-cover object-center transition-opacity duration-300",
                        isLoading && index === selectedIndex
                          ? "opacity-0"
                          : "opacity-100"
                      )}
                    />
                  </div>
                ))}
              </div>
            </div>

            {mainImages.length > 1 && (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="absolute hidden md:flex left-3 top-1/2 -translate-y-1/2 rounded-full bg-background/70 shadow-md backdrop-blur hover:bg-primary hover:text-primary-foreground"
                  onClick={() => mainApi && mainApi.scrollPrev()}
                  disabled={!canScrollPrev}
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Forrige bilde</span>
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="absolute hidden md:flex right-3 top-1/2 -translate-y-1/2 rounded-full bg-background/70 shadow-md backdrop-blur hover:bg-primary hover:text-primary-foreground"
                  onClick={() => mainApi && mainApi.scrollNext()}
                  disabled={!canScrollNext}
                >
                  <ChevronRight className="h-4 w-4" />
                  <span className="sr-only">Neste bilde</span>
                </Button>
                <span className="absolute right-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white">
                  {selectedIndex + 1} / {mainImages.length}
                </span>
              </>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-muted-foreground">
            Ingen bilder tilgjengelig
          </div>
        )}
      </div>

      {mainImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {mainImages.map((src, index) => (
            <button
              key={`thumb-${src}-${index}`}
              type="button"
              onClick={() => handleThumbClick(index)}
              className={cn(
                "relative h-12 w-12 md:h-16 md:w-16 flex-shrink-0 overflow-hidden rounded-xl border transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                selectedIndex === index
                  ? "opacity-100"
                  : "opacity-50 hover:opacity-100"
              )}
              aria-label={`Vis bilde ${index + 1}`}
              aria-current={selectedIndex === index}
            >
              <img
                src={src}
                alt={`${name} forhåndsvisning ${index + 1}`}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
