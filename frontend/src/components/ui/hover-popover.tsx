import React, { useState, useRef } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface HoverClickPopoverProps {
	children: React.ReactNode;
	content: React.ReactNode;
	align?: "center" | "start" | "end";
	side?: "top" | "right" | "bottom" | "left";
	className?: string;
}

const HoverClickPopover: React.FC<HoverClickPopoverProps> = ({ children, content, align = "center", side = "bottom", className = "" }) => {
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const [isClickLocked, setIsClickLocked] = useState<boolean>(false);
	const timeoutRef = useRef<number | null>(null);

	const handleMouseEnter = (): void => {
		if (timeoutRef.current !== null) {
			clearTimeout(timeoutRef.current);
		}
		if (!isClickLocked) {
			setIsOpen(true);
		}
	};

	const handleMouseLeave = (): void => {
		if (!isClickLocked) {
			timeoutRef.current = window.setTimeout(() => {
				setIsOpen(false);
			}, 100);
		}
	};

	const handleClick = (e: React.MouseEvent<HTMLDivElement>): void => {
		e.preventDefault();

		if (isOpen && isClickLocked) {
			setIsClickLocked(false);
			setIsOpen(false);
		} else {
			setIsClickLocked(true);
			setIsOpen(true);
		}
	};

	const handleOpenChange = (open: boolean): void => {
		setIsOpen(open);
		if (!open) {
			setIsClickLocked(false);
		}
	};

	return (
		<Popover
			open={isOpen}
			onOpenChange={handleOpenChange}
		>
			<PopoverTrigger asChild>
				<div
					className={className}
					onMouseEnter={handleMouseEnter}
					onMouseLeave={handleMouseLeave}
					onClick={handleClick}
				>
					{children}
				</div>
			</PopoverTrigger>
			<PopoverContent
				align={align}
				side={side}
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
			>
				{content}
			</PopoverContent>
		</Popover>
	);
};

export { HoverClickPopover };
