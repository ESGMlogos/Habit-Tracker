import React, { useState, useMemo } from 'react';

export interface SunburstNode {
    name: string;
    value: number;
    children?: SunburstNode[];
    color?: string;
}

interface ProcessedSlice {
    id: string;
    name: string;
    value: number;
    depth: number;
    startAngle: number;
    endAngle: number;
    innerR: number;
    outerR: number;
    color: string;
    path: string;
    ancestors: string[];
}

interface SunburstProps {
    data: SunburstNode;
}

export const SunburstChart: React.FC<SunburstProps> = ({ data }) => {
    const [hoveredSlice, setHoveredSlice] = useState<ProcessedSlice | null>(null);

    // Config
    const viewBoxSize = 600;
    const cx = viewBoxSize / 2;
    const cy = viewBoxSize / 2;
    const radius = 250;
    
    const { slices } = useMemo(() => {
        const result: ProcessedSlice[] = [];
        let maxDepthFound = 0;

        const getCoords = (r: number, a: number) => ({
            x: cx + r * Math.cos(a - Math.PI / 2),
            y: cy + r * Math.sin(a - Math.PI / 2)
        });

        const buildPath = (start: number, end: number, rIn: number, rOut: number) => {
            if (end - start >= 2 * Math.PI) end = start + 2 * Math.PI - 0.0001;

            const startOuter = getCoords(rOut, start);
            const endOuter = getCoords(rOut, end);
            const startInner = getCoords(rIn, start);
            const endInner = getCoords(rIn, end);
            
            const largeArc = end - start > Math.PI ? 1 : 0;

            return [
                `M ${startOuter.x} ${startOuter.y}`,
                `A ${rOut} ${rOut} 0 ${largeArc} 1 ${endOuter.x} ${endOuter.y}`,
                `L ${endInner.x} ${endInner.y}`,
                `A ${rIn} ${rIn} 0 ${largeArc} 0 ${startInner.x} ${startInner.y}`,
                `Z`
            ].join(' ');
        };

        const process = (
            node: SunburstNode, 
            depth: number, 
            startAngle: number, 
            endAngle: number, 
            parentColor: string,
            ancestorIds: string[]
        ) => {
            if (depth > maxDepthFound) maxDepthFound = depth;

            const ringWidth = radius / 3.5; 
            const innerR = depth * ringWidth;
            const outerR = (depth + 1) * ringWidth;

            // Root is stone-900 (#1c1917), children inherit or override
            let myColor = node.color || parentColor;
            if (depth === 0) myColor = '#292524'; 
            
            const id = `${depth}-${node.name}-${startAngle.toFixed(4)}`;
            const myAncestors = [...ancestorIds, id];

            // Only draw if value > 0
            if (node.value > 0 || depth === 0) {
                 result.push({
                    id,
                    name: node.name,
                    value: node.value,
                    depth,
                    startAngle,
                    endAngle,
                    innerR: depth === 0 ? 0 : innerR,
                    outerR,
                    color: myColor,
                    path: depth === 0 
                        ? buildPath(0, 2*Math.PI - 0.001, 0, ringWidth) 
                        : buildPath(startAngle, endAngle, innerR, outerR),
                    ancestors: myAncestors
                });
            }

            if (node.children && node.children.length > 0) {
                const childrenValue = node.children.reduce((a, b) => a + b.value, 0);
                let currentAngle = startAngle;
                const totalAngle = endAngle - startAngle;

                node.children.forEach((child) => {
                    const sliceAngle = childrenValue > 0 ? (child.value / childrenValue) * totalAngle : 0;
                    if (sliceAngle > 0) {
                        process(child, depth + 1, currentAngle, currentAngle + sliceAngle, myColor, myAncestors);
                        currentAngle += sliceAngle;
                    }
                });
            }
        };

        process(data, 0, 0, 2 * Math.PI, '#44403C', []);

        return { slices: result, maxDepth: maxDepthFound };
    }, [data, cx, cy]);

    return (
        <div className="bg-[#FDFCF5] border border-[#E7E5E4] p-6 relative w-full h-[500px] flex flex-col rounded-sm shadow-sm">
            <div className="flex justify-between items-end mb-4 border-b border-[#E7E5E4] pb-2">
                <h3 className="font-display font-bold text-lg text-[#292524]">Holistic View</h3>
                <span className="font-serif text-[10px] text-[#78716c] uppercase tracking-widest">
                    ARETE_DISTRIBUTION
                </span>
            </div>

            <div className="flex-1 relative overflow-hidden flex items-center justify-center">
                <svg 
                    width="100%" 
                    height="100%" 
                    viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
                    preserveAspectRatio="xMidYMid meet"
                    className="max-h-full"
                >
                    {slices.map((slice) => {
                        const isHovered = hoveredSlice?.id === slice.id;
                        const isAncestor = hoveredSlice?.ancestors.includes(slice.id);
                        const isRelated = isHovered || isAncestor;
                        // Dim others if something is hovered, but keep root visible
                        const dim = hoveredSlice !== null && !isRelated && slice.depth > 0;

                        return (
                            <path 
                                key={slice.id}
                                d={slice.path}
                                fill={slice.color}
                                fillOpacity={dim ? 0.3 : 1}
                                stroke="#FDFCF5"
                                strokeWidth={isHovered ? 2 : 1}
                                className="transition-all duration-300 ease-out cursor-pointer"
                                onMouseEnter={() => setHoveredSlice(slice)}
                                onMouseLeave={() => setHoveredSlice(null)}
                            />
                        );
                    })}

                    {/* Center Overlay */}
                    <circle cx={cx} cy={cy} r={65} fill="#FDFCF5" stroke="#E7E5E4" strokeWidth="1" className="pointer-events-none shadow-inner" />
                    <text 
                        x={cx} y={cy - 10} 
                        textAnchor="middle" 
                        className="font-display text-[10px] uppercase font-bold fill-[#78716c] pointer-events-none"
                    >
                        {hoveredSlice ? hoveredSlice.name : "TOTAL"}
                    </text>
                    <text 
                        x={cx} y={cy + 15} 
                        textAnchor="middle" 
                        className="font-display text-2xl font-bold fill-[#292524] pointer-events-none"
                    >
                        {hoveredSlice ? hoveredSlice.value : data.value}
                    </text>
                </svg>

                {/* Breadcrumbs */}
                <div className="absolute bottom-2 left-2 flex flex-wrap gap-1 pointer-events-none max-w-full">
                    {hoveredSlice && hoveredSlice.ancestors.map((id, i) => {
                            const nodeName = slices.find(s => s.id === id)?.name;
                            if (!nodeName || nodeName === "Root") return null;
                            return (
                                <div key={i} className="flex items-center">
                                    {i > 1 && <span className="text-[#A8A29E] mx-1">›</span>}
                                    <span className="font-serif text-[10px] text-[#44403C] bg-white px-1.5 py-0.5 border border-[#E7E5E4] rounded-sm shadow-sm">
                                        {nodeName}
                                    </span>
                                </div>
                            );
                        })
                    }
                </div>
            </div>
        </div>
    );
};