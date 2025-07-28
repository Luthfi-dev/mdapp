
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { History, Sigma, CornerDownLeft, Divide, X, Minus, Plus, Percent } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function CalculatorPage() {
  const [display, setDisplay] = useState('0');
  const [history, setHistory] = useState<string[]>([]);
  const [isScientific, setIsScientific] = useState(false);
  const [currentExpression, setCurrentExpression] = useState('');

  const handleInput = (value: string) => {
    if (display === 'Error') {
      setDisplay(value);
      setCurrentExpression(value);
      return;
    }
    const newDisplay = display === '0' ? value : display + value;
    setDisplay(newDisplay);
    setCurrentExpression(currentExpression + value);
  };

  const handleOperator = (operator: string) => {
    if (display === 'Error') return;
    const lastChar = currentExpression.slice(-1);
    if (['+', '-', '*', '/'].includes(lastChar)) {
      // Replace last operator
      setCurrentExpression(currentExpression.slice(0, -1) + operator);
    } else {
      setCurrentExpression(currentExpression + operator);
    }
    setDisplay(operator);
  };
  
  const calculateResult = () => {
    if (display === 'Error') return;
    try {
        // eslint-disable-next-line no-eval
        const result = eval(currentExpression.replace(/%/g, '/100'));
        const fullCalculation = `${currentExpression} = ${result}`;
        setDisplay(String(result));
        setHistory([fullCalculation, ...history]);
        setCurrentExpression(String(result));
    } catch (error) {
        setDisplay('Error');
        setCurrentExpression('');
    }
  };

  const clearDisplay = () => {
    setDisplay('0');
    setCurrentExpression('');
  };
  
  const backspace = () => {
      if (display === 'Error') {
          clearDisplay();
          return;
      }
      setDisplay(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
      setCurrentExpression(prev => prev.length > 1 ? prev.slice(0, -1) : '');
  }

  const handleScientific = (func: string) => {
    if (display === 'Error') return;
    try {
      const value = parseFloat(display);
      let result;
      switch (func) {
        case 'sin': result = Math.sin(value * Math.PI / 180); break;
        case 'cos': result = Math.cos(value * Math.PI / 180); break;
        case 'tan': result = Math.tan(value * Math.PI / 180); break;
        case 'log': result = Math.log10(value); break;
        case 'ln': result = Math.log(value); break;
        case 'sqrt': result = Math.sqrt(value); break;
        case '^2': result = Math.pow(value, 2); break;
        case 'pi': result = Math.PI; break;
        default: result = value;
      }
       const newExpression = String(result);
       setDisplay(newExpression);
       setCurrentExpression(newExpression);
    } catch (e) {
      setDisplay('Error');
      setCurrentExpression('');
    }
  }

  const buttonClass = "h-16 text-2xl font-bold rounded-2xl";
  const sciButtonClass = "h-12 text-xl font-bold rounded-2xl";

  const renderButtons = () => {
    const buttons = [
      { label: 'C', action: clearDisplay, className: 'bg-destructive/80 hover:bg-destructive text-white' },
      { label: '⌫', action: backspace },
      { label: '%', action: () => handleOperator('%') },
      { label: '÷', action: () => handleOperator('/'), icon: <Divide/> },
      { label: '7', action: () => handleInput('7') },
      { label: '8', action: () => handleInput('8') },
      { label: '9', action: () => handleInput('9') },
      { label: '×', action: () => handleOperator('*'), icon: <X/> },
      { label: '4', action: () => handleInput('4') },
      { label: '5', action: () => handleInput('5') },
      { label: '6', action: () => handleInput('6') },
      { label: '−', action: () => handleOperator('-'), icon: <Minus/> },
      { label: '1', action: () => handleInput('1') },
      { label: '2', action: () => handleInput('2') },
      { label: '3', action: () => handleInput('3') },
      { label: '+', action: () => handleOperator('+'), icon: <Plus/> },
      { label: '0', action: () => handleInput('0'), className: 'col-span-2' },
      { label: '.', action: () => handleInput('.') },
      { label: '=', action: calculateResult, className: 'bg-primary hover:bg-primary/90 text-white' },
    ];

    const scientificButtons = [
        { label: 'sin', action: () => handleScientific('sin') },
        { label: 'cos', action: () => handleScientific('cos') },
        { label: 'tan', action: () => handleScientific('tan') },
        { label: 'log', action: () => handleScientific('log') },
        { label: 'ln', action: () => handleScientific('ln') },
        { label: '√', action: () => handleScientific('sqrt') },
        { label: 'x²', action: () => handleScientific('^2') },
        { label: 'π', action: () => handleScientific('pi') },
    ];
    
    return (
        <>
        {isScientific && (
            <div className="grid grid-cols-4 gap-2 mb-2">
                {scientificButtons.map(b => (
                    <Button key={b.label} onClick={b.action} variant="outline" className={sciButtonClass}>{b.label}</Button>
                ))}
            </div>
        )}
        <div className="grid grid-cols-4 grid-rows-5 gap-2">
            {buttons.map(btn => (
                <Button key={btn.label} onClick={btn.action} variant="outline" className={`${buttonClass} ${btn.className || ''}`}>
                  {btn.icon || btn.label}
                </Button>
            ))}
        </div>
        </>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pb-24">
      <Card className="max-w-md mx-auto shadow-2xl rounded-3xl overflow-hidden">
        <CardHeader>
          <CardTitle className="text-2xl font-headline flex items-center justify-between">
            Kalkulator
            <div className="flex items-center space-x-2">
                <Sigma className='w-4 h-4' />
                <Switch id="scientific-mode" checked={isScientific} onCheckedChange={setIsScientific} />
                <Label htmlFor="scientific-mode" className="text-sm">Ilmiah</Label>
            </div>
          </CardTitle>
          <CardDescription>Kalkulator standar dan ilmiah dalam genggaman.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className='bg-background rounded-2xl p-4 mb-4 text-right'>
                <div className='text-muted-foreground text-sm h-6 truncate'>{currentExpression || '...'}</div>
                <div className="text-5xl font-bold break-all h-14">{display}</div>
            </div>
            
            <div className='flex items-center justify-between mb-2'>
                <div className='flex items-center gap-2 text-muted-foreground font-semibold'>
                    <History className='w-5 h-5'/>
                    <span>Riwayat</span>
                </div>
                {history.length > 0 && 
                    <Button variant="ghost" size="sm" onClick={() => setHistory([])}>Bersihkan</Button>
                }
            </div>
             <ScrollArea className="h-24 w-full bg-secondary/50 rounded-lg p-2 mb-4">
                {history.length > 0 ? (
                    history.map((item, index) => (
                        <div key={index} className="text-sm p-1 hover:bg-primary/10 rounded-md cursor-pointer" onClick={() => {
                            const [expr, res] = item.split(' = ');
                            setCurrentExpression(expr);
                            setDisplay(res);
                        }}>
                            {item}
                        </div>
                    ))
                ) : (
                    <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                        Tidak ada riwayat.
                    </div>
                )}
            </ScrollArea>
            
            {renderButtons()}

        </CardContent>
      </Card>
    </div>
  );
}
