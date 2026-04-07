import ContactForm from "./ContactForm";
import ContactIntro from "./ContactIntro";

export default function ContactSection() {
	return (
		<section className='bg-transparent'>
			<div className='mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24'>
				<div className='grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16'>
					<div className='flex items-center'>
						<ContactIntro />
					</div>

					<div>
						<ContactForm />
					</div>
				</div>
			</div>
		</section>
	);
}
