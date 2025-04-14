import React from "react";

type InputErrorProps = {
	messages?: string[];
	className?: string;
};

const InputError: React.FC<InputErrorProps> = ({
	messages = [],
	className = "",
}) => (
	<>
		{messages.length > 0 && (
			<>
				{messages.map((message, index) => (
					<p
						className={`${className} text-xs text-red-600`}
						key={index}
					>
						{message}
					</p>
				))}
			</>
		)}
	</>
);

export default InputError;
