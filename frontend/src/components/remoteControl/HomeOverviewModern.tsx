import React from "react";
import { Card } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

interface DeviceData {
	reg_33?: number;
	reg_35?: number;
	reg_36?: number;
	reg_38?: number;
	reg_64?: number;
	reg_65?: number;
	reg_66?: number;
	reg_68?: number;
	reg_71?: number;
	reg_75?: number;
	reg_76?: number;
	reg_77?: number;
	reg_78?: number;
	reg_96?: number;
	reg_97?: number;
	reg_99?: number;
	reg_108?: number;
	reg_109?: number;
	reg_110?: number;
	reg_111?: number;
	reg_128?: number;
	reg_133?: number;
	reg_192?: number;
	reg_193?: number;
	reg_195?: number;
	reg_257?: number;
	reg_258?: number;
	reg_260?: number;
	reg_512?: number;
	reg_608?: number;
	reg_610?: number;
	reg_640?: number;
	reg_646?: number;
	reg_673?: number;
	reg_674?: number;
	reg_675?: number;
	reg_676?: number;
	reg_677?: number;
	reg_678?: number;
	reg_679?: number;
	reg_680?: number;
	reg_681?: number;
	reg_685?: number;
	reg_704?: number;
	reg_705?: number;
	reg_707?: number;
	reg_708?: number;
	reg_736?: number;
	reg_737?: number;
	reg_739?: number;
	reg_740?: number;
	reg_741?: number;
	reg_745?: number;
	reg_746?: number;
	reg_834?: number;
	she_hum?: number;
	fw_v?: string;
	fhi?: number;
}

interface HomePageProps {
	deviceData: DeviceData;
}

