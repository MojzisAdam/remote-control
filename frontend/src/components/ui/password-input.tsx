import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/utils/utils";

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	containerClassName?: string;
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(({ className, containerClassName, ...props }, ref) => {
	const [showPassword, setShowPassword] = React.useState(false);

	const togglePasswordVisibility = () => {
		setShowPassword((prev) => !prev);
	};

	return (
		<div className={cn("relative", containerClassName)}>
			<Input
				type={showPassword ? "text" : "password"}
				className={cn("pr-10", className)}
				ref={ref}
				{...props}
			/>
			<button
				type="button"
				onClick={togglePasswordVisibility}
				className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 focus:outline-none"
				aria-label={showPassword ? "Hide password" : "Show password"}
			>
				{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
			</button>
		</div>
	);
});

PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
