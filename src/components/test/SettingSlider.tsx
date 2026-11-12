interface SettingSliderProps {
  id: string;
  label: string;
  help: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
}

/** Labelled range slider that also shows its current value as text. */
export function SettingSlider({ id, label, help, min, max, step, value, onChange }: SettingSliderProps) {
  const shown = value.toLocaleString('bg-BG', { maximumFractionDigits: 3 });
  return (
    <div className="slider">
      <label htmlFor={id}>
        {label}: <output htmlFor={id}>{shown}</output>
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-describedby={`${id}-help`}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <span id={`${id}-help`} className="slider__help">{help}</span>
    </div>
  );
}
