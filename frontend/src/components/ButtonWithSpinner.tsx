import React from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ButtonWithSpinnerProps {
	onClick?: () => Promise<void>;
	isLoading: boolean;
	label: string;
	className?: string;
	variant?:
		| "default"
		| "destructive"
		| "outline"
		| "secondary"
		| "ghost"
		| "link"
		| null
		| undefined;
	disabled?: boolean;
}

const ButtonWithSpinner: React.FC<ButtonWithSpinnerProps> = ({
	onClick,
	isLoading,
	label,
	className,
	variant,
	disabled,
}) => {
	return (
		<Button
			onClick={onClick}
			disabled={isLoading || disabled}
			className={className}
			variant={variant}
		>
			{isLoading && <Loader2 className="animate-spin" />}
			{label}
		</Button>
	);
};

export default ButtonWithSpinner;