const HomePage: React.FC<HomePageProps> = ({ deviceData }) => {
	const { t } = useTranslation("remote-control");
	const getTemperatureDisplay = (temp?: number) => (temp === -128 || temp === undefined ? "---" : `${temp} °C`);

	let stateBarParts: string[] = [];

	if (deviceData.reg_741 === 0) {
		stateBarParts.push(t("home.season.winter"));
	} else {
		stateBarParts.push(t("home.season.summer"));
	}
	if (deviceData.reg_739 === 1) {
		stateBarParts.push(t("home.blocked.thermostat"));
	}
	if (deviceData.reg_740 === 1) {
		stateBarParts.push(t("home.blocked.hdo"));
	}

	const stateBar = stateBarParts.join(", ");

	const HomeSvg = () => (
		<svg
			version="1.1"
			id="Layer_1"
			xmlns="http://www.w3.org/2000/svg"
			xmlnsXlink="http://www.w3.org/1999/xlink"
			x="0px"
			y="0px"
			width="450px"
			height="400px"
			viewBox="-195.208 -177.208 450 400"
			enableBackground="new -195.208 -177.208 450 400"
			xmlSpace="preserve"
		>
			<g
				id="Layer_1_1_"
				display="none"
			>
				<image
					display="inline"
					overflow="visible"
					enableBackground="new    "
					width="450"
					height="340"
					transform="matrix(0.9999 0 0 0.9999 -200 -145)"
				></image>
			</g>
			<g id="Layer_2">
				<polygon
					className="home-body"
					points="-113.508,223.469 167.682,223.469 167.682,1.564 27.087,-95.755 -113.508,7.169"
				/>
				<path
					className="home-line"
					d="M2915.556,772.792"
				/>
			</g>
			<g id="Layer_3">
				<ellipse
					className="home-accent"
					cx="28.339"
					cy="-118.133"
					rx="8.924"
					ry="9.076"
				/>
				<polyline
					className="home-accent"
					points="-152.785,39.168 28.389,-94.704 216.06,39.168 230.539,13.505 33.549,-125.435 23.221,-125.435
            -167.273,13.505 -152.785,38.151"
				/>
				<ellipse
					className="home-accent"
					cx="222.556"
					cy="25.841"
					rx="14.361"
					ry="14.899"
				/>
				<ellipse
					className="home-accent"
					cx="-160.525"
					cy="26.631"
					rx="14.328"
					ry="14.865"
				/>
			</g>
		</svg>
	);

	function OutdoorUnitIcon({ color = "currentColor", size = 50 }) {
		return (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 200 140"
				fill={color}
				stroke={color}
				width={size}
				height={size}
			>
				<rect
					x="30"
					y="20"
					width="140"
					height="100"
					rx="5"
					ry="5"
					fill="none"
					strokeWidth="6"
				/>
				<circle
					cx="135"
					cy="70"
					r="30"
					fill="none"
					strokeWidth="5"
				/>
				<path
					d="M135,70 L135,45 C130,42 125,42 123,45 C121,48 125,56 135,60 Z"
					strokeWidth="3"
				/>
				<path
					d="M135,70 L160,70 C163,65 163,60 160,58 C157,56 149,60 145,70 Z"
					strokeWidth="3"
				/>
				<path
					d="M135,70 L135,95 C140,98 145,98 147,95 C149,92 145,84 135,80 Z"
					strokeWidth="3"
				/>
				<path
					d="M135,70 L110,70 C107,75 107,80 110,82 C113,84 121,80 125,70 Z"
					strokeWidth="3"
				/>
				<circle
					cx="135"
					cy="70"
					r="8"
					strokeWidth="2"
				/>
				<line
					x1="40"
					y1="36"
					x2="90"
					y2="36"
					strokeWidth="6"
				/>
				<line
					x1="40"
					y1="53"
					x2="90"
					y2="53"
					strokeWidth="6"
				/>
				<line
					x1="40"
					y1="70"
					x2="90"
					y2="70"
					strokeWidth="6"
				/>
				<line
					x1="40"
					y1="87"
					x2="90"
					y2="87"
					strokeWidth="6"
				/>
				<line
					x1="40"
					y1="103"
					x2="90"
					y2="103"
					strokeWidth="6"
				/>
				<rect
					x="40"
					y="120"
					width="10"
					height="5"
					strokeWidth="1"
				/>
				<rect
					x="150"
					y="120"
					width="10"
					height="5"
					strokeWidth="1"
				/>
			</svg>
		);
	}

	function RadiatorIcon({ color = "currentColor", size = 50 }) {
		return (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				fill={color}
				stroke={color}
				width={size}
				height={size}
			>
				<rect
					x="2.43"
					y="4.37"
					width="4.78"
					height="17.22"
					rx="2.39"
					strokeWidth="1.91"
					fill="none"
				/>
				<rect
					x="7.22"
					y="4.37"
					width="4.78"
					height="17.22"
					rx="2.39"
					strokeWidth="1.91"
					fill="none"
				/>
				<rect
					x="12"
					y="4.37"
					width="4.78"
					height="17.22"
					rx="2.39"
					strokeWidth="1.91"
					fill="none"
				/>
				<rect
					x="16.78"
					y="4.37"
					width="4.78"
					height="17.22"
					rx="2.39"
					strokeWidth="1.91"
					fill="none"
				/>
				<line
					x1="0.52"
					y1="8.2"
					x2="2.43"
					y2="8.2"
					strokeWidth="1.91"
				/>
				<line
					x1="0.52"
					y1="17.76"
					x2="2.43"
					y2="17.76"
					strokeWidth="1.91"
				/>
				<line
					x1="21.57"
					y1="8.2"
					x2="23.48"
					y2="8.2"
					strokeWidth="1.91"
				/>
				<line
					x1="21.57"
					y1="17.76"
					x2="23.48"
					y2="17.76"
					strokeWidth="1.91"
				/>
				<line
					x1="4.35"
					y1="21.59"
					x2="4.35"
					y2="23.5"
					strokeWidth="1.91"
				/>
				<line
					x1="19.65"
					y1="21.59"
					x2="19.65"
					y2="23.5"
					strokeWidth="1.91"
				/>
				<line
					x1="18.7"
					y1="1.5"
					x2="18.7"
					y2="4.37"
					strokeWidth="1.91"
				/>
				<line
					x1="16.78"
					y1="1.5"
					x2="20.61"
					y2="1.5"
					strokeWidth="1.91"
				/>
			</svg>
		);
	}
	const FaucetIcon = ({ color = "currentColor", size = 50 }) => {
		return (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 512 512"
				fill={color}
				stroke={color}
				width={size}
				height={size}
			>
				<path d="M352,256H313.39c-15.71-13.44-35.46-23.07-57.39-28V180.44l-32-3.38-32,3.38V228c-21.93,5-41.68,14.6-57.39,28H16A16,16,0,0,0,0,272v96a16,16,0,0,0,16,16h92.79C129.38,421.73,173,448,224,448s94.62-26.27,115.21-64H352a32,32,0,0,1,32,32,32,32,0,0,0,32,32h64a32,32,0,0,0,32-32A160,160,0,0,0,352,256ZM81.59,159.91l142.41-15,142.41,15c9.42,1,17.59-6.81,17.59-16.8V112.89c0-10-8.17-17.8-17.59-16.81L256,107.74V80a16,16,0,0,0-16-16H208a16,16,0,0,0-16,16v27.74L81.59,96.08C72.17,95.09,64,102.9,64,112.89v30.22C64,153.1,72.17,160.91,81.59,159.91Z" />
			</svg>
		);
	};

	const ThermostatIcon = ({ color = "currentColor", size = 50 }) => {
		return (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 140 140"
				fill="none"
				stroke={color}
				width={size}
				height={size}
			>
				<rect
					x="10"
					y="10"
					width="120"
					height="120"
					rx="20"
					ry="20"
					strokeWidth="8"
				/>
				<rect
					x="25"
					y="25"
					width="90"
					height="35"
					rx="8"
					ry="8"
					strokeWidth="5"
				/>
				<line
					x1="50"
					y1="42.5"
					x2="90"
					y2="42.5"
					strokeWidth="5"
				/>
				<circle
					cx="45"
					cy="85"
					r="12"
					strokeWidth="5"
				/>
				<line
					x1="45"
					y1="80"
					x2="45"
					y2="90"
					strokeWidth="5"
				/>
				<circle
					cx="95"
					cy="85"
					r="12"
					strokeWidth="5"
				/>
				<line
					x1="90"
					y1="85"
					x2="100"
					y2="85"
					strokeWidth="5"
				/>
				<circle
					cx="70"
					cy="115"
					r="5"
					fill={color}
				/>
			</svg>
		);
	};

	const TemperatureMeterIcon = ({ color = "currentColor", size = 50 }) => {
		return (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 180.146 180.146"
				fill={color}
				stroke={color}
				width={size}
				height={size}
			>
				<path
					d="M116.707,104.542V26.631C116.707,11.947,104.758,0,90.07,0C75.386,0,63.438,11.947,63.438,26.631v77.912
            c-10.013,8.046-15.879,20.134-15.879,33.09c0,23.442,19.07,42.514,42.511,42.514c23.443,0,42.517-19.072,42.517-42.514
            C132.587,124.676,126.72,112.588,116.707,104.542z M90.07,165.146c-15.17,0-27.511-12.343-27.511-27.514
            c0-9.282,4.669-17.882,12.489-23.007c2.115-1.386,3.39-3.744,3.39-6.273V26.631C78.438,20.218,83.656,15,90.07,15
            c6.417,0,11.637,5.218,11.637,11.631v81.722c0,2.529,1.274,4.887,3.39,6.273c7.821,5.124,12.49,13.725,12.49,23.007
            C117.587,152.804,105.243,165.146,90.07,165.146z"
				/>
				<path
					d="M95.07,120.859V60.268c0-2.761-2.238-5-5-5c-2.762,0-5,2.239-5,5v60.591c-7.229,2.152-12.505,8.84-12.505,16.773
            c0,9.667,7.838,17.507,17.505,17.507c9.673,0,17.51-7.84,17.51-17.507C107.58,129.699,102.304,123.011,95.07,120.859z"
				/>
			</svg>
		);
	};

	const ColdIcon = ({ color = "currentColor", size = 50 }) => {
		return (
			<svg
				width={size}
				height={size}
				viewBox="0 0 1024 1024"
				xmlns="http://www.w3.org/2000/svg"
				fill={color}
				stroke={color}
				strokeWidth="1.92"
				strokeMiterlimit="10"
			>
				<path d="M539.7 463.1V273.5l90.8-91.2c11-11 10.9-28.7 0-39.6-11-11-28.7-10.9-39.6 0L539.7 194V91.3c0-15.1-12.5-27.8-28-27.8-15.6 0-28 12.5-28 27.8V195L432.5 143.8c-10.9-10.9-28.6-11-39.6 0-10.9 10.9-11 28.6 0 39.6l90.8 91.2v188.6l-164.2-94.8L286 244.1c-4-15-19.4-23.8-34.3-19.8-15 4-23.8 19.4-19.8 34.3l18.7 70-88.9-51.4c-13.1-7.6-30.4-3-38.1 10.4-7.8 13.5-3.2 30.5 10.1 38.2l89.8 51.9-70 18.7c-14.9 4-23.8 19.3-19.8 34.3 4 14.9 19.3 23.8 34.3 19.8l124.4-33.1 163.3 94.3-164.2 94.8-124.4-33.1c-15-4-30.3 4.9-34.3 19.8-4 15 4.9 30.3 19.8 34.3l70 18.7-88.9 51.4c-13.1 7.6-17.8 24.8-10.1 38.2 7.8 13.5 24.8 18 38.1 10.4l89.8-51.9-18.7 70c-4 14.9 4.8 30.3 19.8 34.3 14.9 4 30.3-4.8 34.3-19.8l33.6-124.3 163.3-94.3v190.6l-90.8 93c-11 11-10.9 28.7 0 39.6 11 11 28.7 10.9 39.6 0l51.2-51.2v99.9c0 15.1 12.5 27.8 28 27.8 15.6 0 28-12.5 28-27.8v-101l51.2 51.2c10.9 10.9 28.6 11 39.6 0 10.9-10.9 11-28.6 0-39.6l-90.8-93V560.2l165.1 95.3L740 780.6c4 15 19.4 23.8 34.3 19.8 15-4 23.8-19.4 19.8-34.3l-18.7-70 86.6 50c13.1 7.6 30.4 3 38.1-10.4 7.8-13.5 3.2-30.5-10.1-38.2L802.6 647l70-18.7c14.9-4 23.8-19.3 19.8-34.3-4-14.9-19.3-23.8-34.3-19.8l-125.9 32.2L568 511.6l165.1-95.3L859 448.5c15 4 30.3-4.9 34.3-19.8 4-15-4.9-30.3-19.8-34.3l-70-18.7 86.6-50c13.1-7.6 17.8-24.8 10.1-38.2-7.8-13.5-24.8-18-38.1-10.4l-87.4 50.5 18.7-70c4-14.9-4.8-30.3-19.8-34.3-14.9-4-30.3 4.8-34.3 19.8l-35.1 125.1-164.5 94.9z" />
			</svg>
		);
	};

	const HeatIcon = ({ color = "currentColor", size = 50 }) => {
		return (
			<svg
				width={size}
				height={size}
				viewBox="0 0 32 32"
				xmlns="http://www.w3.org/2000/svg"
				fill={color}
			>
				<path d="M20.472 1.015c-16.746 15.010 14.885 14.399-5.385 29.548 9.012-15.187-20.731-17.718 5.385-29.548zM8.799 6.381c-6.122 10.362 10.36 11.45 3.81 22.899 2.7-9.438-14.683-14.474-3.81-22.899zM21.149 3.040c-5.661 9.675 13.886 12.748 1.921 22.484 6.583-9.698-13.416-13.912-1.921-22.484z"></path>
			</svg>
		);
	};

	const DefrostIcon = ({ color = "currentColor", size = 50 }) => {
		return (
			<svg
				width={size}
				height={size}
				viewBox="0 0 1024 1024"
				xmlns="http://www.w3.org/2000/svg"
				fill={color}
			>
				<path d="M838.936097 792.351106l-43.508933-25.104771 37.251416-21.339004c6.022157-3.421936 8.113795-11.150968 4.666276-17.228383-2.214435-3.895727-6.417153-6.316869-10.964726-6.316869a12.719696 12.719696 0 0 0-6.272867 1.659802l-49.768497 28.711925-95.334275-55.007824 95.334275-55.000662 49.844222 28.753881c2.020006 1.079588 4.055362 1.604544 6.218632 1.604544 4.470825 0 8.659217-2.406816 10.946306-6.309706 3.393283-5.973038 1.318018-13.68979-4.646833-17.214057l-37.074384-21.447474 43.523259-25.115004c4.430916-2.549056 7.591909-6.681166 8.898671-11.636015 1.311879-4.962012 0.597611-10.128685-1.990331-14.522762-3.41068-5.930059-9.792017-9.612938-16.653285-9.612938-3.366677 0-6.697539 0.898463-9.622148 2.597151l-43.523259 25.115004v-42.907229c0-6.940063-5.647627-12.588713-12.589736-12.588713-6.942109 0-12.588713 5.647627-12.588713 12.588713v57.419758l-95.336322 55.000661V554.447764l49.751101-28.696575c2.914376-1.655709 5.004991-4.375657 5.882987-7.657401 0.871857-3.25923 0.440022-6.65763-1.214664-9.570982-2.214435-3.89675-6.417153-6.318916-10.967796-6.318916a12.709463 12.709463 0 0 0-6.272867 1.660826l-37.074384 21.445428v-50.215682c0-10.620895-8.640798-19.261693-19.259646-19.261693-10.620895 0-19.261693 8.640798-19.261692 19.261693v50.215682l-37.084617-21.454638a12.653181 12.653181 0 0 0-6.233981-1.651616c-4.479011 0-8.680706 2.406816-10.989286 6.317892-3.39226 5.970992-1.316995 13.68979 4.652974 17.22122l49.76645 28.704762v110.108771l-95.336322-55.002708v-57.524135c0-6.940063-5.650697-12.588713-12.594853-12.588713-6.942109 0-12.588713 5.647627-12.588712 12.588713v42.907229L453.390137 569.820893a19.173688 19.173688 0 0 0-9.544376-2.550079c-6.840802 0-13.244652 3.657296-16.726964 9.56689-5.243421 9.114588-2.108011 20.892843 7.012718 26.267247l43.522236 25.107841-37.160342 21.439288c-6.02625 3.426029-8.119935 11.155061-4.668322 17.22736 2.241041 3.952009 6.335289 6.312776 10.952446 6.312776 2.152013 0 4.184299-0.527003 6.29231-1.65264l49.768497-28.706809 95.334275 55.000662-95.334275 55.002708-49.783847-28.716018a12.660344 12.660344 0 0 0-6.236028-1.651617c-4.475941 0-8.679683 2.40477-10.993378 6.31687-3.393283 5.972015-1.318018 13.68979 4.649903 17.21508l37.078477 21.447474-43.525306 25.115004c-4.450359 2.558265-7.632841 6.706749-8.963139 11.682064a19.056008 19.056008 0 0 0 1.942235 14.582113c3.397377 5.947456 9.777691 9.642614 16.648169 9.642615 3.27765 0 6.506181-0.873903 9.632381-2.618641l43.525306-25.115004v42.902112c0 6.942109 5.646604 12.588713 12.588713 12.588713s12.589736-5.646604 12.589736-12.588713v-57.413617l95.336322-55.000662v110.107747l-49.751101 28.695553c-2.914376 1.655709-5.004991 4.376681-5.881964 7.658423-0.871857 3.25923-0.440022 6.656607 1.213641 9.565866 2.237971 3.953032 6.330172 6.313799 10.946306 6.3138 2.157129 0 4.191462-0.527003 6.30459-1.65264l37.06415-21.444404v50.215681c0 10.620895 8.641821 19.261693 19.262716 19.261693s19.259646-8.640798 19.259646-19.261693V870.468255l37.144992 21.488406c2.025123 1.083681 4.059456 1.609661 6.216585 1.609661 4.466732 0 8.65717-2.40477 10.951423-6.309706 3.393283-5.968945 1.316995-13.688767-4.65809-17.22122l-49.76645-28.704762V731.005946l95.343485 55.002708v57.413618c0 6.940063 5.646604 12.586666 12.586666 12.586666 6.942109 0 12.589736-5.646604 12.589736-12.586666v-42.903136l43.518143 25.111934a19.222807 19.222807 0 0 0 9.637498 2.621711c6.865361 0 13.246699-3.693112 16.645099-9.634428 5.238304-9.111518 2.100848-20.890796-7.018858-26.267247z" />
				<path d="M471.443305 947.106726c-163.287947 0-296.133557-132.388193-296.133557-295.115368 0-36.393885 12.006452-75.649957 21.038152-102.013395 3.601015-10.511401 37.19104-106.156762 106.782002-225.915309 47.1386-81.122599 94.679359-159.530366 115.63667-190.72381l29.15604-43.840484a28.245298 28.245298 0 0 1 47.03934 0l29.144784 43.825135c20.956288 31.18935 68.50421 109.61042 115.646903 190.739159a1537.658779 1537.658779 0 0 1 35.967166 65.540715c7.170307 13.855566 1.750877 30.898731-12.102642 38.069037-13.858636 7.169283-30.899754 1.749854-38.069037-12.102642a1480.734302 1480.734302 0 0 0-34.640962-63.123666c-45.874817-78.946027-93.699032-157.863401-113.714901-187.648775l-0.075725-0.112563-5.677302-8.537444-5.677303 8.537444-0.076748 0.112563c-20.010753 29.77821-67.835991 108.695584-113.713878 187.646728-66.874083 115.084085-98.766444 205.868741-102.183264 215.84086-12.105712 35.334763-17.9887 62.714344-17.9887 83.7044 0 131.576711 107.501386 238.622726 239.640916 238.622726 15.600303 0 28.246321 12.646018 28.246321 28.246321-0.001023 15.600303-12.642948 28.248368-28.244275 28.248368z" />
			</svg>
		);
	};

	return (
		<Card
			className="w-full relative max-w-[800px] container-home bg-background-secondary-950 max-sm:!rounded-none max-sm:!-mx-[calc((100vw-100%)/2)] max-sm:!w-screen"
			id="cim-page-home"
		>
			{/* Outdoor Temperature */}
			<div className="outdoor-temp">
				<p className="flex items-center space-x-1">
					<TemperatureMeterIcon />
					<span>{getTemperatureDisplay(deviceData.reg_674)}</span>
				</p>
			</div>

			{/* Home Image Section */}
			<div className="home-image space-y-2 min-[900px]:space-y-4">
				<HomeSvg />
				<p>
					<span className={deviceData.reg_736 && [2, 3, 4, 5, 6, 7, 8].includes(deviceData.reg_736) ? "home_tuvto-on" : "home_tuvto-off"}></span>
					<RadiatorIcon />
					<span
						className="want-temp-home"
						data-descr={`${deviceData.reg_704} °C`}
					>
						{(() => {
							const reg_66 = deviceData.reg_66;
							const reg_673 = deviceData.reg_673;
							const reg_675 = deviceData.reg_675;
							const reg_678 = deviceData.reg_678;

							if (reg_66 === undefined || reg_66 === null) {
								return getTemperatureDisplay(reg_675);
							} else if (reg_66 === 0) {
								return getTemperatureDisplay(reg_673);
							} else if (reg_66 === 1) {
								return getTemperatureDisplay(reg_675);
							} else if (reg_66 === 2) {
								return getTemperatureDisplay(reg_675);
							} else {
								return getTemperatureDisplay(reg_678);
							}
						})()}
					</span>
				</p>

				{/* Additional temperature displays */}
				{deviceData.reg_96 === 1 && (
					<p>
						<span className={deviceData.reg_736 === 1 || [6, 7, 8].includes(deviceData.reg_736 ?? 0) ? "home_tuvto-on" : "home_tuvto-off"}></span>
						<FaucetIcon />
						<span
							className="want-temp-home"
							data-descr={`${deviceData.reg_705} °C`}
						>
							{getTemperatureDisplay(deviceData.reg_676)}
						</span>
					</p>
				)}

				{deviceData.reg_192 === 1 ? (
					<p>
						<span className={deviceData.reg_739 === 0 && deviceData.reg_741 === 0 ? "home_tuvto-on" : "home_tuvto-off"}></span>
						<ThermostatIcon />
						<span
							className="want-temp-home"
							data-descr={`${deviceData.reg_707} °C`}
						>
							{getTemperatureDisplay(deviceData.reg_677)}
						</span>
					</p>
				) : deviceData.reg_192 === 2 ? (
					<p>
						<span className={deviceData.reg_739 === 0 && deviceData.reg_741 === 0 ? "home_tuvto-on" : "home_tuvto-off"}></span>
						<ThermostatIcon />
						<span
							className="want-temp-home"
							data-descr={`${deviceData.reg_707} °C`}
						>
							{getTemperatureDisplay(deviceData.reg_681)}
						</span>
					</p>
				) : null}
			</div>

			{/* Outdoor Unit */}
			<div className="outdoor-unit">
				<span className={deviceData.reg_608 === 0 ? "outdoor-unit-off" : "outdoor-unit-on"}></span>
				<OutdoorUnitIcon />
				<p>{deviceData.reg_610} %</p>
				{deviceData.reg_737 === 1 && (
					<p className="stav_venk">
						<HeatIcon />
					</p>
				)}
				{deviceData.reg_737 === 2 && (
					<p className="stav_venk">
						<DefrostIcon />
					</p>
				)}
				{deviceData.reg_737 === 3 && (
					<p className="stav_venk">
						<ColdIcon />
					</p>
				)}
			</div>

			{/* State Bar */}
			<div className="state-bar">
				<p>{stateBar}</p>
			</div>
		</Card>
	);
};

export default HomePage;
