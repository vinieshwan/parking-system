import { createContext, useReducer } from 'react';
import Reducer from './Reducer';
import Layout from './Layout';

const initialState = {
	parkingComplex: {},
	entryPoints: [],
	selectedSlot: {},
	error: {}
};

const Context = createContext(initialState);

function App() {
	const [state, dispatch] = useReducer(Reducer, initialState);

	return (
		<div className="h-screen container m-0 inset-0 bg-gray-500">
			<div className="flex min-h-screen text-center md:block md:px-2 lg:px-4">
				<div className="flex text-base text-left w-full md:inline-block md:max-w-2xl md:px-4 md:my-8 md:align-middle lg:max-w-4xl">
					<div className="w-full relative items-center bg-white px-4 pt-14 pb-8 overflow-hidden shadow-2xl sm:px-6 sm:pt-8 md:p-6 lg:p-8">
						<Context.Provider value={[state, dispatch]}>
							<Layout context={Context} />
						</Context.Provider>
					</div>
				</div>
			</div>
		</div>
	);
}

export default App;
