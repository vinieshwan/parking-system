import axios from 'axios';

export const getParkingComplex = async (parkingComplexName) => {
	try {
		const response = await axios.get(
			`/v1/parking-complex/get/${parkingComplexName}`
		);
		return response.data.data;
	} catch (error) {
		return {
			error: true,
			data: error.response.data,
			status: error.response.status
		};
	}
};

export const listEntryPoints = async (parkingComplexId) => {
	try {
		const response = await axios.get(
			`/v1/entry-points/list/${parkingComplexId}`
		);
		return response.data.data;
	} catch (error) {
		return {
			error: true,
			data: error.response.data,
			status: error.response.status
		};
	}
};

export const addEntryPoint = async (parkingComplexId, entryPointName) => {
	try {
		const response = await axios.post(`/v1/entry-points/add`, {
			parkingComplexId,
			entryPointName
		});
		return response.data;
	} catch (error) {
		return {
			error: true,
			data: error.response.data,
			status: error.response.status
		};
	}
};

export const getAvailableSlot = async (
	parkingComplexId,
	entryPointId,
	type
) => {
	try {
		const response = await axios.get(
			`/v1/parking-slot/get/${parkingComplexId}/${entryPointId}/${type}`
		);
		return response.data.data;
	} catch (error) {
		return {
			error: true,
			data: error.response.data,
			status: error.response.status
		};
	}
};

export const park = async (parkingSlotId, entryPointId, vehicleDetails) => {
	try {
		const response = await axios.post(`/v1/parking-history/park`, {
			plateNumber: vehicleDetails.plateNumber,
			parkingSlotId,
			entryPointId,
			type: vehicleDetails.type,
			parkTime: vehicleDetails.parkTime || undefined
		});
		return response.data;
	} catch (error) {
		return {
			error: true,
			data: error.response.data,
			status: error.response.status
		};
	}
};

export const unpark = async (vehicleDetails) => {
	try {
		const response = await axios.post(`/v1/parking-history/unpark`, {
			plateNumber: vehicleDetails.plateNumber,
			unparkTime: vehicleDetails.unparkTime || undefined
		});
		return response.data.data;
	} catch (error) {
		return {
			error: true,
			data: error.response.data,
			status: error.response.status
		};
	}
};
