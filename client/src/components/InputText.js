export default function InputText({ name, id, placeholder, onChange, value }) {
	return (
		<div>
			<div className="my-1 relative rounded-md shadow-sm">
				<input
					type="text"
					name={name}
					id={id}
					className="focus:ring-indigo-500 focus:border-indigo-500 block w-full py-3 pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
					placeholder={placeholder}
					onChange={onChange}
					value={value}
				/>
			</div>
		</div>
	);
}
