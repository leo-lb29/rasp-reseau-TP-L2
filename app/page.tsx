// "use client";

// import { useState, useEffect } from "react";
// import {
//   Plus,
//   Thermometer,
//   Droplets,
//   Trash2,
//   Lightbulb,
//   LightbulbOff,
// } from "lucide-react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Switch } from "@/components/ui/switch";

// interface Device {
//   id: number;
//   name: string;
//   ip: string;
//   temperature: number | null;
//   humidity: number | null;
//   lampStatus: "on" | "off";
//   lastUpdate: number;
//   isOffline: boolean;
// }

// export default function Dashboard() {
//   const [devices, setDevices] = useState<Device[]>([]);
//   const [name, setName] = useState("");
//   const [ip, setIp] = useState("");
//   const [isOpen, setIsOpen] = useState(false);
//   const [mounted, setMounted] = useState(false);

//   // Charger devices depuis localStorage
//   useEffect(() => {
//     const saved = localStorage.getItem("devices");
//     if (saved) setDevices(JSON.parse(saved));
//     setMounted(true);
//   }, []);

//   useEffect(() => {
//     if (mounted) {
//       localStorage.setItem("devices", JSON.stringify(devices));
//     }
//   }, [devices, mounted]);

//   // fetchData avec mise à jour isOffline
//   const fetchData = async (ipAddr: string) => {
//     try {
//       const res = await fetch(`http://${ipAddr}:5000/status`, { mode: "cors" });
//       const data = await res.json();

//       setDevices((prev) =>
//         prev.map((d) =>
//           d.ip === ipAddr
//             ? {
//                 ...d,
//                 temperature: data.temperature ?? null,
//                 humidity: data.humidity ?? null,
//                 lampStatus: data.lampStatus ?? "off",
//                 lastUpdate: Date.now(),
//                 isOffline: false, // succès → device en ligne
//               }
//             : d
//         )
//       );
//     } catch (error) {
//       console.error(`Erreur ${ipAddr}:`, error);
//       setDevices((prev) =>
//         prev.map((d) =>
//           d.ip === ipAddr
//             ? { ...d, isOffline: true } // échec → device offline
//             : d
//         )
//       );
//     }
//   };

//   // Actualiser les données toutes les 10 secondes pour tous les devices
//   useEffect(() => {
//     const interval = setInterval(() => {
//       devices.forEach((device) => fetchData(device.ip));
//     }, 2000);
//     return () => clearInterval(interval);
//   }, [devices]);

//   const addDevice = () => {
//     if (!name || !ip) return;

//     const device: Device = {
//       id: Date.now(),
//       name,
//       ip,
//       temperature: null,
//       humidity: null,
//       lampStatus: "off",
//       lastUpdate: Date.now(),
//       isOffline: false,
//     };

//     setDevices((prev) => [...prev, device]);
//     setName("");
//     setIp("");
//     setIsOpen(false);
//     fetchData(ip);
//   };

//   const deleteDevice = (id: number) => {
//     setDevices((prev) => prev.filter((d) => d.id !== id));
//   };

//   const toggleLamp = async (ip: string, currentStatus: "on" | "off") => {
//     const action = currentStatus === "on" ? "off" : "on";

//     setDevices((prev) =>
//       prev.map((d) => (d.ip === ip ? { ...d, lampStatus: action } : d))
//     );

//     try {
//       const res = await fetch(`http://${ip}:5000/led/${action}`, {
//         method: "POST",
//         mode: "cors",
//       });
//       const data = await res.json();

//       setDevices((prev) =>
//         prev.map((d) => (d.ip === ip ? { ...d, lampStatus: data.led } : d))
//       );
//     } catch (error) {
//       console.error("Erreur toggle:", error);
//       setDevices((prev) =>
//         prev.map((d) => (d.ip === ip ? { ...d, lampStatus: currentStatus } : d))
//       );
//     }
//   };

//   if (!mounted) return null;

//   return (
//     <div className="min-h-screen bg-gray-50 p-8">
//       <div className="max-w-7xl mx-auto">
//         <div className="flex justify-between items-center mb-8">
//           <h1 className="text-4xl font-bold">Mes Raspberry</h1>

