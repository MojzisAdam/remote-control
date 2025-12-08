import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { DeviceCapabilitiesProvider, useDeviceCapabilities } from "@/providers/DeviceCapabilitiesProvider";
import AutomationNotFound from "@/components/automation/AutomationNotFound";
import AutomationBuilderSkeleton from "@/components/automation/AutomationBuilderSkeleton";
import AutomationBuilderContent from "@/components/automation/AutomationBuilderContent";
import MobileWarning from "@/components/common/MobileWarning";

import { useAutomations } from "@/hooks/useAutomations";
import { useDevices } from "@/hooks/useDevices";
import { useIsMobile } from "@/hooks/useIsMobile";
import { Automation } from "@/api/automation/model";
import routes from "@/constants/routes";
import usePageTitle from "@/hooks/usePageTitle";
import withAuthorization from "@/middleware/withAuthorization";

const AutomationBuilderReadyGate: React.FC<{
	automationId: number | null;
	automation: Automation | null;
}> = ({ automationId, automation }) => {
	const { loading } = useDeviceCapabilities();

	if (loading) return <AutomationBuilderSkeleton />;

	return (
		<AutomationBuilderContent
			automationId={automationId}
			automation={automation}
		/>
	);
};

// Interface for route parameters
interface AutomationBuilderParams extends Record<string, string | undefined> {
	automationId?: string;
}

const AutomationBuilder: React.FC = () => {
	const { t } = useTranslation("automations");

	usePageTitle(t("page-title-builder"));

	// Mobile detection
	const isMobile = useIsMobile();
	const navigate = useNavigate();

	// Extract automationId from URL parameters
	const { automationId: automationIdParam } = useParams<AutomationBuilderParams>();
	const automationId = automationIdParam ? parseInt(automationIdParam, 10) : null;

	const [automationNotFound, setAutomationNotFound] = React.useState(false);
	const [isLoadingAutomation, setIsLoadingAutomation] = React.useState(!!automationId);
	const [isLoadingDevices, setIsLoadingDevices] = React.useState(true);
	const [automation, setAutomation] = React.useState<Automation | null>(null);

	const { fetchAutomation } = useAutomations();
	const { devices, fetchUserDevices } = useDevices();

	// Load existing automation if editing
	React.useEffect(() => {
		if (automationId) {
			setIsLoadingAutomation(true);
			setAutomationNotFound(false);

			fetchAutomation(automationId)
				.then((result) => {
					if (result.success && result.data.data) {
						const automation = result.data.data;
						setAutomation(automation);
						setAutomationNotFound(false);
					} else {
						console.error("Failed to fetch automation:", result);
						// Check if it's a 404 error or similar - automation not found
						setAutomationNotFound(true);
					}
				})
				.catch((error) => {
					console.error("Error fetching automation:", error);
					setAutomationNotFound(true);
				})
				.finally(() => {
					setIsLoadingAutomation(false);
				});
		} else {
			// Reset state when creating new automation
			setAutomation(null);
			setAutomationNotFound(false);
			setIsLoadingAutomation(false);
		}
	}, [automationId, fetchAutomation]);

	// Load devices
	React.useEffect(() => {
		const loadDevices = async () => {
			setIsLoadingDevices(true);
			try {
				await fetchUserDevices();
			} catch (error) {
				console.error("Error loading devices:", error);
			} finally {
				setIsLoadingDevices(false);
			}
		};

		loadDevices();
	}, [fetchUserDevices]);

	// Show mobile warning if on mobile device
	if (isMobile) {
		const handleGoBack = () => navigate(routes.automations);
		return (
			<MobileWarning
				content={t("builder.mobileWarning")}
				onGoBack={handleGoBack}
			/>
		);
	}

	// Show loading skeleton while fetching automation data or devices
	if (isLoadingAutomation || isLoadingDevices) {
		return <AutomationBuilderSkeleton />;
	}

	// Show not found component if automation doesn't exist
	if (automationNotFound) {
		return <AutomationNotFound />;
	}

	return (
		<DeviceCapabilitiesProvider devices={devices}>
			<AutomationBuilderReadyGate
				automationId={automationId}
				automation={automation}
			/>
		</DeviceCapabilitiesProvider>
	);
};

export default withAuthorization(AutomationBuilder, "manage-automations");
