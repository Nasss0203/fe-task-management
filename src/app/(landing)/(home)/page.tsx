import { Banner } from "@/widgets/landing/banner";
import DepartmentUseCase from "@/widgets/landing/department-use-case";
import FeatureHighlight from "@/widgets/landing/feature-highlight";
import WorkManagement from "@/widgets/landing/work-management";

export default function HomePage() {
	return (
		<div className='relative mx-auto max-w-7xl px-6 pb-0 pt-6 lg:px-8'>
			<Banner></Banner>
			<DepartmentUseCase></DepartmentUseCase>
			<FeatureHighlight></FeatureHighlight>
			<WorkManagement></WorkManagement>
		</div>
	);
}