//           <Dialog open={isOpen} onOpenChange={setIsOpen}>
//             <DialogTrigger asChild>
//               <Button>
//                 <Plus className="mr-2 h-4 w-4" />
//                 Ajouter
//               </Button>
//             </DialogTrigger>
//             <DialogContent>
//               <DialogHeader>
//                 <DialogTitle>Nouveau Raspberry Pi</DialogTitle>
//               </DialogHeader>
//               <div className="space-y-4 pt-4">
//                 <div>
//                   <Label>Nom</Label>
//                   <Input
//                     value={name}
//                     onChange={(e) => setName(e.target.value)}
//                     placeholder="RPI Salon"
//                   />
//                 </div>
//                 <div>
//                   <Label>Adresse IP</Label>
//                   <Input
//                     value={ip}
//                     onChange={(e) => setIp(e.target.value)}
//                     placeholder="192.168.2.10"
//                   />
//                 </div>
//                 <Button onClick={addDevice} className="w-full">
//                   Ajouter
//                 </Button>
//               </div>
//             </DialogContent>
//           </Dialog>
//         </div>

//         {devices.length === 0 ? (
//           <Card className="text-center py-16">
//             <CardContent>
//               <p className="text-gray-500 mb-4">Aucun Raspberry Pi configuré</p>
//               <Button onClick={() => setIsOpen(true)}>
//                 <Plus className="mr-2 h-4 w-4" />
//                 Ajouter un RPI
//               </Button>
//             </CardContent>
//           </Card>
//         ) : (
//           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {devices.map((device) => (
//               <Card key={device.id} className="relative">
//                 {/* Overlay OFFLINE */}
//                 {device.isOffline && (
//                   <div className="absolute inset-0 top-20 bg-black/50 rounded-b-lg flex items-center justify-center z-10">
//                     <div className="text-white font-bold text-lg">Raspberry Pi OFFLINE</div>
//                   </div>
//                 )}

//                 <CardHeader>
//                   <div className="flex justify-between items-start">
//                     <div>
//                       <CardTitle>{device.name}</CardTitle>
//                       <p className="text-sm text-gray-500 font-mono">{device.ip}</p>
//                     </div>
//                     <Button
//                       variant="ghost"
//                       size="icon"
//                       onClick={() => deleteDevice(device.id)}
//                     >
//                       <Trash2 className="h-4 w-4" />
//                     </Button>
//                   </div>
//                 </CardHeader>

//                 <CardContent className="space-y-4">
//                   <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-6 text-center">
//                     <Thermometer className="h-8 w-8 mx-auto text-red-500 mb-2" />
//                     {device.temperature !== null ? (
//                       <>
//                         <div className="text-4xl font-bold text-red-600">
//                           {device.temperature.toFixed(1)}°C
//                         </div>
//                         {device.humidity !== null && (
//                           <div className="flex items-center justify-center gap-2 mt-2 text-cyan-600">
//                             <Droplets className="h-4 w-4" />
//                             {device.humidity.toFixed(1)}%
//                           </div>
//                         )}
//                       </>
//                     ) : (
//                       <div className="text-gray-400">--°C</div>
//                     )}
//                   </div>

//                   <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
//                     <div className="flex items-center gap-2">
//                       <span className="text-2xl">
//                         {device.lampStatus === "on" ? <Lightbulb /> : <LightbulbOff />}
//                       </span>
//                       <span className="font-medium">Lampe</span>
//                     </div>
//                     <Switch
//                       checked={device.lampStatus === "on"}
//                       onCheckedChange={() =>
//                         toggleLamp(device.ip, device.lampStatus)
//                       }
//                     />
//                   </div>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Plus,
  Thermometer,
  Droplets,
  Trash2,
  Lightbulb,
  LightbulbOff,
  GripHorizontal,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";

// --- Types ---
interface Device {
  id: number;
  name: string;
  ip: string;
  temperature: number | null;
  humidity: number | null;
  lampStatus: "on" | "off";
  lastUpdate: number;
  isOffline: boolean;
}

// --- Fonction utilitaire ---
const reorder = (
  list: Device[],
  startIndex: number,
  endIndex: number
): Device[] => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

// --- Constantes LocalStorage ---
const STORAGE_KEY_DEVICES = "devices";
const STORAGE_KEY_ORDER = "devices_order";

