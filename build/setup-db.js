const {
	DB_NAME,
	DB_USER,
	DB_PASSWORD,
	COLLECTION_1,
	COLLECTION_2,
	COLLECTION_3,
	COLLECTION_4,
	NO_OF_ENTRYPOINTS,
	NO_OF_SLOT_TYPE,
	NO_OF_SLOTS_PER_TYPE
} = process.env;
const { exit } = require('process');
const {
	entryPoints,
	parkingComplex,
	parkingHistories,
	parkingSlots
} = require('./schema');

const {
	entryPointsSeed,
	parkingComplexSeed,
	parkingSlotsSeed,
	slotDistances
} = require('./seed');

const db = new Mongo('mongodb5:27017').getDB(DB_NAME);
db.getSiblingDB(DB_NAME);

db.createUser({
	user: DB_USER,
	pwd: DB_PASSWORD,
	roles: [{ role: 'readWrite', db: DB_NAME }]
});

db.getSiblingDB(DB_NAME).auth(DB_USER, DB_PASSWORD);

const collectionSetup = [];

const collections = [
	{ name: COLLECTION_1, schema: entryPoints },
	{ name: COLLECTION_2, schema: parkingComplex },
	{ name: COLLECTION_3, schema: parkingHistories },
	{ name: COLLECTION_4, schema: parkingSlots }
];

for (let i = 0; i < 4; i++) {
	collectionSetup.push(
		Promise.resolve(
			db.createCollection(collections[i].name, {
				validator: {
					$jsonSchema: collections[i].schema
				}
			})
		)
	);
}

Promise.all(collectionSetup)
	.then(() => {
		db.entryPoints.createIndex({
			parkingComplexId: 1
		});

		db.parkingComplex.createIndex({
			name: 1
		});

		db.parkingHistories.createIndex({
			plateNumber: 1,
			parkTime: 1
		});

		db.parkingSlots.createIndex({
			parkingComplexId: 1,
			type: 1,
			isOccupied: 1,
			distances: 1
		});

		const parkingComplexReturn =
			db.parkingComplex.insertOne(parkingComplexSeed);

		const entryPointsData = [];
		for (let i = 0; i < parseInt(NO_OF_ENTRYPOINTS); i++) {
			const singleEntryPoint = {
				...entryPointsSeed[0],
				name: `${entryPointsSeed[0].name} ${i + 1}`,
				parkingComplexId: parkingComplexReturn.insertedId
			};
			entryPointsData.push(singleEntryPoint);
		}

		const entryPointsReturn = db.entryPoints.insertMany(entryPointsData);

		const parkingSlotsData = [];

		let outerCount = 0;

		for (let i = 0; i < parseInt(NO_OF_SLOT_TYPE); i++) {
			for (let j = 0; j < parseInt(NO_OF_SLOTS_PER_TYPE); j++) {
				const singleParkingSlot = {
					...parkingSlotsSeed[0],
					name: `${entryPointsSeed[0].name} ${outerCount}`,
					parkingComplexId: parkingComplexReturn.insertedId,
					type: i,
					ratePerHour: parkingSlotsSeed[0].ratePerHour + 40 * i,
					distances: {}
				};

				let innerCount = 0;

				for (let item in entryPointsReturn.insertedIds) {
					const entryPointId = entryPointsReturn.insertedIds[item];
					db.parkingComplex.findOneAndUpdate(
						{ _id: parkingComplexReturn.insertedId },
						{ $addToSet: { entryPoints: entryPointId } }
					);

					singleParkingSlot.distances[entryPointId] =
						slotDistances[outerCount][innerCount];

					innerCount++;
				}

				parkingSlotsData.push(singleParkingSlot);

				outerCount++;
			}
		}

		const parkingSlotsReturn = db.parkingSlots.insertMany(parkingSlotsData);

		for (let item in parkingSlotsReturn.insertedIds) {
			const parkingSlotId = parkingSlotsReturn.insertedIds[item];
			db.parkingComplex.findOneAndUpdate(
				{ _id: parkingComplexReturn.insertedId },
				{ $addToSet: { parkingSlots: parkingSlotId } }
			);
		}

		console.log('\n\n\n\n\n=====> DONE BUILDING!!! <======\n\n\n\n\n');
	})
	.catch((error) => {
		console.log(`\n\n\n\n\n=====> Error: ${error} <======\n\n\n\n\n`);
	});
