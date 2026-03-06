interface ActionButtonProps {
    disabled: boolean;
    icon?: string;
    label: string;
    onClick?: () => void;
}

export default function ActionButton({
    disabled,
    icon,
    label,
    onClick,
}: ActionButtonProps) {
    return (
        <button
            onClick={disabled ? undefined : onClick}
            disabled={disabled}
            className={`group relative flex items-center gap-4 px-6 py-4 rounded-xl border transition-all duration-300
                ${disabled
                    ? "bg-gray-100 border-gray-200 cursor-not-allowed opacity-60"
                    : "bg-gradient-to-br from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 border-gray-200 hover:border-gray-300 active:scale-[0.98]"}
                `}>
            {/* Icon Container */}
            {icon && (
                <div className={`flex-shrink-0 w-12 h-12 rounded-full bg-white flex items-center justify-center transition-shadow duration-300 
                ${disabled ? "shadow-none" : "shadow-sm group-hover:shadow-md"}`}>
                    <img src={icon} alt={label}
                        className={`w-7 h-7 object-contain transition-transform duration-300 ${disabled ? "" : "group-hover:scale-110"}`}
                    />
                </div>
            )}

            {/* Label */}
            <span
                className={`text-base font-medium transition-colors duration-300 ${disabled
                    ? "text-gray-400"
                    : "text-gray-700 group-hover:text-gray-900"}`}>
                {label}
            </span>

            {/* Gradient Overlay */}
            {!disabled && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-300 pointer-events-none" />
            )}
        </button>
    );
};