export default function Dashboard() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [order, setOrder] = useState<number[]>([]);
  const [name, setName] = useState("");
  const [ip, setIp] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // --- 1. Chargement ---
  useEffect(() => {
    const savedDevices = localStorage.getItem(STORAGE_KEY_DEVICES);
    const savedOrder = localStorage.getItem(STORAGE_KEY_ORDER);

    if (savedDevices) setDevices(JSON.parse(savedDevices));
    if (savedOrder) setOrder(JSON.parse(savedOrder));
    setMounted(true);
  }, []);

  // --- 2. Sauvegarde ---
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem(STORAGE_KEY_DEVICES, JSON.stringify(devices));
    
    const deviceIds = devices.map(d => d.id);
    const isValidOrder = order.length === deviceIds.length && order.every(id => deviceIds.includes(id));
    
    if (!isValidOrder) {
      const existingOrderedIds = order.filter(id => deviceIds.includes(id));
      const newIds = deviceIds.filter(id => !existingOrderedIds.includes(id));
      const finalOrder = [...existingOrderedIds, ...newIds];
      
      if (JSON.stringify(finalOrder) !== JSON.stringify(order)) {
        setOrder(finalOrder);
        localStorage.setItem(STORAGE_KEY_ORDER, JSON.stringify(finalOrder));
      }
    } else {
      localStorage.setItem(STORAGE_KEY_ORDER, JSON.stringify(order));
    }
  }, [devices, order, mounted]);

  // --- 3. Liste triée ---
  const orderedDevices = useMemo(() => {
    if (!mounted || devices.length === 0) return [];
    const deviceMap = new Map(devices.map(d => [d.id, d]));
    const sorted = order
      .map(id => deviceMap.get(id))
      .filter((d): d is Device => d !== undefined);
    const sortedIds = new Set(sorted.map(d => d.id));
    const remaining = devices.filter(d => !sortedIds.has(d.id));
    return [...sorted, ...remaining];
  }, [devices, order, mounted]);

  // --- 4. Logique Métier ---
  const fetchData = useCallback(async (ipAddr: string) => {
    try {
      const res = await fetch(`http://${ipAddr}:5000/status`, { mode: "cors" });
      const data = await res.json();
      setDevices((prev) =>
        prev.map((d) =>
          d.ip === ipAddr
            ? {
                ...d,
                temperature: data.temperature ?? null,
                humidity: data.humidity ?? null,
                lampStatus: data.lampStatus ?? "off",
                lastUpdate: Date.now(),
                isOffline: false,
              }
            : d
        )
      );
    } catch (error) {
      setDevices((prev) =>
        prev.map((d) => (d.ip === ipAddr ? { ...d, isOffline: true } : d))
      );
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const interval = setInterval(() => {
      devices.forEach((device) => fetchData(device.ip));
    }, 5000);
    return () => clearInterval(interval);
  }, [devices, fetchData, mounted]);

  const addDevice = () => {
    if (!name || !ip) return;
    const newId = Date.now();
    const newDevice: Device = {
      id: newId,
      name,
      ip,
      temperature: null,
      humidity: null,
      lampStatus: "off",
      lastUpdate: Date.now(),
      isOffline: false,
    };
    setDevices((prev) => [...prev, newDevice]);
    setOrder((prev) => [...prev, newId]);
    setName("");
    setIp("");
    setIsOpen(false);
    fetchData(ip);
  };

  const deleteDevice = (id: number) => {
    setDevices((prev) => prev.filter((d) => d.id !== id));
    setOrder((prev) => prev.filter((oId) => oId !== id));
  };

  const toggleLamp = async (ip: string, currentStatus: "on" | "off") => {
    const action = currentStatus === "on" ? "off" : "on";
    setDevices((prev) =>
      prev.map((d) => (d.ip === ip ? { ...d, lampStatus: action } : d))
    );
    try {
      const res = await fetch(`http://${ip}:5000/led/${action}`, {
        method: "POST",
        mode: "cors",
      });
      const data = await res.json();
      setDevices((prev) =>
        prev.map((d) => (d.ip === ip ? { ...d, lampStatus: data.led } : d))
      );
    } catch (error) {
      setDevices((prev) =>
        prev.map((d) => (d.ip === ip ? { ...d, lampStatus: currentStatus } : d))
      );
    }
  };

  // --- 5. Drag & Drop ---
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    if (sourceIndex === destinationIndex) return;

    const reorderedDevices = reorder(orderedDevices, sourceIndex, destinationIndex);
    setOrder(reorderedDevices.map(d => d.id));
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Mes Raspberry</h1>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" />Ajouter</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Nouveau Raspberry Pi</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-4">
                <div><Label>Nom</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="RPI Salon" /></div>
                <div><Label>Adresse IP</Label><Input value={ip} onChange={(e) => setIp(e.target.value)} placeholder="192.168.1.50" /></div>
                <Button onClick={addDevice} className="w-full">Ajouter</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {devices.length === 0 ? (
          <Card className="text-center py-16 border-dashed"><CardContent><p className="text-gray-500 mb-4">Aucun Raspberry Pi configuré</p><Button variant="outline" onClick={() => setIsOpen(true)}><Plus className="mr-2 h-4 w-4" />Ajouter un RPI</Button></CardContent></Card>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="rpi-grid" direction="horizontal">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  // MODIFICATION ICI: Utilisation de Flex avec marges négatives pour simuler une Grid fluide
                  className="flex flex-wrap -m-3" 
                >
                  {orderedDevices.map((device, index) => (
                    <Draggable
                      key={device.id}
                      draggableId={device.id.toString()}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          // MODIFICATION ICI: Largeur définie pour simuler les colonnes (1/2 sur tablette, 1/3 sur desktop)
                          // Le padding p-3 crée l'espacement visuel (gap)
                          className="w-full md:w-1/2 lg:w-1/3 p-3"
                          style={{
                            ...provided.draggableProps.style,
                            // Optionnel: z-index élevé pendant le drag pour passer au dessus des autres
                            zIndex: snapshot.isDragging ? 999 : "auto", 
                          }}
                        >
                          {/* h-full est important pour que toutes les cartes d'une ligne aient la même hauteur */}
                          <Card className={`h-full relative transition-shadow ${snapshot.isDragging ? "shadow-2xl ring-2 ring-black rotate-2 scale-105 bg-white" : "shadow-sm"}`}>
                            
                            {/* Overlay OFFLINE */}
                            {device.isOffline && (
                              <div className="absolute inset-0 top-[60px] bg-white/80 backdrop-blur-sm rounded-b-lg flex flex-col items-center justify-center z-10 text-gray-500">
                                <span className="font-bold text-lg">HORS LIGNE</span>
                                <span className="text-xs">Vérifiez la connexion</span>
                              </div>
                            )}

                            <CardHeader className="pb-2">
                              <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                  <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-gray-100 text-gray-400">
                                    <GripHorizontal className="h-5 w-5" />
                                  </div>
                                  <div>
                                    <CardTitle className="text-lg">{device.name}</CardTitle>
                                    <p className="text-xs text-gray-400 font-mono mt-1">{device.ip}</p>
                                  </div>
                                </div>
                                <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-600 hover:bg-red-50" onClick={() => deleteDevice(device.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </CardHeader>

                            <CardContent className="space-y-5 pt-2">
                              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-5 text-center border border-orange-100">
                                <div className="flex justify-center mb-2"><Thermometer className="h-6 w-6 text-orange-500" /></div>
                                {device.temperature !== null ? (
                                  <>
                                    <div className="text-3xl font-bold text-gray-800">{device.temperature.toFixed(1)}°C</div>
                                    {device.humidity !== null && <div className="flex items-center justify-center gap-1.5 mt-2 text-sm text-blue-600 font-medium"><Droplets className="h-3 w-3" />{device.humidity.toFixed(1)}%</div>}
                                  </>
                                ) : <div className="text-gray-400 py-2">--°C</div>}
                              </div>

                              <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <div className={`p-2 rounded-full ${device.lampStatus === 'on' ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-200 text-gray-500'}`}>
                                      {device.lampStatus === "on" ? <Lightbulb className="h-5 w-5" /> : <LightbulbOff className="h-5 w-5" />}
                                  </div>
                                  <span className="font-medium text-sm text-gray-700">Eclairage</span>
                                </div>
                                <Switch checked={device.lampStatus === "on"} onCheckedChange={() => toggleLamp(device.ip, device.lampStatus)} disabled={device.isOffline} />
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>
    </div>
  );
}