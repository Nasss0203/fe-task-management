import { Banner } from "@/components/landing/banner";
import DepartmentUseCase from "@/components/landing/DepartmentUseCase";
import FeatureHighlight from "@/components/landing/FeatureHighlight";
import Integrations from "@/components/landing/Integrations";
import TrustedBy from "@/components/landing/TrustedBy";
import WorkManagement from "@/components/landing/WorkManagement";

export default function HomePage() {
	return (
		<div className='relative mx-auto max-w-7xl px-6 pb-0 pt-6 lg:px-8'>
			<Banner></Banner>
			<TrustedBy></TrustedBy>
			<DepartmentUseCase></DepartmentUseCase>
			<FeatureHighlight></FeatureHighlight>
			<WorkManagement></WorkManagement>
			<Integrations></Integrations>
		</div>
	);
}
