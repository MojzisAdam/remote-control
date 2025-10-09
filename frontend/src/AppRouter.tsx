import React, { useEffect, useState } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useAuthContext } from "@/provider/AuthContextProvider";
import DeviceManagement from "@/pages/devices-management";
import EmailVerification from "@/pages/email-verification/[id]/[hash]";
import ForgotPassword from "@/pages/forgot-password";
import Notifications from "@/pages/notifications/[id]";
import ParameterLog from "@/pages/parameter-log/[id]";
import Dashboard from "@/pages/dashboard";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Graph from "@/pages/history/[id]/graph";
import Table from "@/pages/history/[id]/table";
import Profile from "@/pages/profile";
import RemoteControl from "@/pages/remote-control/[id]";
import ResetPassword from "@/pages/reset-password/[token]";
import UserManagement from "@/pages/user-management";
import NotFoundPage from "@/pages/NotFoundPage";
import Settings from "@/pages/settings";
import Apps from "@/pages/apps";
import LoadingPage from "@/components/loadingPage";
import AppLayout from "@/components/layouts/AppLayout";
import GuestLayout from "@/components/layouts/GuestLayout";
import ErrorLayout from "@/components/layouts/ErrorLayout";
import AutomationList from "@/pages/automations";
import AutomationBuilder from "@/pages/automations/builder";
import AutomationLogs from "@/pages/automations/logs";
import { ForcePasswordChangeModal } from "@/components/user-management/force-password-change-modal";

const PUBLIC_PAGES = ["/", "/login", "/register", "/forgot-password", "/email-verification", "/reset-password", "/404", "/apps"];
const EXCLUDED_FROM_REDIRECT = ["/email-verification", "/reset-password", "/apps"];

const AppRouter: React.FC = () => {
	const { user, loading, refreshLoading, inAuthVerification } = useAuthContext();
	const location = useLocation();
	const navigate = useNavigate();
	const [checking, setChecking] = useState(true);
	const [initialCheck, setInitialCheck] = useState(true);
	const [redirectTarget, setRedirectTarget] = useState<string | null>(null);
	const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false);

	const isPublicPage = PUBLIC_PAGES.some((path) => {
		return path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);
	});

	useEffect(() => {
		if (user && !isPublicPage) {
			if (user.force_password_change) {
				setShowPasswordChangeModal(true);
			}
		}
	}, [user, isPublicPage]);

	const isExcludedFromRedirect = EXCLUDED_FROM_REDIRECT.some((path) => (path === "/" ? location.pathname === "/" : location.pathname.startsWith(path)));

	useEffect(() => {
		if (!loading) {
			if (isExcludedFromRedirect) {
				setChecking(false);
				setInitialCheck(false);
				return;
			}

			if (!user && !isPublicPage && !inAuthVerification) {
				if (location.pathname !== "/login") {
					const target = `/login?redirect=${encodeURIComponent(location.pathname)}`;
					setRedirectTarget("/login");
					navigate(target, { replace: true });
					return;
				}
				return;
			} else if (user && isPublicPage) {
				const searchParams = new URLSearchParams(location.search);
				const redirectUrl = searchParams.get("redirect") || "/dashboard";
				if (location.pathname !== redirectUrl) {
					setRedirectTarget(redirectUrl);
					navigate(redirectUrl, { replace: true });
				}
				return;
			}

			setChecking(false);
			setInitialCheck(false);
			setRedirectTarget(null);
		}
	}, [user, loading, inAuthVerification, location, isPublicPage, isExcludedFromRedirect, navigate]);

	useEffect(() => {
		if (!initialCheck) {
			const initialLoader = document.getElementById("initial-loading");
			if (initialLoader) {
				initialLoader.remove();
			}
		}
	}, [initialCheck]);

	if (initialCheck || (redirectTarget && location.pathname !== redirectTarget.split("?")[0])) {
		return null;
	}

	if ((loading && !refreshLoading) || checking) {
		return <LoadingPage />;
	}
	return (
		<>
			{user && !isPublicPage && showPasswordChangeModal && (
				<ForcePasswordChangeModal
					open={showPasswordChangeModal}
					onOpenChange={setShowPasswordChangeModal}
					onSuccess={() => {
						setShowPasswordChangeModal(false);
					}}
				/>
			)}

			<Routes>
				{/* Public Routes */}
				<Route element={<GuestLayout />}>
					<Route
						path="/"
						element={<Login />}
					/>
					<Route
						path="/login"
						element={<Login />}
					/>
					<Route
						path="/register"
						element={<Register />}
					/>
					<Route
						path="/forgot-password"
						element={<ForgotPassword />}
					/>
					<Route
						path="/email-verification/:id/:hash"
						element={<EmailVerification />}
					/>
					<Route
						path="/reset-password/:token"
						element={<ResetPassword />}
					/>
					<Route
						path="/apps"
						element={<Apps />}
					/>
				</Route>

				{/* Protected / Authenticated Routes */}
				<Route element={<AppLayout />}>
					<Route
						path="/dashboard"
						element={<Dashboard />}
					/>
					<Route
						path="/notifications/:id"
						element={<Notifications />}
					/>
					<Route
						path="/parameter-log/:id"
						element={<ParameterLog />}
					/>
					<Route
						path="/devices-management"
						element={<DeviceManagement />}
					/>
					<Route
						path="/profile"
						element={<Profile />}
					/>
					<Route
						path="/remote-control/:id"
						element={<RemoteControl />}
					/>
					<Route
						path="/user-management"
						element={<UserManagement />}
					/>
					<Route
						path="/history/:id/graph"
						element={<Graph />}
					/>
					<Route
						path="/history/:id/table"
						element={<Table />}
					/>
					<Route
						path="/settings"
						element={<Settings />}
					/>
					<Route
						path="/automations"
						element={<AutomationList />}
					/>
					<Route
						path="/automations/builder"
						element={<AutomationBuilder />}
					/>
					<Route
						path="/automations/builder/:automationId"
						element={<AutomationBuilder />}
					/>
					<Route
						path="/automations/logs/:automationId"
						element={<AutomationLogs />}
					/>
				</Route>

				{/* 404 / Error Routes */}
				<Route element={<ErrorLayout />}>
					<Route
						path="*"
						element={<NotFoundPage />}
					/>
				</Route>
			</Routes>
		</>
	);
};

export default AppRouter;
