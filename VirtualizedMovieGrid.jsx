/**
 * VirtualizedMovieGrid - High-Performance Grid Component
 * Renders thousands of items without performance lag using virtualization
 * - Dynamic row heights
 * - Responsive layout
 * - Efficient memory usage
 * - Smooth scrolling
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { prefetchMovieDetails } from './apiOptimized';

class VirtualScrollManager {
  constructor(itemHeight, buffer = 5) {
    this.itemHeight = itemHeight;
    this.buffer = buffer;
    this.containerHeight = 0;
    this.scrollTop = 0;
  }

  getVisibleRange(scrollTop, containerHeight) {
    const startIndex = Math.max(0, Math.floor(scrollTop / this.itemHeight) - this.buffer);
    const endIndex = Math.ceil((scrollTop + containerHeight) / this.itemHeight) + this.buffer;
    return { startIndex, endIndex };
  }

  getScrollOffset(index) {
    return index * this.itemHeight;
  }
}

export const VirtualizedMovieGrid = React.memo(
  ({ items = [], onItemClick, loading = false, itemsPerRow = 4, gap = 4 }) => {
    const containerRef = useRef(null);
    const [visibleRange, setVisibleRange] = useState({ startIndex: 0, endIndex: 20 });
    const [dimensions, setDimensions] = useState({ width: 0, height: 600 });

    const itemWidth = useMemo(() => {
      if (!dimensions.width) return 250;
      const totalGap = gap * (itemsPerRow - 1);
      const containerPadding = 32;
      return (dimensions.width - containerPadding - totalGap) / itemsPerRow;
    }, [dimensions.width, itemsPerRow, gap]);

    const itemHeight = (itemWidth * 3) / 2 + 80; // Poster + title space
    const totalRows = Math.ceil(items.length / itemsPerRow);
    const totalHeight = totalRows * itemHeight + gap * (totalRows - 1);

    const scrollManager = useMemo(() => new VirtualScrollManager(itemHeight), [itemHeight]);

    const handleScroll = useCallback(
      (e) => {
        const scrollTop = e.target.scrollTop;
        const containerHeight = e.target.clientHeight;
        scrollManager.scrollTop = scrollTop;
        scrollManager.containerHeight = containerHeight;

        const range = scrollManager.getVisibleRange(scrollTop, containerHeight);
        setVisibleRange(range);

        // Prefetch items approaching visibility
        const prefetchRange = Math.min(items.length - 1, range.endIndex + 10);
        for (let i = range.endIndex; i <= prefetchRange; i++) {
          const item = items[i];
          if (item?.id) {
            prefetchMovieDetails(item.id).catch(() => {});
          }
        }
      },
      [items, scrollManager]
    );

    useEffect(() => {
      const handleResize = () => {
        if (containerRef.current) {
          setDimensions({
            width: containerRef.current.clientWidth,
            height: containerRef.current.clientHeight,
          });
        }
      };

      handleResize();
      const resizeObserver = new ResizeObserver(handleResize);
      if (containerRef.current) resizeObserver.observe(containerRef.current);

      return () => resizeObserver.disconnect();
    }, []);

    const visibleItems = useMemo(() => {
      const startIdx = Math.max(0, visibleRange.startIndex);
      const endIdx = Math.min(items.length, visibleRange.endIndex + itemsPerRow);
      return items.slice(startIdx, endIdx).map((item, idx) => ({
        ...item,
        displayIndex: startIdx + idx,
      }));
    }, [items, visibleRange, itemsPerRow]);

    const offsetY = Math.floor(visibleRange.startIndex / itemsPerRow) * (itemHeight + gap);

    return (
      <div
        ref={containerRef}
        className="relative w-full h-screen overflow-y-auto bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900"
        onScroll={handleScroll}
      >
        <div className="relative" style={{ height: totalHeight }}>
          <div
            className="grid gap-4 p-4"
            style={{
              gridTemplateColumns: `repeat(${itemsPerRow}, minmax(0, 1fr))`,
              transform: `translateY(${offsetY}px)`,
              willChange: 'transform',
            }}
          >
            {visibleItems.map((item) => (
              <div
                key={item.id}
                onClick={() => onItemClick?.(item.id)}
                className="cursor-pointer group"
              >
                <MovieCardVirtual item={item} width={itemWidth} height={itemHeight - 80} />
              </div>
            ))}
          </div>

          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div>
            </div>
          )}
        </div>
      </div>
    );
  }
);

const MovieCardVirtual = React.memo(({ item, width, height }) => {
  const imgRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="flex flex-col h-full rounded-lg overflow-hidden bg-gray-700 shadow-lg hover:shadow-2xl transition-shadow duration-300">
      <div
        className="relative bg-gray-600 overflow-hidden"
        style={{ width: `${width}px`, height: `${height}px` }}
      >
        {item.poster && (
          <>
            <div
              className={`absolute inset-0 bg-gradient-to-br from-gray-500 to-gray-700 transition-opacity duration-300 ${
                loaded ? 'opacity-0' : 'opacity-100'
              }`}
            />
            <img
              ref={imgRef}
              src={item.poster}
              alt={item.title}
              className="w-full h-full object-cover"
              onLoad={() => setLoaded(true)}
              loading="lazy"
            />
          </>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200" />
      </div>

      <div className="flex-1 p-3 flex flex-col justify-between">
        <div>
          <h3 className="font-semibold text-white line-clamp-2 text-sm">{item.title}</h3>
          <p className="text-xs text-gray-400">{item.year}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-yellow-400 text-sm">★ {item.rating}</span>
        </div>
      </div>
    </div>
  );
});

VirtualizedMovieGrid.displayName = 'VirtualizedMovieGrid';
MovieCardVirtual.displayName = 'MovieCardVirtual';
