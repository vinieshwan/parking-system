export default function Label({ text, name, description }) {
	return (
		<div className="py-2">
			<label htmlFor={name} className="block text-lg font-semibold">
				{text}
			</label>
			{description ? <span className="text-xs">{description}</span> : ''}
		</div>
	);
}
