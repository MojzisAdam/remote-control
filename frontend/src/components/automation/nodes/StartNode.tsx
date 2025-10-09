import React from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { Card } from "@/components/ui/card";
import { Play } from "lucide-react";
import { FlowData } from "@/api/automation/model";

const StartNode: React.FC<NodeProps> = ({ data, selected }) => {
	return (
		<Card className={`min-w-[120px] ${selected ? "ring-2 ring-primary" : ""}`}>
			<div className="p-3 flex items-center justify-center space-x-2 bg-green-50 dark:bg-green-200 rounded-md">
				<Play className="w-4 h-4 text-green-600" />
				<span className="text-sm font-medium text-green-700">Start</span>
			</div>
			<Handle
				type="source"
				position={Position.Right}
				className="!bg-green-500 !border-green-600 !h-2 !w-2 hover:!bg-green-400 transition-all duration-200"
			/>
		</Card>
	);
};

export default StartNode;
