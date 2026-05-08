// src/components/WeightController.tsx
// AI Role: 数値入力UIコンポーネント
// 役割: 重み付けを調整するためのコントローラーUIを提供する。

import React, { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface Props {
  value: number;
  onChange: (val: number) => void;
  disabled?: boolean;
}

export const WeightController: React.FC<Props> = ({ value, onChange, disabled }) => {
  const [localValue, setLocalValue] = useState<string>(value.toString());

  useEffect(() => {
    setLocalValue(value.toString());
  }, [value]);

  const handleAdjust = (delta: number) => {
    const newVal = Math.max(0, value + delta);
    onChange(newVal);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalValue(val);
    if (val !== '') {
      onChange(Number(val));
    }
  };

  const handleBlur = () => {
    if (localValue === '') {
      onChange(10);
    } else {
      const numVal = Math.max(0, Number(localValue));
      onChange(numVal);
      setLocalValue(numVal.toString());
    }
  };

  return (
    <div className="flex items-center gap-1 group/ctrl relative">
      {!disabled && (
        <div className="flex flex-col -gap-1 opacity-0 group-hover/ctrl:opacity-100 transition-opacity">
          <button onClick={() => handleAdjust(1)} className="text-val-gray/60 hover:text-val-red transition-colors">
            <ChevronUp className="w-3 h-3 md:w-4 md:h-4" />
          </button>
          <button onClick={() => handleAdjust(-1)} className="text-val-gray/60 hover:text-val-red transition-colors">
            <ChevronDown className="w-3 h-3 md:w-4 md:h-4" />
          </button>
        </div>
      )}

      <div className="flex items-center bg-black/20 px-1 py-0.5 rounded border border-white/10 focus-within:border-val-red/40 transition-colors z-10">
        <input
          type="number"
          min="0"
          value={localValue}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={disabled}
          className="bg-transparent text-val-light text-[10px] md:text-sm w-6 md:w-8 text-center outline-none appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
        />
      </div>

      {!disabled && (
        <div className="relative flex items-center justify-center w-4 h-4 md:w-5 md:h-5 opacity-0 group-hover/ctrl:opacity-100 transition-opacity">
          <select
            value={value}
            onChange={(e) => {
              onChange(Number(e.target.value));
              e.target.blur();
            }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
          >
            <option value="" disabled className="hidden">Select</option>
            {[10, 5, 4, 3, 2, 1, 0].map((val) => (
              <option key={val} value={val} className="bg-val-dark text-val-light">
                {val}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3 h-3 md:w-4 md:h-4 text-val-gray/60 pointer-events-none" />
        </div>
      )}
    </div>
  );
};