import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Monitor, Smartphone, ArrowLeft } from "lucide-react";

interface MobileWarningProps {
	title?: string;
	content?: string;
	onGoBack: () => void;
}

export const MobileWarning: React.FC<MobileWarningProps> = ({ title = "Mobile Not Supported", content = "", onGoBack }) => {
	return (
		<div className="mt-20 flex items-center justify-center">
			<Card className="w-full max-w-md">
				<CardHeader className="text-center pb-2">
					<div className="flex justify-center mb-2">
						<div className="relative">
							<Monitor className="w-12 h-12 text-primary" />
							<Smartphone className="w-6 h-6 text-muted-foreground absolute -bottom-1 -right-1" />
						</div>
					</div>
					<CardTitle className="text-lg">{title}</CardTitle>
				</CardHeader>
				<CardContent className="text-center space-y-4">
					<p className="text-sm text-muted-foreground">{content}</p>
					<div className="space-y-2 text-xs text-muted-foreground">
						<p>Please use:</p>
						<ul className="list-disc list-inside space-y-1">
							<li>Desktop computer</li>
							<li>Laptop</li>
						</ul>
					</div>
					<div className="flex flex-col gap-2 pt-4">
						<Button
							onClick={onGoBack}
							variant="default"
							size="sm"
						>
							<ArrowLeft className="w-4 h-4" />
							Back
						</Button>
						<Button
							onClick={() => window.location.reload()}
							variant="outline"
							size="sm"
						>
							Try Again
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

export default MobileWarning;
