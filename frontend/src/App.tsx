import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { I18nextProvider } from "react-i18next";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { AuthContextProvider } from "@/providers/AuthContextProvider";
import { ErrorAlertProvider } from "@/providers/CsrfFailureProvider";
import { DeviceProvider } from "@/providers/DeviceProvider";
import { Toaster } from "@/components/ui/toaster";
import i18next from "@/locales/i18n";
import AppRouter from "@/AppRouter";

const queryClient = new QueryClient();

const App: React.FC = () => {
	return (
		<>
			<QueryClientProvider client={queryClient}>
				<I18nextProvider i18n={i18next}>
					<ThemeProvider>
						<AuthContextProvider>
							<ErrorAlertProvider>
								<DeviceProvider>
									<AppRouter />
								</DeviceProvider>
							</ErrorAlertProvider>
						</AuthContextProvider>
					</ThemeProvider>
				</I18nextProvider>
			</QueryClientProvider>
			<Toaster />
		</>
	);
};

export default App;
