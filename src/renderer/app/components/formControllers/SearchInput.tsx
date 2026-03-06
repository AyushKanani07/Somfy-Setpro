import { Search, X } from "lucide-react";
import { useCallback } from "react";
import type { ChangeEvent } from "react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onClear?: () => void;
  disabled?: boolean;
  className?: string;
  debounceMs?: number;
}

/**
 * Reusable search input component with clear button
 */
function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  onClear,
  disabled = false,
  className = "",
  debounceMs = 300,
}: SearchInputProps) {
  let debounceTimer: NodeJS.Timeout | null = null;

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;

      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      debounceTimer = setTimeout(() => {
        onChange(newValue);
      }, debounceMs);
    },
    [onChange, debounceMs]
  );

  const handleClear = useCallback(() => {
    onChange("");
    onClear?.();
  }, [onChange, onClear]);

  return (
    <div
      className={`flex justify-start items-center gap-4 rounded-full border border-borderColor px-4 py-2 ${className} ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      <Search size={14} className="text-textDarkColor flex-shrink-0" />
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={handleChange}
        disabled={disabled}
        className="bg-transparent text-sm flex-1 focus:outline-none text-textDarkColor placeholder:text-gray-400"
      />
      {value && (
        <button
          onClick={handleClear}
          disabled={disabled}
          className="text-textDarkColor hover:text-gray-600 transition-colors flex-shrink-0"
          aria-label="Clear search"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}

export default SearchInput;
