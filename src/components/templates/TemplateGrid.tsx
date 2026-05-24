import React from "react";

const TemplateGrid = ({ children }: { children: React.ReactNode }) => {
	return <div className='flex flex-col gap-5'>{children}</div>;
};

export default TemplateGrid;
