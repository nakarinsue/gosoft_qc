import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowRight, 
  AlertCircle, 
  CheckCircle, 
  RotateCcw, 
  XCircle, 
  FileText, 
  Printer, 
  GitBranch, 
  Activity,
  Moon,
  Sun,
  Info,
  Wrench // Add Wrench icon for Repair
} from 'lucide-react';

/**
 * ============================================================================
 * DATA & CONFIGURATION
 * ============================================================================
 */

// Status Definitions
const STATUS_CONFIG = {
  '0': { label: '0: Init', color: 'bg-gray-100 dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-200' },
  '1': { label: '1: Pending', color: 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-200' },
  '2': { label: '2: Error', color: 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700 text-red-700 dark:text-red-200' },
  '3': { label: '3: Success', color: 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-200' },
  '4': { label: '4: Locked', color: 'bg-slate-200 dark:bg-slate-800 border-slate-400 dark:border-slate-500 text-slate-600 dark:text-slate-400' },
  '5': { label: '5: Cancelled', color: 'bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-700 text-orange-700 dark:text-orange-200' },
  '6': { label: '6: OR Pending', color: 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-700 text-indigo-700 dark:text-indigo-200' },
  '8': { label: '8: OR Error', color: 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700 text-red-700 dark:text-red-200' },
  '9': { label: '9: OR Success', color: 'bg-purple-50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-200' },
};

// Node Positions (Manual Layout for 5 distinct flows)
// Grid system: x (0-1200), y (0-1000)
const NODES = [
  // --- Flow 1: INQUIRY (Left Top) ---
  { id: 'start', status: 'Start', x: 70, y: 225, type: 'start' },
  { id: 'st0', status: '0', x: 200, y: 150 },
  { id: 'st1', status: '1', x: 200, y: 300 }, // Pending State 1

  // --- Flow 2: EXCHANGE (Middle Top) ---
  { id: 'st3', status: '3', x: 500, y: 225 }, // Success Center
  { id: 'st2', status: '2', x: 380, y: 400 }, // Error
  { id: 'st5', status: '5', x: 620, y: 400 }, // Cancel

  // --- Flow 3: OR (Right Top) ---
  { id: 'st6', status: '6', x: 800, y: 225 },
  { id: 'st9', status: '9', x: 1000, y: 225 },
  { id: 'st8', status: '8', x: 800, y: 400 },

  // --- Flow 4: FULL FORM (Middle Bottom) ---
  { id: 'st4', status: '4', x: 300, y: 650 }, // The locked parent (Visual anchor)
  { id: 'ff_st1', status: '1', label: 'FF: 1', x: 450, y: 650 },
  { id: 'ff_st3', status: '3', label: 'FF: 3', x: 600, y: 650 },
  { id: 'ff_st2', status: '2', label: 'FF: 2', x: 450, y: 800 }, // Error
  { id: 'ff_st5', status: '5', label: 'FF: 5', x: 300, y: 800 }, // Cancel

  // --- Flow 5: FULL FORM OR (Right Bottom) ---
  { id: 'ff_st6', status: '6', label: 'FF: 6', x: 800, y: 650 },
  { id: 'ff_st9', status: '9', label: 'FF: 9', x: 1000, y: 650 },
  { id: 'ff_st8', status: '8', label: 'FF: 8', x: 800, y: 800 },
];

// Transitions (Edges)
const TRANSITIONS = [
  // === FLOW 1: INQUIRY ===
  { from: 'start', to: 'st0', label: 'Inquiry', type: 'primary' },
  { from: 'start', to: 'st1', label: 'Inquiry', type: 'primary' },

  // === FLOW 2: EXCHANGE ===
  { from: 'st0', to: 'st1', label: 'Exchange', type: 'primary' },
  { from: 'st1', to: 'st1', label: 'Exchange', type: 'secondary', curve: -50, desc: 'Retry Exchange' }, 

  { from: 'st1', to: 'st3', label: 'Exch Confirm', type: 'success' },
  { from: 'st1', to: 'st1', label: 'Fail Ph1', type: 'warning', curve: 50 },
  { from: 'st1', to: 'st2', label: 'Fail Ph2/3', type: 'error' },
  
  { from: 'st2', to: 'st3', label: 'Job Auto Repair', type: 'repair', dashed: true, curve: -40 },
  { from: 'st1', to: 'st5', label: 'Cancel', type: 'neutral' },
  
  // === FLOW 3: OR ===
  { from: 'st3', to: 'st6', label: 'OR', type: 'primary' },
  { from: 'st3', to: 'st3', label: 'Reprint', type: 'secondary', curve: -50 },
  
  { from: 'st6', to: 'st9', label: 'OR Confirm', type: 'success' },
  { from: 'st6', to: 'st6', label: 'Fail Ph1', type: 'warning', curve: 40 },
  { from: 'st6', to: 'st8', label: 'Fail Ph2/3', type: 'error' },
  { from: 'st6', to: 'st5', label: 'Cancel', type: 'neutral', curve: 20 },
  { from: 'st8', to: 'st9', label: 'Job Auto Repair', type: 'repair', dashed: true, curve: -40 },

  // === FLOW 4: FULL FORM ===
  // Connection from Main to Full Form
  { from: 'st3', to: 'st4', label: 'Full Form', type: 'special', desc: 'Main Status becomes 4' },
  { from: 'st3', to: 'ff_st1', label: 'Create New', type: 'special', dashed: true, desc: 'Spawns new flow at 1' },
  
  { from: 'ff_st1', to: 'ff_st3', label: 'FF Confirm', type: 'success' },
  { from: 'ff_st1', to: 'ff_st1', label: 'Fail Ph1', type: 'warning', curve: 30 },
  { from: 'ff_st1', to: 'ff_st2', label: 'Fail Ph2/3', type: 'error' },
  { from: 'ff_st2', to: 'ff_st3', label: 'Job Auto Repair', type: 'repair', dashed: true, curve: -40 },

  { from: 'ff_st1', to: 'ff_st5', label: 'FF Cancel', type: 'neutral' },
  { from: 'ff_st5', to: 'st3', label: 'Rollback', type: 'special', dashed: true, curve: -40, desc: 'Locked 4 returns to 3' },

  // === FLOW 5: FULL FORM OR ===
  { from: 'ff_st3', to: 'ff_st6', label: 'FF OR', type: 'primary' },
  
  { from: 'ff_st6', to: 'ff_st9', label: 'FF OR Confirm', type: 'success' },
  { from: 'ff_st6', to: 'ff_st6', label: 'Fail Ph1', type: 'warning', curve: 30 },
  { from: 'ff_st6', to: 'ff_st8', label: 'Fail Ph2/3', type: 'error' },
  { from: 'ff_st8', to: 'ff_st9', label: 'Job Auto Repair', type: 'repair', dashed: true, curve: -40 },
];

/**
 * ============================================================================
 * UTILITY COMPONENTS
 * ============================================================================
 */

// Draw an SVG Arrow between two points with optional curve
const Arrow = ({ start, end, label, type, curve = 0, dashed = false, onClick, isActive }) => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  
  // Control point for Bezier curve
  const cx = (start.x + end.x) / 2 - dy * (curve / dist);
  const cy = (start.y + end.y) / 2 + dx * (curve / dist);

  // Colors based on type
  const colors = {
    primary: 'stroke-blue-500',
    success: 'stroke-emerald-500',
    warning: 'stroke-amber-500',
    error: 'stroke-red-500',
    neutral: 'stroke-gray-400',
    secondary: 'stroke-indigo-400',
    special: 'stroke-pink-500',
    repair: 'stroke-cyan-500', 
  };
  const strokeColor = colors[type] || 'stroke-gray-500';
  const width = isActive ? 3 : 1.5;

  const path = `M ${start.x} ${start.y} Q ${cx} ${cy} ${end.x} ${end.y}`;

  // Calculate label position (midpoint of quadratic bezier)
  const t = 0.5;
  const lx = (1 - t) * (1 - t) * start.x + 2 * (1 - t) * t * cx + t * t * end.x;
  const ly = (1 - t) * (1 - t) * start.y + 2 * (1 - t) * t * cy + t * t * end.y;

  return (
    <g className="group cursor-pointer" onClick={onClick}>
      <path 
        d={path} 
        fill="none" 
        className={`${strokeColor} transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`}
        strokeWidth={width}
        strokeDasharray={dashed ? "5,5" : "none"}
        markerEnd={`url(#arrowhead-${type})`}
      />
      {/* Invisible thicker path for easier clicking */}
      <path d={path} fill="none" stroke="transparent" strokeWidth={15} />
      
      {/* Label Background */}
      <rect 
        x={lx - (label.length * 3.5)} y={ly - 10} 
        width={label.length * 7 + 10} height={20} 
        rx={4} 
        fill={isActive ? '#1e293b' : 'white'} 
        className={`transition-colors duration-300 ${isActive ? 'fill-slate-800 dark:fill-white' : 'fill-white dark:fill-slate-800 stroke-gray-200 dark:stroke-gray-700'}`}
        strokeWidth={1}
      />
      
      {/* Label Text */}
      <text 
        x={lx} y={ly + 4} 
        textAnchor="middle" 
        className={`text-[10px] font-medium select-none pointer-events-none transition-colors duration-300
          ${isActive ? 'fill-white dark:fill-slate-900' : 'fill-slate-600 dark:fill-slate-300'}
        `}
      >
        {label}
      </text>
    </g>
  );
};

// Node Component
const StatusNode = ({ node, onClick, isActive }) => {
  const config = STATUS_CONFIG[node.status] || { label: node.status, color: 'bg-gray-100 text-gray-800' };
  const label = node.label || config.label;
  const isStart = node.type === 'start';

  if (isStart) {
    return (
      <div 
        className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
        style={{ left: node.x, top: node.y }}
      >
        <div className="bg-slate-800 text-white px-4 py-2 rounded-full shadow-lg font-bold text-sm">
          Start
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`
        absolute transform -translate-x-1/2 -translate-y-1/2
        w-28 h-16 rounded-xl border-2 shadow-sm
        flex flex-col items-center justify-center
        transition-all duration-300 cursor-pointer
        hover:scale-105 hover:shadow-md z-10
        ${config.color}
        ${isActive ? 'ring-4 ring-offset-2 ring-blue-400 dark:ring-blue-500 scale-105 shadow-lg' : ''}
      `}
      style={{ left: node.x, top: node.y }}
      onClick={() => onClick(node)}
    >
      <span className="font-bold text-sm text-center leading-tight px-1">
        {label}
      </span>
      {node.id.includes('ff') && (
        <span className="text-[9px] mt-1 opacity-70 uppercase tracking-wider">Full Form</span>
      )}
    </div>
  );
};

/**
 * ============================================================================
 * MAIN COMPONENT
 * ============================================================================
 */
const CsStructureDiagram = () => {
  const [theme, setTheme] = useState('light');
  const [selectedItem, setSelectedItem] = useState(null); // Can be node or edge
  const [zoom, setZoom] = useState(0.8); // Adjusted zoom

  // Initialize theme
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }
  }, []);

  const handleNodeClick = (node) => {
    setSelectedItem({ type: 'node', data: node });
  };

  const handleEdgeClick = (edge) => {
    setSelectedItem({ type: 'edge', data: edge });
  };

  const getMarkerColor = (type) => {
     const colors = {
      primary: '#3b82f6',   // blue-500
      success: '#10b981',   // emerald-500
      warning: '#f59e0b',   // amber-500
      error: '#ef4444',     // red-500
      neutral: '#9ca3af',   // gray-400
      secondary: '#818cf8', // indigo-400
      special: '#ec4899',   // pink-500
      repair: '#06b6d4',    // cyan-500
    };
    return colors[type] || '#64748b';
  };

  return (
    <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'dark bg-slate-900' : 'bg-gray-50'}`}>
      
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 p-4 shadow-sm z-20 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-lg text-white">
            <GitBranch size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white">Transaction State Machine</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Status Flow & Action Logic Diagram</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
           {/* Legend Summary */}
           <div className="hidden md:flex gap-3 text-xs">
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div><span className="text-slate-600 dark:text-slate-300">Success</span></div>
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-cyan-500"></div><span className="text-slate-600 dark:text-slate-300">Auto Repair</span></div>
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div><span className="text-slate-600 dark:text-slate-300">Error</span></div>
           </div>

           <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
          >
            {theme === 'dark' ? <Sun className="text-yellow-400" size={20} /> : <Moon className="text-slate-600" size={20} />}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Canvas Area */}
        <div className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-950 relative cursor-grab active:cursor-grabbing">
          
          {/* SVG Layer for Edges */}
          <div className="absolute top-0 left-0 min-w-[1300px] min-h-[1100px] p-10 transform origin-top-left" style={{ transform: `scale(${zoom})` }}>
            
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" 
              style={{ backgroundImage: 'radial-gradient(circle, #888 1px, transparent 1px)', backgroundSize: '20px 20px' }} 
            />

            {/* === ZONE INDICATORS (THE 5 FLOWS) === */}
            
            {/* 1. INQUIRY Flow Zone */}
            <div className="absolute top-[50px] left-[20px] w-[250px] h-[450px] border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-100/30 dark:bg-slate-900/30 rounded-3xl -z-10">
                <span className="absolute top-4 left-4 text-slate-300 dark:text-slate-700 font-bold text-2xl uppercase tracking-widest">1. Inquiry</span>
            </div>
            
            {/* 2. EXCHANGE Flow Zone */}
            <div className="absolute top-[50px] left-[300px] w-[400px] h-[450px] border-2 border-dashed border-blue-100 dark:border-blue-900/30 bg-blue-50/20 dark:bg-blue-900/10 rounded-3xl -z-10">
                <span className="absolute top-4 left-4 text-blue-200 dark:text-blue-900/50 font-bold text-2xl uppercase tracking-widest">2. Exchange</span>
            </div>

            {/* 3. OR Flow Zone */}
            <div className="absolute top-[50px] left-[730px] w-[350px] h-[450px] border-2 border-dashed border-indigo-100 dark:border-indigo-900/30 bg-indigo-50/20 dark:bg-indigo-900/10 rounded-3xl -z-10">
                <span className="absolute top-4 left-4 text-indigo-200 dark:text-indigo-900/50 font-bold text-2xl uppercase tracking-widest">3. OR</span>
            </div>

            {/* 4. Full Form Flow Zone */}
            <div className="absolute top-[550px] left-[250px] w-[450px] h-[350px] border-2 border-dashed border-pink-100 dark:border-pink-900/30 bg-pink-50/30 dark:bg-pink-900/10 rounded-3xl -z-10">
                <span className="absolute top-4 left-4 text-pink-200 dark:text-pink-900/50 font-bold text-2xl uppercase tracking-widest">4. Full Form</span>
            </div>

            {/* 5. Full Form OR Flow Zone */}
            <div className="absolute top-[550px] left-[730px] w-[350px] h-[350px] border-2 border-dashed border-purple-100 dark:border-purple-900/30 bg-purple-50/30 dark:bg-purple-900/10 rounded-3xl -z-10">
                <span className="absolute top-4 left-4 text-purple-200 dark:text-purple-900/50 font-bold text-2xl uppercase tracking-widest">5. Full Form OR</span>
            </div>

            <svg className="w-full h-full absolute top-0 left-0 overflow-visible z-0 pointer-events-none">
              <defs>
                {['primary', 'success', 'warning', 'error', 'neutral', 'secondary', 'special', 'repair'].map(type => (
                  <marker
                    key={type}
                    id={`arrowhead-${type}`}
                    markerWidth="10"
                    markerHeight="7"
                    refX="9"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon points="0 0, 10 3.5, 0 7" fill={getMarkerColor(type)} />
                  </marker>
                ))}
              </defs>
              
              {/* Render Connections */}
              {TRANSITIONS.map((edge, idx) => {
                const startNode = NODES.find(n => n.id === edge.from);
                const endNode = NODES.find(n => n.id === edge.to);
                const isActive = selectedItem?.type === 'edge' && selectedItem.data === edge;
                
                if (!startNode || !endNode) return null;

                return (
                  <g key={idx} className="pointer-events-auto">
                     <Arrow 
                        start={startNode} 
                        end={endNode} 
                        label={edge.label} 
                        type={edge.type}
                        curve={edge.curve}
                        dashed={edge.dashed}
                        isActive={isActive}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdgeClick(edge);
                        }}
                     />
                  </g>
                );
              })}
            </svg>

            {/* Render Nodes */}
            {NODES.map((node) => (
              <StatusNode 
                key={node.id} 
                node={node} 
                isActive={selectedItem?.type === 'node' && selectedItem.data.id === node.id}
                onClick={handleNodeClick} 
              />
            ))}

          </div>
        </div>

        {/* Sidebar / Info Panel */}
        <div className="w-80 bg-white dark:bg-slate-900 border-l border-gray-200 dark:border-slate-800 p-6 shadow-xl flex flex-col z-30">
          <div className="mb-6">
             <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2">Inspector</h2>
             
             {!selectedItem ? (
               <div className="text-center py-10 opacity-50">
                  <Activity size={40} className="mx-auto mb-3" />
                  <p className="text-sm">Click on a Node or Action Arrow to view details.</p>
               </div>
             ) : (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                  {selectedItem.type === 'node' ? (
                    <>
                      <div className={`p-4 rounded-xl mb-4 text-center border ${STATUS_CONFIG[selectedItem.data.status]?.color || 'bg-gray-100'}`}>
                        <span className="text-2xl font-black block">{selectedItem.data.status}</span>
                        <span className="text-xs uppercase opacity-70">Status Code</span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
                        {STATUS_CONFIG[selectedItem.data.status]?.label}
                      </h3>
                      <div className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
                         <p>This is a system status node.</p>
                         {selectedItem.data.id.includes('ff') && (
                           <p className="text-pink-600 dark:text-pink-400 font-medium flex items-center gap-2">
                             <GitBranch size={14}/> Part of Full Form Sub-process
                           </p>
                         )}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 mb-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase text-white 
                          ${selectedItem.data.type === 'success' ? 'bg-emerald-500' : 
                            selectedItem.data.type === 'error' ? 'bg-red-500' : 
                            selectedItem.data.type === 'warning' ? 'bg-amber-500' : 
                            selectedItem.data.type === 'repair' ? 'bg-cyan-500' : 
                            'bg-blue-500'}`}>
                          {selectedItem.data.type} Action
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
                        Action: {selectedItem.data.label}
                      </h3>
                      <div className="space-y-4">
                        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-500">From Status:</span>
                            <span className="font-mono font-bold">{selectedItem.data.from}</span>
                          </div>
                          <div className="flex justify-between text-sm items-center">
                             <ArrowRight size={14} className="text-slate-400 mx-auto"/>
                          </div>
                          <div className="flex justify-between text-sm mt-1">
                            <span className="text-slate-500">To Status:</span>
                            <span className="font-mono font-bold">{selectedItem.data.to}</span>
                          </div>
                        </div>
                        
                        {selectedItem.data.desc && (
                          <div className="flex gap-2 items-start text-sm text-slate-600 dark:text-slate-300 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                            <Info size={16} className="mt-0.5 shrink-0 text-blue-500" />
                            <p>{selectedItem.data.desc}</p>
                          </div>
                        )}

                        <div className="text-xs text-slate-400">
                           {selectedItem.data.type === 'repair' ? (
                             <span className="text-cyan-600 dark:text-cyan-400 flex items-center gap-1">
                               <Wrench size={12} /> System Auto-Repair Process
                             </span>
                           ) : (
                              <span>Logic: {selectedItem.data.type === 'warning' ? 'System remains in previous state due to Phase 1 failure.' : 
                                  selectedItem.data.type === 'error' ? 'System enters error state due to Phase 2/3 failure.' : 'Standard state transition.'}
                              </span>
                           )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
             )}
          </div>

          <div className="mt-auto pt-6 border-t border-gray-200 dark:border-slate-800">
             <div className="flex justify-between items-center mb-2">
               <span className="text-xs font-bold text-slate-500 uppercase">Zoom Control</span>
               <span className="text-xs font-mono text-slate-400">{Math.round(zoom * 100)}%</span>
             </div>
             <input 
              type="range" min="0.5" max="1.5" step="0.1" 
              value={zoom} 
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default CsStructureDiagram;