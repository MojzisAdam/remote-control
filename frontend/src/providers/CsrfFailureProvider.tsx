import React, { createContext, useContext, useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCcw, Wifi, WifiOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { registerNetworkErrorCallback, registerCsrfFailureCallback, registerSessionExpiredCallback } from "@/lib/api/errorHandler";

interface ErrorAlertContextProps {
	showCsrfModal: boolean;
	setShowCsrfModal: (value: boolean) => void;
	showOfflineModal: boolean;
	setShowOfflineModal: (value: boolean) => void;
	retryOfflineRequest: () => void;
	setRetryOfflineRequest: (callback: () => void) => void;
}

const ErrorAlertContext = createContext<ErrorAlertContextProps>({
	showCsrfModal: false,
	setShowCsrfModal: () => {},
	showOfflineModal: false,
	setShowOfflineModal: () => {},
	retryOfflineRequest: () => {},
	setRetryOfflineRequest: () => {},
});

export const useErrorAlert = () => useContext(ErrorAlertContext);

// --- CSRF Failure Modal ---
const CsrfFailureModal: React.FC<{ onClose: () => void; onRefresh: () => void }> = ({ onClose, onRefresh }) => {
	return (
		<Dialog
			open={true}
			onOpenChange={onClose}
		>
			<DialogContent className="sm:max-w-md">
				<DialogHeader className="space-y-4">
					<DialogTitle className="flex items-center gap-2 text-destructive">
						<AlertCircle className="h-5 w-5" />
						Session Expired
					</DialogTitle>
					<DialogDescription>Session with the server expired. Please refresh the page.</DialogDescription>
				</DialogHeader>
				<DialogFooter className="sm:justify-center mt-4 flex justify-end">
					<Button
						onClick={onRefresh}
						variant="default"
					>
						<RefreshCcw className="h-4 w-4 mr-2" />
						Refresh Page
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

// --- Offline Modal ---
const OfflineModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
	const [isOnline, setIsOnline] = useState(navigator.onLine);

	const handleRefreshPage = () => {
		window.location.reload();
	};

	useEffect(() => {
		const handleOnline = () => setIsOnline(true);
		const handleOffline = () => setIsOnline(false);

		window.addEventListener("online", handleOnline);
		window.addEventListener("offline", handleOffline);

		return () => {
			window.removeEventListener("online", handleOnline);
			window.removeEventListener("offline", handleOffline);
		};
	}, []);

	return (
		<Dialog
			open={true}
			onOpenChange={onClose}
		>
			<DialogContent className="sm:max-w-md">
				<DialogHeader className="space-y-4">
					<DialogTitle className="flex items-center gap-2 text-amber-500">
						{isOnline ? <Wifi className="h-5 w-5" /> : <WifiOff className="h-5 w-5" />}
						{isOnline ? "Connection Available" : "You Are Offline"}
					</DialogTitle>
					<DialogDescription>
						{isOnline ? "Your connection has been restored. Please reload the page to continue." : "You are currently offline. Please check your internet connection and try again."}
					</DialogDescription>
				</DialogHeader>
				<DialogFooter className="sm:justify-center mt-4 flex justify-end gap-2">
					<Button
						onClick={onClose}
						variant="outline"
					>
						Close
					</Button>
					<Button
						onClick={handleRefreshPage}
						variant="default"
						disabled={!isOnline}
					>
						<RefreshCcw className="h-4 w-4 mr-2" />
						Reload Page
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

// --- Session Expired Modal ---
const SessionExpiredModal: React.FC<{ onClose: () => void; onRefresh: () => void }> = ({ onClose, onRefresh }) => {
	return (
		<Dialog
			open={true}
			onOpenChange={onClose}
		>
			<DialogContent className="sm:max-w-md">
				<DialogHeader className="space-y-4">
					<DialogTitle className="flex items-center gap-2 text-destructive">
						<AlertCircle className="h-5 w-5" />
						Session Expired
					</DialogTitle>
					<DialogDescription>Your session has expired. Please log in again to continue.</DialogDescription>
				</DialogHeader>
				<DialogFooter className="sm:justify-center mt-4 flex justify-end">
					<Button
						onClick={onRefresh}
						variant="default"
					>
						<RefreshCcw className="h-4 w-4 mr-2" />
						Login Again
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

// --- General Error Alert Provider ---
export const ErrorAlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [showCsrfModal, setShowCsrfModal] = useState(false);
	const [showOfflineModal, setShowOfflineModal] = useState(false);
	const [showSessionExpiredModal, setShowSessionExpiredModal] = useState(false);
	const [retryOfflineRequest, setRetryOfflineRequest] = useState<() => void>(() => () => {});
	const { toast } = useToast();

	useEffect(() => {
		registerNetworkErrorCallback((message) => {
			if (message.includes("offline")) {
				setShowOfflineModal(true);
			} else {
				toast({
					variant: "destructive",
					title: "Network Error",
					description: message,
				});
			}
		});

		registerCsrfFailureCallback((_message) => {
			setShowCsrfModal(true);
		});

		registerSessionExpiredCallback((_message) => {
			setShowSessionExpiredModal(true);
		});
	}, [toast]);

	const handleCsrfModalClose = () => {
		setShowCsrfModal(false);
	};

	const handleOfflineModalClose = () => {
		setShowOfflineModal(false);
	};

	const handleSessionExpiredModalClose = () => {
		setShowSessionExpiredModal(false);
	};

	const handleRefreshPage = () => {
		window.location.reload();
	};

	const handleLoginAgain = () => {
		window.location.href = "/login";
	};

	return (
		<ErrorAlertContext.Provider
			value={{
				showCsrfModal,
				setShowCsrfModal,
				showOfflineModal,
				setShowOfflineModal,
				retryOfflineRequest,
				setRetryOfflineRequest,
			}}
		>
			{children}
			{showCsrfModal && (
				<CsrfFailureModal
					onClose={handleCsrfModalClose}
					onRefresh={handleRefreshPage}
				/>
			)}
			{showOfflineModal && <OfflineModal onClose={handleOfflineModalClose} />}
			{showSessionExpiredModal && (
				<SessionExpiredModal
					onClose={handleSessionExpiredModalClose}
					onRefresh={handleLoginAgain}
				/>
			)}
		</ErrorAlertContext.Provider>
	);
};
