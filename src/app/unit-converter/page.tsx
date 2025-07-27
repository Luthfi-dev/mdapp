'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowRightLeft } from 'lucide-react';

// Conversion factors relative to a base unit
const lengthUnits = {
  meters: 1,
  kilometers: 1000,
  miles: 1609.34,
  feet: 0.3048,
  inches: 0.0254,
};

const weightUnits = {
  grams: 1,
  kilograms: 1000,
  pounds: 453.592,
  ounces: 28.3495,
};

type UnitData = {
  [key: string]: number;
};

const UnitConverterTab = ({
  units,
  defaultFrom,
  defaultTo,
  isTemperature = false
}: {
  units: UnitData;
  defaultFrom: string;
  defaultTo: string;
  isTemperature?: boolean;
}) => {
  const [fromUnit, setFromUnit] = useState(defaultFrom);
  const [toUnit, setToUnit] = useState(defaultTo);
  const [fromValue, setFromValue] = useState('1');
  const [toValue, setToValue] = useState('');

  const convert = (value: number, from: string, to: string) => {
    if(from === to) return value;
    
    if (isTemperature) {
        if(from === 'celsius' && to === 'fahrenheit') return (value * 9/5) + 32;
        if(from === 'celsius' && to === 'kelvin') return value + 273.15;
        if(from === 'fahrenheit' && to === 'celsius') return (value - 32) * 5/9;
        if(from === 'fahrenheit' && to === 'kelvin') return (value - 32) * 5/9 + 273.15;
        if(from === 'kelvin' && to === 'celsius') return value - 273.15;
        if(from === 'kelvin' && to === 'fahrenheit') return (value - 273.15) * 9/5 + 32;
        return value;
    }
    
    const valueInBase = value * units[from];
    const valueInTarget = valueInBase / units[to];
    return valueInTarget;
  };

  useMemo(() => {
    const val = parseFloat(fromValue);
    if (!isNaN(val)) {
      const result = convert(val, fromUnit, toUnit);
      setToValue(result.toFixed(4));
    } else {
      setToValue('');
    }
  }, [fromValue, fromUnit, toUnit]);

  const handleFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFromValue(e.target.value);
  };
  
  const handleToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     const val = parseFloat(e.target.value);
     if (!isNaN(val)) {
        setToValue(e.target.value)
        const result = convert(val, toUnit, fromUnit);
        setFromValue(result.toFixed(4));
     } else {
        setFromValue('');
        setToValue('');
     }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
        <div className="space-y-2">
          <Label htmlFor="from-value">From</Label>
          <Input id="from-value" type="number" value={fromValue} onChange={handleFromChange} />
          <Select value={fromUnit} onValueChange={setFromUnit}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.keys(units).map(unit => <SelectItem key={unit} value={unit}>{unit.charAt(0).toUpperCase() + unit.slice(1)}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="to-value">To</Label>
          <Input id="to-value" type="number" value={toValue} onChange={handleToChange} />
          <Select value={toUnit} onValueChange={setToUnit}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.keys(units).map(unit => <SelectItem key={unit} value={unit}>{unit.charAt(0).toUpperCase() + unit.slice(1)}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default function UnitConverterPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Unit Converter</CardTitle>
          <CardDescription>Select a category and convert units instantly.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="length" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="length">Length</TabsTrigger>
              <TabsTrigger value="weight">Weight</TabsTrigger>
              <TabsTrigger value="temperature">Temperature</TabsTrigger>
            </TabsList>
            <TabsContent value="length" className="mt-6">
              <UnitConverterTab units={lengthUnits} defaultFrom="meters" defaultTo="feet" />
            </TabsContent>
            <TabsContent value="weight" className="mt-6">
              <UnitConverterTab units={weightUnits} defaultFrom="kilograms" defaultTo="pounds" />
            </TabsContent>
            <TabsContent value="temperature" className="mt-6">
              <UnitConverterTab units={{celsius: 0, fahrenheit: 0, kelvin: 0}} defaultFrom="celsius" defaultTo="fahrenheit" isTemperature={true} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
