import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pencil, X, Check, Loader2 } from "lucide-react";
import { useDevices } from "@/hooks/useDevices";
import AuthSessionStatus from "@/components/AuthSessionStatus";
import { Device } from "@/api/devices/model";

interface DeviceNameEditorProps {
	device: Device;
	updateDeviceSheet: (updateDeviceSheet: Device) => void;
}

const DeviceNameEditor: React.FC<DeviceNameEditorProps> = ({ device, updateDeviceSheet }) => {
	const { updateDevice, loading, error } = useDevices();
	const [isEditingName, setIsEditingName] = useState(false);
	const [editedName, setEditedName] = useState(device.own_name || "");
	const [statusInfName, setStatusInfName] = useState<string | null>(null);

	const handleSaveName = async () => {
		try {
			const result = await updateDevice(device.id, {
				own_name: editedName ?? "",
			});
			setStatusInfName(result.status || error || null);

			if (result.success) {
				device.own_name = editedName ?? "";
				setIsEditingName(false);
				setStatusInfName(null);
				updateDeviceSheet(device);
			}
		} catch {
			setStatusInfName("Something went wrong. Please try again later.");
		}
	};

	const handleCancelName = () => {
		setEditedName(device.own_name || "");
		setIsEditingName(false);
		setStatusInfName(null);
	};

	return (
		<div>
			<div className="flex gap-2 items-center w-[85%] mb-4">
				{!isEditingName ? (
					<div className=" flex items-center">
						<p className="text-left h-full">{device.own_name ? `${device.own_name} (${device.id})` : device.id}</p>
						<Button
							variant="ghost"
							size="icon"
							onClick={() => setIsEditingName(true)}
						>
							<Pencil />
						</Button>
					</div>
				) : (
					<div className="flex sm:items-center flex-col sm:flex-row gap-2">
						<Input
							name="own_name"
							id="own_name"
							value={editedName}
							onChange={(e) => setEditedName(e.target.value)}
							className={(device.own_name ?? "") !== (editedName ?? "") ? "border-2 border-blue-500 ring-blue-500 max-w-64 focus-visible:ring-blue-500" : "max-w-64"}
						/>
						<div className="flex items-center max-sm:justify-between gap-2">
							<p>({device.id})</p>
							{loading ? (
								<Button
									variant="secondary"
									size="icon"
									disabled
								>
									<Loader2 className="animate-spin" />
								</Button>
							) : (
								<div className="flex space-x-1">
									<Button
										variant="ghost"
										size="icon"
										onClick={handleCancelName}
									>
										<X />
									</Button>
									<Button
										variant="secondary"
										size="icon"
										onClick={handleSaveName}
									>
										<Check />
									</Button>
								</div>
							)}
						</div>
					</div>
				)}
			</div>
			{statusInfName && (
				<AuthSessionStatus
					className="mt-0"
					status={statusInfName}
				/>
			)}
		</div>
	);
};

export default DeviceNameEditor;
