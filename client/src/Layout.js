import { useState, useEffect, useContext } from 'react';
import InputText from './components/InputText';
import Header from './components/Header';
import InputRadio from './components/InputRadio';
import Label from './components/Label';
import {
	getParkingComplex,
	listEntryPoints,
	getAvailableSlot,
	unpark
} from './api';
import Modal from './components/Modal';

const vehicleTypes = [
	{
		label: 'Small',
		name: 'small'
	},
	{
		label: 'Medium',
		name: 'medium'
	},
	{
		label: 'Large',
		name: 'large'
	}
];

function Layout({ context }) {
	const Context = context;
	const [state, dispatch] = useContext(Context);
	const [isOpen, setIsOpen] = useState('');
	const [modalContent, setModalContent] = useState({});
	const [entryPointId, setEntryPointId] = useState('');
	const [parkingSlotId, setParkingSlotId] = useState('');
	const [type, setType] = useState('');
	const [parkTime, setParkTime] = useState('');
	const [unparkTime, setUnparkTime] = useState('');
	const [plateNumber1, setPlateNumber1] = useState('');
	const [plateNumber2, setPlateNumber2] = useState('');

	const getSlot = async () => {
		const slot = await getAvailableSlot(
			state.parkingComplex._id,
			entryPointId,
			type
		);

		if (!slot) {
			setIsOpen(true);
			setModalContent({
				message: 'No available slot!',
				title: 'Slot details'
			});
			return;
		}

		if (slot.error) {
			dispatch({ type: 'SET_ERROR', payload: slot.data });
			setIsOpen(true);
			setModalContent({
				title: 'Slot Details',
				error: true,
				command: 'slot'
			});
		} else {
			dispatch({
				type: 'SET_SELECTED_SLOT',
				payload: slot
			});

			setIsOpen(true);
			setParkingSlotId(slot._id);
			setModalContent({
				title: 'Slot details',
				name: slot.name,
				type: vehicleTypes[slot.type].label,
				rate: slot.ratePerHour,
				command: 'slot'
			});
		}
	};

	const addEntryPoint = () => {
		setIsOpen(true);
		setModalContent({
			title: 'Add new entry point',
			command: 'entrypoint'
		});
	};

	const unparkHandler = async () => {
		const unparkingDetail = await unpark({
			plateNumber: plateNumber2,
			unparkTime
		});

		if (unparkingDetail.error) {
			dispatch({ type: 'SET_ERROR', payload: unparkingDetail.data });
			setIsOpen(true);
			setModalContent({
				title: 'Unparking Details',
				error: true,
				command: 'unpark'
			});
		} else {
			setIsOpen(true);
			setModalContent({
				title: 'Unparking Details',
				message: `Amount payable: P${unparkingDetail}`,
				command: 'unpark'
			});
		}
	};

	const onChange = (event) => {
		const { name, value } = event.target;

		switch (name) {
			case 'plateNumber1':
				setPlateNumber1(value);
				break;
			case 'plateNumber2':
				setPlateNumber2(value);
				break;

			case 'vehicleType':
				setType(value);
				break;

			case 'entryPoints':
				setEntryPointId(value);
				break;
			case 'parkTime':
				setParkTime(value);
				break;
			case 'unparkTime':
				setUnparkTime(value);
				break;

			default:
				break;
		}
	};

	useEffect(() => {
		async function init() {
			const parkingComplex = await getParkingComplex(
				'Ayala Mall Parking Complex'
			);

			if (parkingComplex.error) {
				dispatch({ type: 'SET_ERROR', payload: parkingComplex.data });
			} else {
				dispatch({
					type: 'SET_PARKING_COMPLEX',
					payload: parkingComplex
				});
			}

			const entryPoints = await listEntryPoints(parkingComplex._id);

			if (entryPoints.error) {
				dispatch({ type: 'SET_ERROR', payload: entryPoints.data });
			} else {
				dispatch({
					type: 'SET_ENTRY_POINTS',
					payload: entryPoints
				});
			}
		}

		init();
	}, []);

	const parkingDetails = {
		parkingSlotId,
		entryPointId,
		plateNumber: plateNumber1,
		type,
		parkTime
	};

	return (
		<div className="flex gap-4 antialiased text-zinc-500">
			{isOpen ? (
				<Modal
					title={modalContent.title}
					open={isOpen}
					content={modalContent}
					onClose={(isClose) => {
						setIsOpen(isClose);
						setEntryPointId('');
						setParkingSlotId('');
						setType('');
						setParkTime('');
						setUnparkTime('');
						setPlateNumber1('');
						setPlateNumber2('');
					}}
					context={context}
					parkingDetails={parkingDetails}
				/>
			) : (
				''
			)}
			<div className="p-5 w-6/12">
				<Header title="When Parking" />
				<ul className="pt-5">
					<li className="pt-3">
						<Label text="Plate number" name="plateNumber1" />
						<InputText
							name="plateNumber1"
							id="plateNumber1"
							placeholder="ABN5692"
							onChange={onChange}
							required={true}
							value={plateNumber1}
						/>
					</li>
					<li className="pt-3">
						<div className="flex gap-5">
							<div className="w-6/12">
								<Label text="Entry Points" name="entrypoints" />
								{state.entryPoints
									? state.entryPoints.map((item, index) => {
											return (
												<InputRadio
													key={index}
													label={item.name}
													name="entryPoints"
													id={item._id}
													value={item._id}
													onChange={onChange}
													checked={entryPointId === item._id}
												/>
											);
									  })
									: 'Loading...'}
							</div>
							<div className="w-6/12">
								<Label text="Vehicle Type" name="vehicleType" />
								{vehicleTypes.map((item, index) => {
									return (
										<InputRadio
											key={index}
											label={item.label}
											name="vehicleType"
											id={item.name}
											value={item.name}
											onChange={onChange}
											checked={type === item.name}
										/>
									);
								})}
							</div>
						</div>
					</li>
					<li className="pt-3">
						<Label
							text="Park time"
							description="for testing purposes only..."
							name="parkTime"
						/>
						<InputText
							onChange={onChange}
							name="parkTime"
							placeholder="2022-07-06T12:50:00.552Z"
							value={parkTime}
						/>
					</li>
					<li className="pt-3 flex gap-5">
						<div className="mt-5 inline-flex rounded-md shadow">
							<button
								type="button"
								onClick={getSlot}
								className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50"
							>
								Get a slot
							</button>
						</div>
					</li>
				</ul>
			</div>
			<div className="w-6/12 p-5">
				<Header title="When Unparking" />
				<ul className="pt-5">
					<li className="pt-3">
						<Label text="Plate number" name="plateNumber2" />
						<InputText
							placeholder="ABN5692"
							name="plateNumber2"
							id="plateNumber2"
							onChange={onChange}
							value={plateNumber2}
						/>
					</li>
					<li className="pt-3">
						<Label
							text="Unpark time"
							description="for testing purposes only..."
							name="unparkTime"
						/>
						<InputText
							name="unparkTime"
							onChange={onChange}
							placeholder="2022-07-06T12:50:00.552Z"
							value={unparkTime}
						/>
					</li>
					<li className="pt-3">
						<div className="flex mt-5 items-center justify-center">
							<div className="mt-5 inline-flex rounded-md shadow">
								<button
									type="button"
									onClick={unparkHandler}
									className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50"
								>
									Unpark the vehicle
								</button>
							</div>
						</div>
					</li>
				</ul>
			</div>
		</div>
	);
}

export default Layout;
