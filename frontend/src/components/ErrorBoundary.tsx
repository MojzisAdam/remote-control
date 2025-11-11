import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { withTranslation, WithTranslation } from "react-i18next";

interface ErrorBoundaryProps extends WithTranslation {
	children: ReactNode;
}

interface ErrorBoundaryState {
	hasError: boolean;
}

class ErrorBoundaryClass extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError(__: Error): ErrorBoundaryState {
		return { hasError: true };
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		console.log("ErrorBoundary caught an error:", error, errorInfo);
	}

	handleReload = () => {
		window.location.reload();
	};

	render() {
		const { t, children } = this.props;

		if (this.state.hasError) {
			return (
				<div className="flex flex-col items-center justify-center p-6 bg-background text-foreground min-h-80 text-center">
					<h2 className="text-xl font-bold mb-2">{t("update_available")}</h2>
					<p className="text-sm mb-4">{t("update_reload_prompt")}</p>
					<Button
						onClick={this.handleReload}
						className="mt-2"
					>
						{t("reload_button")}
					</Button>
				</div>
			);
		}

		return children;
	}
}

const ErrorBoundary = withTranslation("history")(ErrorBoundaryClass);

export default ErrorBoundary;
