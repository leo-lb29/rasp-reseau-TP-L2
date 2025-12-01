"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Thermometer,
  Droplets,
  Trash2,
  Lightbulb,
  LightbulbOff,
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

export default function Dashboard() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [name, setName] = useState("");
  const [ip, setIp] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Charger devices depuis localStorage
  useEffect(() => {
    const saved = localStorage.getItem("devices");
    if (saved) setDevices(JSON.parse(saved));
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("devices", JSON.stringify(devices));
    }
  }, [devices, mounted]);

  // fetchData avec mise à jour isOffline
  const fetchData = async (ipAddr: string) => {
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
                isOffline: false, // succès → device en ligne
              }
            : d
        )
      );
    } catch (error) {
      console.error(`Erreur ${ipAddr}:`, error);
      setDevices((prev) =>
        prev.map((d) =>
          d.ip === ipAddr
            ? { ...d, isOffline: true } // échec → device offline
            : d
        )
      );
    }
  };

  // Actualiser les données toutes les 10 secondes pour tous les devices
  useEffect(() => {
    const interval = setInterval(() => {
      devices.forEach((device) => fetchData(device.ip));
    }, 2000);
    return () => clearInterval(interval);
  }, [devices]);

  const addDevice = () => {
    if (!name || !ip) return;

    const device: Device = {
      id: Date.now(),
      name,
      ip,
      temperature: null,
      humidity: null,
      lampStatus: "off",
      lastUpdate: Date.now(),
      isOffline: false,
    };

    setDevices((prev) => [...prev, device]);
    setName("");
    setIp("");
    setIsOpen(false);
    fetchData(ip);
  };

  const deleteDevice = (id: number) => {
    setDevices((prev) => prev.filter((d) => d.id !== id));
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
      console.error("Erreur toggle:", error);
      setDevices((prev) =>
        prev.map((d) => (d.ip === ip ? { ...d, lampStatus: currentStatus } : d))
      );
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Campus Connecté</h1>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Ajouter
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nouveau Raspberry Pi</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label>Nom</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="RPI Salon"
                  />
                </div>
                <div>
                  <Label>Adresse IP</Label>
                  <Input
                    value={ip}
                    onChange={(e) => setIp(e.target.value)}
                    placeholder="192.168.2.10"
                  />
                </div>
                <Button onClick={addDevice} className="w-full">
                  Ajouter
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {devices.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <p className="text-gray-500 mb-4">Aucun Raspberry Pi configuré</p>
              <Button onClick={() => setIsOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Ajouter un RPI
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {devices.map((device) => (
              <Card key={device.id} className="relative">
                {/* Overlay OFFLINE */}
                {device.isOffline && (
                  <div className="absolute inset-0 top-20 bg-black/50 rounded-b-lg flex items-center justify-center z-10">
                    <div className="text-white font-bold text-lg">Raspberry Pi OFFLINE</div>
                  </div>
                )}

                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{device.name}</CardTitle>
                      <p className="text-sm text-gray-500 font-mono">{device.ip}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteDevice(device.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-6 text-center">
                    <Thermometer className="h-8 w-8 mx-auto text-red-500 mb-2" />
                    {device.temperature !== null ? (
                      <>
                        <div className="text-4xl font-bold text-red-600">
                          {device.temperature.toFixed(1)}°C
                        </div>
                        {device.humidity !== null && (
                          <div className="flex items-center justify-center gap-2 mt-2 text-cyan-600">
                            <Droplets className="h-4 w-4" />
                            {device.humidity.toFixed(1)}%
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-gray-400">--°C</div>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">
                        {device.lampStatus === "on" ? <Lightbulb /> : <LightbulbOff />}
                      </span>
                      <span className="font-medium">Lampe</span>
                    </div>
                    <Switch
                      checked={device.lampStatus === "on"}
                      onCheckedChange={() =>
                        toggleLamp(device.ip, device.lampStatus)
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
