'use client';

import { useState, useEffect } from 'react';

const faqs = [
	{
		q: 'What is The Unadulting Society?',
		a: 'A loose collective for people who don’t quite fit the scripts. We write, share, and build tiny lifelines.',
	},
	{
		q: 'Is this space moderated?',
		a: 'Gently. We prioritize safety and consent. Harmful behavior is not tolerated.',
	},
	{
		q: 'How can I contribute?',
		a: 'Start a thread, share a resource, or write a post. Small offerings count.',
	},
	{
		q: 'Do I have to use my real name?',
		a: 'No. Use a name that feels safe and true enough for you right now.',
	},
];

export default function FaqPage() {
	const [searchTerm, setSearchTerm] = useState('');
	const [filteredFaqs, setFilteredFaqs] = useState(faqs);
	const [openIndex, setOpenIndex] = useState<number | null>(null);

	useEffect(() => {
		const results = faqs.filter(
			(faq) =>
				faq.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
				faq.a.toLowerCase().includes(searchTerm.toLowerCase())
		);
		setFilteredFaqs(results);
	}, [searchTerm]);

	return (
		<main className="main-content">
			<section className="section-content qa-section">
				<header className="section-header">
					<h2 className="glitch-title" data-text="ASK THE DOLL">ASK THE DOLL</h2>
					<p className="section-tagline">Frequently Asked Questions</p>
					<div className="faq-search">
						<input
							id="faq-search"
							className="input"
							type="search"
							placeholder="Search questions…"
							aria-label="Search FAQs"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
					</div>
				</header>
				<div className="faq-list" id="faq-list" role="list">
					{filteredFaqs.map((faq, index) => {
						const isOpen = openIndex === index;
						return (
							<div key={index} className="blog-card-container faq-item" role="listitem">
								<span className="glow"></span>
								<div className="inner">
									<button
										className="faq-q"
										id={`faq-q-${index}`}
										aria-expanded={isOpen ? 'true' : 'false'}
										aria-controls={`faq-a-${index}`}
										onClick={() => setOpenIndex(isOpen ? null : index)}
									>
										{faq.q}
									</button>
									<div
										id={`faq-a-${index}`}
										className="faq-a"
										data-expanded={isOpen ? 'true' : 'false'}
										role="region"
										aria-labelledby={`faq-q-${index}`}
									>
										{faq.a}
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</section>
		</main>
	);
}
