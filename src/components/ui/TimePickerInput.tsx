import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import React from "react";
import {
  Period,
  TimePickerType,
  getArrowByType,
  getDateByType,
  setDateByType,
} from "./time-picker-utils";
import { FaCaretUp } from "react-icons/fa";
import { FaCaretDown } from "react-icons/fa";
import Button from "./Button";

export interface TimePickerInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  picker: TimePickerType;
  date: Date | undefined;
  setDate: (date: Date) => void;
  period?: Period;
  onRightFocus?: () => void;
  onLeftFocus?: () => void;
}

const TimePickerInput = React.forwardRef<
  HTMLInputElement,
  TimePickerInputProps
>(
  (
    {
      className,
      type = "tel",
      value,
      id,
      name,
      date = new Date(new Date().setHours(0, 0, 0, 0)),
      setDate,
      onChange,
      onKeyDown,
      picker,
      period,
      onLeftFocus,
      onRightFocus,
      ...props
    },
    ref
  ) => {
    const [flag, setFlag] = React.useState<boolean>(false);
    const [prevIntKey, setPrevIntKey] = React.useState<string>("0");

    React.useEffect(() => {
      if (flag) {
        const timer = setTimeout(() => {
          setFlag(false);
        }, 2000);

        return () => clearTimeout(timer);
      }
    }, [flag]);

    const calculatedValue = React.useMemo(() => {
      return getDateByType(date, picker);
    }, [date, picker]);

    const calculateNewValue = (key: string) => {
      if (picker === "12hours") {
        if (flag && calculatedValue.slice(1, 2) === "1" && prevIntKey === "0")
          return "0" + key;
      }

      return !flag ? "0" + key : calculatedValue.slice(1, 2) + key;
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Tab") return;
      e.preventDefault();
      if (e.key === "ArrowRight") onRightFocus?.();
      if (e.key === "ArrowLeft") onLeftFocus?.();
      if (["ArrowUp", "ArrowDown"].includes(e.key)) {
        const step = e.key === "ArrowUp" ? 1 : -1;
        const newValue = getArrowByType(calculatedValue, step, picker);
        if (flag) setFlag(false);
        const tempDate = new Date(date);
        setDate(setDateByType(tempDate, newValue, picker, period));
      }
      if (e.key >= "0" && e.key <= "9") {
        if (picker === "12hours") setPrevIntKey(e.key);

        const newValue = calculateNewValue(e.key);
        if (flag) onRightFocus?.();
        setFlag((prev) => !prev);
        const tempDate = new Date(date);
        setDate(setDateByType(tempDate, newValue, picker, period));
      }
    };

    const handleStep = (step: number) => {
      const newValue = getArrowByType(calculatedValue, step, picker);
      const tempDate = new Date(date);
      setDate(setDateByType(tempDate, newValue, picker, period));
    };

    return (
      <div className="flex flex-col justify-between items-center gap-1">
        <Button
          onClick={() => handleStep(1)}
          classname="hover:bg-slate-200 p-[2px] rounded-full"
        >
          <FaCaretUp size={16} />
        </Button>
        <Input
          ref={ref}
          id={id || picker}
          name={name || picker}
          className={cn(
            "w-[48px] text-center font-mono text-base tabular-nums focus:bg-accent focus:text-accent-foreground [&::-webkit-inner-spin-button]:appearance-none",
            className
          )}
          value={value || calculatedValue}
          onChange={(e) => {
            e.preventDefault();
            onChange?.(e);
          }}
          type={type}
          inputMode="decimal"
          onKeyDown={(e) => {
            onKeyDown?.(e);
            handleKeyDown(e);
          }}
          {...props}
        />
        <Button
          onClick={() => handleStep(-1)}
          classname="hover:bg-slate-200 p-[2px] rounded-full" 
        >
          <FaCaretDown size={16} />
        </Button>
      </div>
    );
  }
);

TimePickerInput.displayName = "TimePickerInput";

export { TimePickerInput };