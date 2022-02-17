export default function InputRadio({
	label,
	name,
	id,
	onChange,
	value,
	checked
}) {
	return (
		<div className="space-y-6 py-1">
			<div className="flex items-center">
				<input
					id={id}
					name={name}
					type="radio"
					className="h-4 w-4 border-gray-300 rounded text-indigo-600 focus:ring-indigo-500"
					onChange={onChange}
					value={value}
					checked={checked}
				/>
				<label htmlFor={id} className="ml-3 min-w-0 flex-1 text-gray-500">
					{label}
				</label>
			</div>
		</div>
	);
}
