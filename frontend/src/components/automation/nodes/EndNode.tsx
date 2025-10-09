import React from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { Card } from "@/components/ui/card";
import { Square } from "lucide-react";

const EndNode: React.FC<NodeProps> = ({ data, selected }) => {
	return (
		<Card className={`min-w-[120px] ${selected ? "ring-2 ring-primary" : ""}`}>
			<div className="p-3 flex items-center justify-center space-x-2 bg-red-50 dark:bg-red-100 rounded-md">
				<Square className="w-4 h-4 text-red-600" />
				<span className="text-sm font-medium text-red-700">End</span>
			</div>
			<Handle
				type="target"
				position={Position.Left}
				className="!bg-red-500 !border-red-600 !h-2 !w-2 hover:!bg-red-400 transition-all duration-200"
			/>
		</Card>
	);
};

export default EndNode;
