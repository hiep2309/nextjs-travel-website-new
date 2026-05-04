import Image from "next/image";

type ButtonProps = {
  type: "button" | "submit";
  title: string;
  icon?: string;
  variant: string;
  full?: boolean;
  disabled?: boolean;
  className?: string;
};

const Button = ({ type, title, icon, variant, full, disabled, className = "" }: ButtonProps) => {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`flexCenter min-h-[48px] gap-3 touch-manipulation ${variant} ${full ? "w-full" : ""} ${
        disabled ? "pointer-events-none cursor-not-allowed opacity-50" : ""
      } ${className}`}
    >
      {icon ? <Image src={icon} alt="" width={24} height={24} className="shrink-0" /> : null}
      <span className="bold-16 whitespace-nowrap">{title}</span>
    </button>
  );
};

export default Button;
