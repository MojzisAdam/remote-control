import React from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import usePageTitle from "@/hooks/usePageTitle";

const LoadingPage: React.FC<{ message?: string }> = ({ message = "Loading..." }) => {
	usePageTitle(message);

	return (
		<div className="min-h-screen flex flex-col bg-gray-100 dark:bg-black duration-1000 transition-all ease-out">
			<header className="bg-white dark:bg-black shadow"></header>
			<main className="min-h-screen flex justify-center flex-col content-center items-center gap-8">
				<LoadingSpinner />
				<h1 className="text-xl font-semibold text-gray-800 dark:text-gray-300">{message}</h1>
			</main>
		</div>
	);
};

export default LoadingPage;
