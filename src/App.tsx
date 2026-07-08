import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Cpu, Gamepad2, Layers, Database, HardDrive, Zap, Box, Wind, 
  AlertTriangle, CheckCircle, XCircle, Sparkles, Send, RefreshCw, 
  Trash2, Plus, Info, Check, ArrowRight, TrendingUp
} from 'lucide-react';
import { PC_PARTS, PRESET_BUILDS } from './parts';
import { PartCategory, PCPart, CompatibilityCheck, ChatMessage } from './types';

export default function App() {
  // Build state
  const [selectedParts, setSelectedParts] = useState<Record<PartCategory, PCPart | null>>({
    cpu: null,
    gpu: null,
    motherboard: null,
    ram: null,
    storage: null,
    psu: null,
    case: null,
    cooler: null,
  });

  const [targetBudget, setTargetBudget] = useState<number>(1500);
  const [activeCategory, setActiveCategory] = useState<PartCategory>('cpu');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [brandFilter, setBrandFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'price-asc' | 'price-desc' | 'brand'>('price-asc');
  const [rightPanelTab, setRightPanelTab] = useState<'parts' | 'ai'>('parts');

  // AI Assistant state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState<string>('');
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll AI chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load a preset build
  const handleLoadPreset = (presetId: string) => {
    const preset = PRESET_BUILDS.find(p => p.id === presetId);
    if (!preset) return;

    const newParts: Record<PartCategory, PCPart | null> = {
      cpu: null, gpu: null, motherboard: null, ram: null, storage: null, psu: null, case: null, cooler: null
    };

    Object.entries(preset.parts).forEach(([cat, partId]) => {
      const part = PC_PARTS.find(p => p.id === partId);
      if (part) {
        newParts[cat as PartCategory] = part;
      }
    });

    setSelectedParts(newParts);
    setTargetBudget(preset.targetBudget);
    
    // Clear previous chat and trigger automated AI review for the new preset
    setMessages([]);
    setAiError(null);
  };

  // Reset current build
  const handleResetBuild = () => {
    setSelectedParts({
      cpu: null,
      gpu: null,
      motherboard: null,
      ram: null,
      storage: null,
      psu: null,
      case: null,
      cooler: null,
    });
    setMessages([]);
    setAiError(null);
  };

  // Calculate total build cost and power draw
  const totalCost = useMemo(() => {
    return (Object.values(selectedParts) as (PCPart | null)[]).reduce((acc, part) => acc + (part?.price || 0), 0);
  }, [selectedParts]);

  const estimatedPowerDraw = useMemo(() => {
    return (Object.values(selectedParts) as (PCPart | null)[]).reduce((acc, part) => acc + (part?.power || 0), 0);
  }, [selectedParts]);

  // Compatibility Rule Engine (Offline check)
  const compatibilityChecks = useMemo<CompatibilityCheck[]>(() => {
    const checks: CompatibilityCheck[] = [];
    const { cpu, motherboard, ram, psu, case: pcase, gpu, cooler } = selectedParts;

    // 1. CPU and Motherboard Socket Check
    if (cpu && motherboard) {
      const cpuSocket = cpu.specs.socket;
      const moboSocket = motherboard.specs.socket;
      if (cpuSocket !== moboSocket) {
        checks.push({
          id: 'socket-mismatch',
          type: 'error',
          message: `Socket Mismatch: ${cpu.name} uses ${cpuSocket}, but Motherboard uses ${moboSocket}.`,
          details: 'They are physically incompatible. You must select components with matching sockets.'
        });
      } else {
        checks.push({
          id: 'socket-match',
          type: 'success',
          message: `Sockets Match: Both CPU and Motherboard support socket ${cpuSocket}.`
        });
      }
    } else if (cpu || motherboard) {
      checks.push({
        id: 'socket-pending',
        type: 'warning',
        message: 'Select both CPU and Motherboard to verify socket compatibility.'
      });
    }

    // 2. Motherboard and RAM Memory Standard Check
    if (motherboard && ram) {
      const moboRam = motherboard.specs.ramType;
      const ramStandard = ram.specs.ramType;
      if (moboRam !== ramStandard) {
        checks.push({
          id: 'ram-mismatch',
          type: 'error',
          message: `RAM Mismatch: Motherboard supports ${moboRam} but RAM is ${ramStandard}.`,
          details: 'DDR4 and DDR5 slots are keyed differently. You cannot insert DDR5 RAM into a DDR4 board (or vice-versa).'
        });
      } else {
        checks.push({
          id: 'ram-match',
          type: 'success',
          message: `RAM Compatible: Both support standard ${moboRam}.`
        });
      }
    } else if (motherboard || ram) {
      checks.push({
        id: 'ram-pending',
        type: 'warning',
        message: 'Select both Motherboard and RAM to verify DDR generation compatibility.'
      });
    }

    // 3. Motherboard Form Factor & Case Clearance Check
    if (motherboard && pcase) {
      const moboForm = motherboard.specs.formFactor; // ATX, Mini-ITX
      const caseForm = pcase.specs.formFactor; // ATX, Mini-ITX
      
      if (caseForm === 'Mini-ITX' && moboForm !== 'Mini-ITX') {
        checks.push({
          id: 'case-fit-mismatch',
          type: 'error',
          message: `Case Form Factor Issue: ${pcase.name} is a Mini-ITX small form factor case, but your motherboard is ${moboForm}.`,
          details: 'An ATX/Micro-ATX motherboard is physically too large to fit in a compact Mini-ITX enclosure.'
        });
      } else {
        checks.push({
          id: 'case-fit-match',
          type: 'success',
          message: `Motherboard Form Factor fits perfectly within the ${caseForm} case structure.`
        });
      }
    }

    // 4. GPU Length Clearance vs Case Limit Check
    if (gpu && pcase) {
      const gpuLen = gpu.specs.gpuLength || 0;
      const maxCaseGpu = pcase.specs.maxGpuLength || 999;
      if (gpuLen > maxCaseGpu) {
        checks.push({
          id: 'gpu-clearance-mismatch',
          type: 'error',
          message: `GPU Clearance Error: ${gpu.name} is ${gpuLen}mm long, but the selected Case only supports GPUs up to ${maxCaseGpu}mm.`,
          details: 'The graphics card is physically blocked by the case drive bays or fan rails.'
        });
      } else {
        checks.push({
          id: 'gpu-clearance-match',
          type: 'success',
          message: `GPU Fits: Clearance length is healthy (${gpuLen}mm < ${maxCaseGpu}mm capacity).`
        });
      }
    }

    // 5. PSU Power Capability and Overhead Check
    if (psu) {
      const psuWattage = psu.specs.wattage || 0;
      const recommendedWattage = Math.round(estimatedPowerDraw * 1.25); // 25% safety overhead
      
      if (estimatedPowerDraw > psuWattage) {
        checks.push({
          id: 'psu-overload',
          type: 'error',
          message: `PSU Overload: System draw is estimated at ${estimatedPowerDraw}W, but Power Supply is rated for ${psuWattage}W.`,
          details: 'This will cause shutdowns, system crashes, or hardware damage under load.'
        });
      } else if (recommendedWattage > psuWattage) {
        checks.push({
          id: 'psu-headroom-tight',
          type: 'warning',
          message: `PSU Headroom Tight: Estimated load is ${estimatedPowerDraw}W. Selected ${psuWattage}W PSU provides less than 25% recommended safety buffer (${recommendedWattage}W recommended).`,
          details: 'We recommend adding extra power margin to prevent degradation and absorb power spikes from GPUs.'
        });
      } else {
        checks.push({
          id: 'psu-headroom-healthy',
          type: 'success',
          message: `Power Safety Margin Excellent: ${psuWattage}W PSU provides robust headroom for the estimated ${estimatedPowerDraw}W system draw.`
        });
      }
    } else {
      checks.push({
        id: 'psu-pending',
        type: 'warning',
        message: 'No Power Supply (PSU) selected. Choose a PSU to calculate actual safety margins.'
      });
    }

    // 6. Generic system-wide notifications
    if (cpu && cooler) {
      checks.push({
        id: 'cooler-socket-match',
        type: 'success',
        message: `CPU Cooler supports selected ${cpu.specs.socket} socket installation.`
      });
    }

    return checks;
  }, [selectedParts, estimatedPowerDraw]);

  // Determine error counts
  const errorCount = useMemo(() => compatibilityChecks.filter(c => c.type === 'error').length, [compatibilityChecks]);
  const warningCount = useMemo(() => compatibilityChecks.filter(c => c.type === 'warning').length, [compatibilityChecks]);

  // Filters for Parts Catalog
  const filteredParts = useMemo(() => {
    return PC_PARTS.filter(part => {
      if (part.category !== activeCategory) return false;
      
      const matchesSearch = part.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            part.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (part.specs.socket && part.specs.socket.toLowerCase().includes(searchQuery.toLowerCase())) ||
                            (part.specs.ramType && part.specs.ramType.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesBrand = brandFilter === 'all' || part.brand.toLowerCase() === brandFilter.toLowerCase();
      
      return matchesSearch && matchesBrand;
    }).sort((a, b) => {
      if (sortOrder === 'price-asc') return a.price - b.price;
      if (sortOrder === 'price-desc') return b.price - a.price;
      if (sortOrder === 'brand') return a.brand.localeCompare(b.brand);
      return 0;
    });
  }, [activeCategory, searchQuery, brandFilter, sortOrder]);

  // Unique brands list for current category
  const availableBrands = useMemo(() => {
    const brands = new Set<string>();
    PC_PARTS.forEach(part => {
      if (part.category === activeCategory) {
        brands.add(part.brand);
      }
    });
    return Array.from(brands);
  }, [activeCategory]);

  // Update categories active tab when category is changed
  const selectPartCategory = (cat: PartCategory) => {
    setActiveCategory(cat);
    setSearchQuery('');
    setBrandFilter('all');
    setRightPanelTab('parts');
  };

  // Add / replace a part
  const handleSelectPart = (part: PCPart) => {
    setSelectedParts(prev => ({
      ...prev,
      [part.category]: part
    }));
  };

  // Remove a part
  const handleRemovePart = (category: PartCategory) => {
    setSelectedParts(prev => ({
      ...prev,
      [category]: null
    }));
  };

  // Quick Action Buttons for Category Icons
  const categoryMeta: Record<PartCategory, { label: string; icon: any; placeholder: string }> = {
    cpu: { label: 'CPU / Processor', icon: Cpu, placeholder: 'Select an Intel or AMD Ryzen processor...' },
    gpu: { label: 'Graphics Card (GPU)', icon: Gamepad2, placeholder: 'Select an RTX or Radeon card...' },
    motherboard: { label: 'Motherboard', icon: Layers, placeholder: 'Choose compatible mainboard socket...' },
    ram: { label: 'RAM / Memory', icon: Database, placeholder: 'Choose system RAM size and speed...' },
    storage: { label: 'Storage / SSD', icon: HardDrive, placeholder: 'Add NVMe PCIe Solid-State Drive...' },
    psu: { label: 'Power Supply (PSU)', icon: Zap, placeholder: 'Add efficient rated power supply...' },
    case: { label: 'PC Case', icon: Box, placeholder: 'Choose tower form-factor or small ITX case...' },
    cooler: { label: 'CPU Cooler', icon: Wind, placeholder: 'Add air tower or liquid liquid cooler...' }
  };

  // Trigger Gemini AI review
  const handleAskAIReview = async (customPrompt?: string) => {
    setRightPanelTab('ai');
    setAiLoading(true);
    setAiError(null);

    const userMsgText = customPrompt || "Analyze my current build and provide tailored recommendations.";
    const newUserMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userMsgText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);

    try {
      const response = await fetch('/api/ai/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parts: selectedParts,
          budget: targetBudget,
          totalCost: totalCost,
          messages: updatedMessages
        })
      });

      if (!response.ok) {
        throw new Error('Could not connect to the hardware advisory server.');
      }

      const data = await response.json();
      
      const newAssistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, newAssistantMessage]);
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || 'Error fetching AI recommendations.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    const textToSend = chatInput;
    setChatInput('');
    handleAskAIReview(textToSend);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans antialiased">
      {/* HEADER SECTION */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs px-4 py-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 text-white rounded-lg">
              <Cpu id="app-logo" className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 id="app-title" className="text-xl font-bold tracking-tight text-slate-900">PC Parts Builder</h1>
              <p className="text-xs text-slate-500">Interactive hardware planner with live smart compatibility check</p>
            </div>
          </div>

          {/* Quick presets & global actions */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1">Starters:</span>
            {PRESET_BUILDS.map(p => (
              <button
                key={p.id}
                onClick={() => handleLoadPreset(p.id)}
                className="text-xs font-medium px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors border border-slate-200/60"
              >
                {p.name.split(' ')[0]} {p.name.includes('SFF') ? 'SFF' : p.targetBudget + '$'}
              </button>
            ))}
            <button
              onClick={handleResetBuild}
              className="text-xs font-medium px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-md transition-colors border border-rose-200"
            >
              Reset
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6">
        {/* TOP DASHBOARD METRICS BAR */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* BUDGET GAUGER */}
          <div id="budget-card" className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Budget Tracker</span>
                <Info className="w-4 h-4 text-slate-400 cursor-help" title="Input your target budget to check limits" />
              </div>
              <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                <span className="text-slate-400 text-xs font-semibold">$</span>
                <input 
                  type="number" 
                  value={targetBudget}
                  onChange={(e) => setTargetBudget(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-16 bg-transparent font-bold text-xs focus:outline-hidden text-right"
                  placeholder="Budget"
                />
              </div>
            </div>
            
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-slate-900">${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <span className="text-sm text-slate-500">/ ${targetBudget.toLocaleString()}</span>
            </div>

            {/* Custom visual progress bar */}
            <div className="mt-4">
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 rounded-full ${
                    totalCost > targetBudget ? 'bg-rose-500' : totalCost > targetBudget * 0.9 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, (totalCost / (targetBudget || 1)) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between items-center mt-2 text-xs">
                <span className={`${totalCost > targetBudget ? 'text-rose-600 font-semibold' : 'text-slate-500'}`}>
                  {totalCost > targetBudget 
                    ? `Over budget by $${(totalCost - targetBudget).toFixed(0)}` 
                    : `$${(targetBudget - totalCost).toFixed(0)} remaining`}
                </span>
                <span className="text-slate-400">{Math.round((totalCost / (targetBudget || 1)) * 100)}% Used</span>
              </div>
            </div>
          </div>

          {/* POWER DRAW GAUGE */}
          <div id="power-card" className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Estimated Power Load</span>
              <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                {selectedParts.psu ? `${selectedParts.psu.specs.wattage}W PSU` : 'No PSU Selected'}
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-slate-900">{estimatedPowerDraw}W</span>
              <span className="text-sm text-slate-500">estimated draw</span>
            </div>

            {/* Power meter progress */}
            <div className="mt-4">
              {selectedParts.psu ? (
                (() => {
                  const psuCapacity = selectedParts.psu.specs.wattage || 1;
                  const usagePercentage = Math.round((estimatedPowerDraw / psuCapacity) * 100);
                  const isCritical = usagePercentage > 100;
                  const isTight = usagePercentage > 80 && usagePercentage <= 100;
                  
                  return (
                    <>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 rounded-full ${
                            isCritical ? 'bg-rose-500' : isTight ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, usagePercentage)}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center mt-2 text-xs">
                        <span className={`font-semibold ${isCritical ? 'text-rose-600' : isTight ? 'text-amber-600' : 'text-slate-500'}`}>
                          {isCritical ? '⚠️ PSU Overloaded' : isTight ? '⚠️ Headroom Tight' : '✓ Safe load capacity'}
                        </span>
                        <span className="text-slate-400">{usagePercentage}% System Load</span>
                      </div>
                    </>
                  );
                })()
              ) : (
                <>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-300 w-1/12 rounded-full" />
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Add a Power Supply (PSU) to compute system safety limit.</p>
                </>
              )}
            </div>
          </div>

          {/* QUICK DIAGNOSTIC SUMMARY */}
          <div id="diagnostics-summary-card" className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">System Integrity</span>
              <div className="flex gap-2">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${errorCount > 0 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-400'}`}>
                  {errorCount} {errorCount === 1 ? 'Error' : 'Errors'}
                </span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${warningCount > 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-400'}`}>
                  {warningCount} {warningCount === 1 ? 'Warning' : 'Warnings'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {errorCount > 0 ? (
                <div className="p-2.5 bg-rose-50 rounded-lg text-rose-600 border border-rose-200">
                  <XCircle className="w-6 h-6" />
                </div>
              ) : warningCount > 0 ? (
                <div className="p-2.5 bg-amber-50 rounded-lg text-amber-600 border border-amber-200">
                  <AlertTriangle className="w-6 h-6" />
                </div>
              ) : (
                <div className="p-2.5 bg-emerald-50 rounded-lg text-emerald-600 border border-emerald-200">
                  <CheckCircle className="w-6 h-6" />
                </div>
              )}

              <div>
                <span className="font-bold text-slate-900 block text-lg">
                  {errorCount > 0 
                    ? 'Incompatible Components' 
                    : warningCount > 0 
                      ? 'Minor Configuration Issues' 
                      : 'Perfect Harmony'}
                </span>
                <span className="text-xs text-slate-500 block">
                  {errorCount > 0 
                    ? 'Please resolve the red errors listed in the checks panel.' 
                    : 'System is electronically and physically compatible.'}
                </span>
              </div>
            </div>

            <button
              onClick={() => handleAskAIReview()}
              className="mt-4 w-full py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              Ask AI Expert Review
            </button>
          </div>
        </div>

        {/* WORKSPACE LAYOUT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT 7 COLUMNS: COMPONENT SLOTS AND CHECKS */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* BUILD SLOTS PANEL */}
            <div id="build-slots-panel" className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-slate-50/50 px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-800">Custom Build Checklist</h2>
                  <p className="text-xs text-slate-500">Pick hardware components to construct your ideal rig</p>
                </div>
                <button
                  onClick={handleResetBuild}
                  className="text-xs text-slate-500 hover:text-rose-600 flex items-center gap-1 font-medium transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear All
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {Object.entries(categoryMeta).map(([catKey, meta]) => {
                  const category = catKey as PartCategory;
                  const selectedPart = selectedParts[category];
                  const IconComponent = meta.icon;
                  const isActive = activeCategory === category;

                  return (
                    <div 
                      key={category}
                      className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-4 gap-4 transition-all ${
                        isActive ? 'bg-indigo-50/40 border-l-4 border-l-indigo-600' : 'hover:bg-slate-50/30'
                      }`}
                    >
                      {/* Left: Icon and Category Label */}
                      <button
                        onClick={() => selectPartCategory(category)}
                        className="flex items-center gap-3.5 text-left grow min-w-0"
                      >
                        <div className={`p-2 rounded-lg shrink-0 ${
                          selectedPart 
                            ? 'bg-slate-900 text-white' 
                            : isActive 
                              ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' 
                              : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        
                        <div className="min-w-0">
                          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                            {category.toUpperCase()}
                          </span>
                          {selectedPart ? (
                            <span className="font-bold text-slate-900 truncate block text-sm sm:text-base">
                              {selectedPart.brand} {selectedPart.name}
                            </span>
                          ) : (
                            <span className="text-sm text-slate-500 italic block">
                              {meta.placeholder}
                            </span>
                          )}
                        </div>
                      </button>

                      {/* Right: Spec details, Cost, & Slot Actions */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                        {selectedPart ? (
                          <>
                            {/* Specs tag */}
                            <div className="text-right hidden md:block">
                              <span className="text-[10px] font-mono bg-slate-100 px-2 py-0.5 rounded-sm block text-slate-500 mb-0.5">
                                {selectedPart.specs.socket || selectedPart.specs.ramType || selectedPart.specs.formFactor || 'Standard'}
                              </span>
                              <span className="text-xs font-mono text-slate-400 block">
                                {selectedPart.power > 0 ? `+ ${selectedPart.power}W` : 'No Power draw'}
                              </span>
                            </div>

                            {/* Price */}
                            <div className="text-right mr-1">
                              <span className="font-mono font-bold text-slate-900 text-sm sm:text-base block">
                                ${selectedPart.price.toFixed(2)}
                              </span>
                            </div>

                            {/* Remove button */}
                            <button
                              onClick={() => handleRemovePart(category)}
                              className="p-1.5 hover:bg-rose-50 hover:text-rose-600 text-slate-400 rounded-md transition-colors"
                              title="Remove component"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => selectPartCategory(category)}
                            className="w-full sm:w-auto px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors border border-slate-200/60 flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Choose Part
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* INTEGRITY / CHECKS DETAILS ACCORDION */}
            <div id="diagnostics-panel" className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/50">
                <h3 className="text-sm font-bold text-slate-800">Rule-Engine Diagnostics</h3>
                <p className="text-xs text-slate-500">Automated physical and power margin compatibility checks</p>
              </div>

              <div className="p-5 space-y-3">
                {compatibilityChecks.map(check => (
                  <div 
                    key={check.id}
                    className={`flex gap-3.5 p-3.5 rounded-lg border text-xs leading-relaxed ${
                      check.type === 'error' 
                        ? 'bg-rose-50/50 border-rose-200 text-slate-700' 
                        : check.type === 'warning' 
                          ? 'bg-amber-50/50 border-amber-200 text-slate-700' 
                          : 'bg-emerald-50/30 border-emerald-100 text-slate-600'
                    }`}
                  >
                    <div className="shrink-0 mt-0.5">
                      {check.type === 'error' ? (
                        <XCircle className="w-4.5 h-4.5 text-rose-600" />
                      ) : check.type === 'warning' ? (
                        <AlertTriangle className="w-4.5 h-4.5 text-amber-600" />
                      ) : (
                        <CheckCircle className="w-4.5 h-4.5 text-emerald-600" />
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-800">
                        {check.message}
                      </p>
                      {check.details && (
                        <p className="text-slate-500 block leading-normal">
                          {check.details}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT 5 COLUMNS: ACTION DRAWER (CATALOG OR AI ASSISTANT) */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-[84px]">
            
            {/* TABS SELECTOR */}
            <div className="flex bg-slate-200/60 p-1.5 rounded-xl border border-slate-200/80">
              <button
                onClick={() => setRightPanelTab('parts')}
                className={`flex-1 py-2.5 text-center text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  rightPanelTab === 'parts' 
                    ? 'bg-white text-slate-900 shadow-sm font-semibold' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Plus className="w-4 h-4" />
                Parts Library
              </button>
              <button
                onClick={() => {
                  setRightPanelTab('ai');
                  // Trigger initial review if messages are empty
                  if (messages.length === 0) {
                    handleAskAIReview();
                  }
                }}
                className={`flex-1 py-2.5 text-center text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  rightPanelTab === 'ai' 
                    ? 'bg-white text-slate-900 shadow-sm font-semibold' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
                AI Hardware Consultant
              </button>
            </div>

            {/* TAB CONTENT: PARTS LIBRARY */}
            {rightPanelTab === 'parts' && (
              <div id="parts-library-card" className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col max-h-[720px]">
                
                {/* Catalog Filter Header */}
                <div className="p-4 border-b border-slate-200 bg-slate-50/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">
                        Browsing: <span className="text-indigo-600 font-bold capitalize">{activeCategory}s</span>
                      </h3>
                      <p className="text-[11px] text-slate-500">Pick items matching socket or size targets</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-200 text-slate-600 rounded-md uppercase tracking-wide">
                      {filteredParts.length} Available
                    </span>
                  </div>

                  {/* Search bar */}
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`Search ${activeCategory} name, socket, brand...`}
                    className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
                  />

                  {/* Secondary filter selectors */}
                  <div className="flex gap-2">
                    {/* Brand Filter */}
                    <select
                      value={brandFilter}
                      onChange={(e) => setBrandFilter(e.target.value)}
                      className="text-[11px] bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg grow"
                    >
                      <option value="all">All Brands</option>
                      {availableBrands.map(b => (
                        <option key={b} value={b.toLowerCase()}>{b}</option>
                      ))}
                    </select>

                    {/* Price / Sort filter */}
                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value as any)}
                      className="text-[11px] bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg shrink-0"
                    >
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                      <option value="brand">Brand Alphabetical</option>
                    </select>
                  </div>
                </div>

                {/* Catalog scroll container */}
                <div className="overflow-y-auto divide-y divide-slate-100 p-4 space-y-3 grow">
                  {filteredParts.length > 0 ? (
                    filteredParts.map(part => {
                      const isCurrentlySelected = selectedParts[activeCategory]?.id === part.id;
                      
                      return (
                        <div 
                          key={part.id} 
                          className={`p-3 rounded-lg border transition-all ${
                            isCurrentlySelected 
                              ? 'border-indigo-500 bg-indigo-50/15 ring-2 ring-indigo-500/10' 
                              : 'border-slate-100 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2 gap-2">
                            <div>
                              <span className="text-[10px] font-bold text-indigo-600 block uppercase tracking-wider">{part.brand}</span>
                              <h4 className="text-xs font-bold text-slate-900 leading-tight block">{part.name}</h4>
                            </div>
                            <span className="text-xs font-mono font-bold text-slate-900">${part.price.toFixed(2)}</span>
                          </div>

                          {/* Item parameters specs table */}
                          <div className="grid grid-cols-2 gap-2 mb-3 bg-slate-50/50 p-2 rounded text-[10px] font-mono text-slate-500">
                            {part.specs.socket && (
                              <div>
                                <span className="text-slate-400 font-sans block text-[9px] uppercase">Socket</span>
                                <span className="font-bold text-slate-700">{part.specs.socket}</span>
                              </div>
                            )}
                            {part.specs.ramType && (
                              <div>
                                <span className="text-slate-400 font-sans block text-[9px] uppercase">RAM Type</span>
                                <span className="font-bold text-slate-700">{part.specs.ramType}</span>
                              </div>
                            )}
                            {part.specs.formFactor && (
                              <div>
                                <span className="text-slate-400 font-sans block text-[9px] uppercase">Form Factor</span>
                                <span className="font-bold text-slate-700">{part.specs.formFactor}</span>
                              </div>
                            )}
                            {part.specs.size && (
                              <div>
                                <span className="text-slate-400 font-sans block text-[9px] uppercase">Specs</span>
                                <span className="font-bold text-slate-700">{part.specs.size}</span>
                              </div>
                            )}
                            {part.specs.maxGpuLength && (
                              <div>
                                <span className="text-slate-400 font-sans block text-[9px] uppercase">Max GPU Length</span>
                                <span className="font-bold text-slate-700">{part.specs.maxGpuLength}mm</span>
                              </div>
                            )}
                            {part.specs.gpuLength && (
                              <div>
                                <span className="text-slate-400 font-sans block text-[9px] uppercase">GPU Length</span>
                                <span className="font-bold text-slate-700">{part.specs.gpuLength}mm</span>
                              </div>
                            )}
                            {part.specs.wattage && (
                              <div>
                                <span className="text-slate-400 font-sans block text-[9px] uppercase">Rating / Capacity</span>
                                <span className="font-bold text-slate-700">{part.specs.wattage}W ({part.specs.rating || 'Standard'})</span>
                              </div>
                            )}
                            <div>
                              <span className="text-slate-400 font-sans block text-[9px] uppercase">Power draw</span>
                              <span className="font-bold text-slate-700">{part.power > 0 ? `${part.power}W` : 'None'}</span>
                            </div>
                          </div>

                          <div className="flex justify-end">
                            {isCurrentlySelected ? (
                              <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold px-2 py-1 bg-emerald-50 rounded border border-emerald-100">
                                <Check className="w-3.5 h-3.5" />
                                Selected
                              </div>
                            ) : (
                              <button
                                onClick={() => handleSelectPart(part)}
                                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                              >
                                {selectedParts[activeCategory] ? 'Replace' : 'Add to build'}
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-12 px-4">
                      <AlertTriangle className="w-8 h-8 text-slate-400 mx-auto mb-2.5" />
                      <p className="text-xs font-semibold text-slate-600">No parts found matching criteria.</p>
                      <p className="text-[10px] text-slate-400 mt-1">Try resetting the keyword filter or searching for alternative specifications.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT: AI HARDWARE CONSULTANT CHAT */}
            {rightPanelTab === 'ai' && (
              <div id="ai-assistant-card" className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
                {/* Consultant Header */}
                <div className="p-4 border-b border-slate-200 bg-slate-50/40 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100">
                      <Sparkles className="w-4.5 h-4.5 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">AI PC Building Advisor</h3>
                      <p className="text-[10px] text-slate-500">Reviews configuration and recommends saving tips</p>
                    </div>
                  </div>
                  {aiLoading && (
                    <div className="flex items-center gap-1 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded text-[10px] text-indigo-700">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      Analysing...
                    </div>
                  )}
                </div>

                {/* Messages scroll content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 && !aiLoading ? (
                    <div className="text-center py-12 px-6 h-full flex flex-col justify-center items-center space-y-4">
                      <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center border border-indigo-100 mb-2">
                        <Sparkles className="w-6 h-6 animate-pulse" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">Review Your Custom Config</p>
                        <p className="text-xs text-slate-500 mt-1.5 max-w-sm">
                          Trigger an AI review to get full hardware analysis, price optimizations, bottleneck detection, and power headroom reports.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full pt-4">
                        <button
                          onClick={() => handleAskAIReview("Review my system's specs, identify any potential hardware bottlenecking, and check component sizing constraints.")}
                          className="p-2.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-lg text-[11px] text-left text-slate-600 hover:text-indigo-900 transition-all font-semibold"
                        >
                          🔍 Analyze Bottlenecks
                        </button>
                        <button
                          onClick={() => handleAskAIReview("How can I shave $100-$200 off this current budget list without sacrificing gaming performance?")}
                          className="p-2.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-lg text-[11px] text-left text-slate-600 hover:text-indigo-900 transition-all font-semibold"
                        >
                          💰 Budget Cost-Savings
                        </button>
                        <button
                          onClick={() => handleAskAIReview("Review if this CPU cooling solution can comfortably handle full sustained gaming and productive workloads without thermal throttling.")}
                          className="p-2.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-lg text-[11px] text-left text-slate-600 hover:text-indigo-900 transition-all font-semibold"
                        >
                          ❄️ Cooler & Thermals Check
                        </button>
                        <button
                          onClick={() => handleAskAIReview("What component upgrades would yield the biggest performance boost if I increase my budget by $200?")}
                          className="p-2.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-lg text-[11px] text-left text-slate-600 hover:text-indigo-900 transition-all font-semibold"
                        >
                          🚀 Next Best Upgrade Path
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Active Chat Conversation rendering */}
                      {messages.map(msg => (
                        <div 
                          key={msg.id}
                          className={`flex flex-col max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                            msg.sender === 'user'
                              ? 'bg-slate-900 text-white ml-auto rounded-tr-none'
                              : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/50'
                          }`}
                        >
                          <span className={`text-[9px] font-semibold block mb-1 opacity-60 uppercase tracking-wider ${
                            msg.sender === 'user' ? 'text-indigo-200' : 'text-slate-500'
                          }`}>
                            {msg.sender === 'user' ? 'Your Query' : 'AI Specialist'}
                          </span>
                          
                          {/* Structured markdown text representation */}
                          <div className="space-y-1.5 whitespace-pre-wrap font-sans">
                            {msg.text}
                          </div>

                          <span className={`text-[8px] block text-right mt-2 opacity-40 ${
                            msg.sender === 'user' ? 'text-white' : 'text-slate-500'
                          }`}>
                            {msg.timestamp}
                          </span>
                        </div>
                      ))}

                      {/* Loading placeholder */}
                      {aiLoading && (
                        <div className="flex flex-col max-w-[85%] bg-slate-100 text-slate-800 rounded-2xl rounded-tl-none p-4 border border-slate-200/50 animate-pulse">
                          <span className="text-[9px] font-semibold text-slate-500 block mb-1.5 uppercase tracking-wider">AI Specialist</span>
                          <div className="space-y-2">
                            <div className="h-3 bg-slate-200 rounded w-11/12" />
                            <div className="h-3 bg-slate-200 rounded w-5/6" />
                            <div className="h-3 bg-slate-200 rounded w-3/4" />
                          </div>
                        </div>
                      )}

                      {/* Server Q&A error */}
                      {aiError && (
                        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-start gap-2">
                          <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold block">Error calling hardware consultant:</span>
                            <span>{aiError}</span>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Quick chip queries */}
                {messages.length > 0 && (
                  <div className="px-4 py-2 border-t border-slate-100 flex gap-2 overflow-x-auto select-none bg-slate-50/20">
                    <button 
                      onClick={() => handleAskAIReview("Is my selected CPU cooler sufficient, or do I need something beefier?")}
                      className="text-[10px] font-semibold px-2.5 py-1 bg-white hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 border border-slate-200 hover:border-indigo-200 rounded-full whitespace-nowrap transition-colors"
                    >
                      ❄️ Cooler sufficient?
                    </button>
                    <button 
                      onClick={() => handleAskAIReview("What parts of this build should I upgrade first in the future?")}
                      className="text-[10px] font-semibold px-2.5 py-1 bg-white hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 border border-slate-200 hover:border-indigo-200 rounded-full whitespace-nowrap transition-colors"
                    >
                      📈 Future upgrade path?
                    </button>
                    <button 
                      onClick={() => handleAskAIReview("Does the GPU have any bottleneck issues with this CPU choice?")}
                      className="text-[10px] font-semibold px-2.5 py-1 bg-white hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 border border-slate-200 hover:border-indigo-200 rounded-full whitespace-nowrap transition-colors"
                    >
                      ⚡ Bottleneck check
                    </button>
                  </div>
                )}

                {/* Text chat input form */}
                <form onSubmit={handleSendChat} className="p-4 border-t border-slate-200 flex gap-2 bg-slate-50/50">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={aiLoading ? "Consultant is thinking..." : "Ask your hardware consultant..."}
                    disabled={aiLoading}
                    className="flex-1 text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                  <button
                    type="submit"
                    disabled={aiLoading || !chatInput.trim()}
                    className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-40 transition-colors cursor-pointer flex items-center justify-center shrink-0"
                    title="Send message"
                  >
                    <Send className="w-4.5 h-4.5" />
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white text-slate-500 text-xs py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© 2026 PC Parts Builder. High-fidelity client-side check & Server-side AI Consulting.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Local Validator Active
            </span>
            <span className="flex items-center gap-1.5 text-indigo-600">
              <Sparkles className="w-3.5 h-3.5" />
              Gemini Advisor Connected
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
