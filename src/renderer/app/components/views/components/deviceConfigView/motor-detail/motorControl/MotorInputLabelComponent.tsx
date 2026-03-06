import ErrorMessage from "~/components/sharedComponent/ErrorMessage";
import { cn } from "~/lib/utils";

function MotorInputLabelComponent({
  value,
  labelText = "Pulse",
  onChange,
  disabled = false,
  error,
  placeholder,
}: {
  value: number | string; // <-- allow empty string
  labelText: string;
  disabled?: boolean;
  error?: string;
  onChange?: (value: number | string) => void; // <-- allow string
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <div
        className={cn(
          "w-[150px] h-9 flex rounded-full overflow-hidden border border-borderLightColor",
          disabled && "opacity-50"
        )}
      >
        <div className="w-[50%] h-full">
          <input
            type="number"
            min={0} // restrict negatives at HTML level
            disabled={disabled}
            placeholder={placeholder}
            className="w-full h-full text-center bg-transparent outline-none border-none placeholder:text-textLightColor/50"
            value={value}
            onChange={(e) => {
              const raw = e.target.value;

              // allow empty input
              if (raw === "") {
                onChange?.("");
                return;
              }

              const num = Number(raw);

              // block negative input
              if (num < 0) {
                return;
              }

              // valid positive number
              onChange?.(num);
            }}
          />
        </div>
        <div className="w-[50%] h-full">
          <div className="bg-motorInputBgColor text-sm text-white h-full flex justify-center items-center capitalize">
            <span>{labelText}</span>
          </div>
        </div>
      </div>
      <span
        className={cn(
          error ? "block" : "invisible",
          "absolute top-full left-0"
        )}
      >
        <ErrorMessage errorMessage={error} />
      </span>
    </div>
  );
}

export default MotorInputLabelComponent;
