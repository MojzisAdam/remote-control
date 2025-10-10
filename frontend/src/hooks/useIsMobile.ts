import { useState, useEffect } from "react";

/**
 * Hook to detect if the current device is mobile based on user agent and screen size
 * @returns boolean indicating if the device is considered mobile
 */
export const useIsMobile = () => {
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		const checkIsMobile = () => {
			const userAgent = navigator.userAgent.toLowerCase();
			const mobileKeywords = ["android", "iphone", "ipad", "ipod", "blackberry", "windows phone", "opera mini"];
			const isMobileUserAgent = mobileKeywords.some((keyword) => userAgent.includes(keyword));
			const isSmallScreen = window.innerWidth <= 768;

			setIsMobile(isMobileUserAgent || isSmallScreen);
		};

		checkIsMobile();
		window.addEventListener("resize", checkIsMobile);

		return () => window.removeEventListener("resize", checkIsMobile);
	}, []);

	return isMobile;
};

export default useIsMobile;
