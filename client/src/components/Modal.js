import { Fragment, useState, useContext } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import Header from './Header';
import { park, addEntryPoint } from '../api';
import InputText from './InputText';

export default function Modal({
	open,
	onClose,
	title,
	content,
	parkingDetails,
	context
}) {
	const Context = context;

	let [isOpen, setIsOpen] = useState(open);
	let [isSuccess, setIsSuccess] = useState(false);
	let [isError, setIsError] = useState(false);
	let [entryPointName, setEntryPointName] = useState('');
	const [state, dispatch] = useContext(Context);

	const closeModal = () => {
		setIsOpen(false);
		onClose(false);
		setIsSuccess(false);
		setIsError(false);
	};

	const onChange = (event) => {
		setEntryPointName(event.target.value);
	};

	const submitHandler = async () => {
		const entryPoint = await addEntryPoint(
			state.parkingComplex._id,
			entryPointName
		);

		if (entryPoint.error) {
			setIsError(true);
			dispatch({ type: 'SET_ERROR', payload: entryPoint.data });
		} else {
			setIsOpen(false);
			onClose(false);
			setIsSuccess(false);
			setIsError(false);
		}
	};

	const parkHandler = async () => {
		const { parkingSlotId, entryPointId, plateNumber, type, parkTime } =
			parkingDetails;

		const parkingDetail = await park(parkingSlotId, entryPointId, {
			plateNumber,
			type,
			parkTime
		});

		if (parkingDetail.error) {
			dispatch({ type: 'SET_ERROR', payload: parkingDetail.data });
			setIsError(true);
		} else {
			setIsSuccess(true);

			setTimeout(() => {
				setIsOpen(false);
				onClose(false);
			}, 2000);
		}
	};

	return (
		<>
			<Transition appear show={isOpen} as={Fragment}>
				<Dialog
					as="div"
					className="fixed inset-0 z-10 overflow-y-auto"
					onClose={closeModal}
				>
					<div className="min-h-screen px-4 text-center">
						<Transition.Child
							as={Fragment}
							enter="ease-out duration-300"
							enterFrom="opacity-0"
							enterTo="opacity-100"
							leave="ease-in duration-200"
							leaveFrom="opacity-100"
							leaveTo="opacity-0"
						>
							<Dialog.Overlay className="fixed inset-0" />
						</Transition.Child>

						<span
							className="inline-block h-screen align-middle"
							aria-hidden="true"
						>
							&#8203;
						</span>
						<Transition.Child
							as={Fragment}
							enter="ease-out duration-300"
							enterFrom="opacity-0 scale-95"
							enterTo="opacity-100 scale-100"
							leave="ease-in duration-200"
							leaveFrom="opacity-100 scale-100"
							leaveTo="opacity-0 scale-95"
						>
							<div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
								<Dialog.Title
									as="h3"
									className="text-lg font-medium leading-6 text-gray-900"
								>
									<Header title={title} />
								</Dialog.Title>
								<div className="mt-2 py-5">
									{content.command === 'slot' ? (
										<div>
											<p className="text-sm text-gray-500">
												<span className="font-semibold">Slot name:</span>{' '}
												{content.name}
											</p>
											<p className="text-sm text-gray-500">
												<span className="font-semibold">Slot type:</span>{' '}
												{content.type}
											</p>
											<p className="text-sm text-gray-500">
												<span className="font-semibold">Slot rate:</span>{' '}
												{content.rate}
											</p>
											<div className="mt-4">
												<button
													type="button"
													disabled={!content.name}
													className="inline-flex justify-center px-4 py-2 text-sm font-medium text-blue-900 bg-blue-100 border border-transparent rounded-md hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
													onClick={parkHandler}
												>
													Park the vehicle
												</button>
											</div>
										</div>
									) : content.command === 'entrypoint' ? (
										<div>
											<InputText
												name="entryPointName"
												id="entryPointName"
												placeholder="Entry point name"
												onChange={onChange}
											/>

											<div className="mt-4">
												<button
													type="button"
													className="inline-flex justify-center px-4 py-2 text-sm font-medium text-blue-900 bg-blue-100 border border-transparent rounded-md hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
													onClick={submitHandler}
												>
													Submit
												</button>
											</div>
										</div>
									) : (
										''
									)}

									{isSuccess ? (
										<p className="text-sm text-green-600 mt-10">
											You have successfully parked the car.
										</p>
									) : (
										''
									)}
									{content.message ? (
										<p className="text-sm text-gray-500">{content.message}</p>
									) : (
										''
									)}
									{isError || content.error ? (
										<p className="text-sm text-red-600 mt-10">
											{state.error.name}
										</p>
									) : (
										''
									)}
								</div>
							</div>
						</Transition.Child>
					</div>
				</Dialog>
			</Transition>
		</>
	);
}
