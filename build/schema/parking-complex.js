module.exports = {
	bsonType: 'object',
	required: [
		'name',
		'noOfSlots',
		'noOfEntryPoints',
		'flatRate',
		'continuousHourThreshold',
		'dayRate',
		'createdAt',
		'updatedAt'
	],
	properties: {
		name: {
			bsonType: 'string',
			description: 'Name of the parking complex.'
		},
		noOfSlots: {
			bsonType: 'int',
			description: 'Number of slots a parking complex can cater.'
		},
		noOfEntryPoints: {
			bsonType: 'int',
			description: 'Number of entry points a parking complex can have.'
		},
		flatRate: {
			bsonType: 'object',
			required: ['rate', 'hours'],
			properties: {
				rate: {
					bsonType: 'int',
					description: 'The flat rate.'
				},
				hours: {
					bsonType: 'int',
					description: 'The length of hours the flat rate may take effect.'
				}
			},
			description:
				'The initial rate when a vehicle parks for the defined hour length.'
		},
		dayRate: {
			bsonType: 'int',
			description: 'Rate per 24 hour.'
		},
		continuousHourThreshold: {
			bsonType: 'int',
			description:
				'Number of hours will the vehicle can still be considered on a continuous rate.'
		},
		createdAt: {
			bsonType: 'date',
			description: 'The date the parking complex was added to the system.'
		},
		updatedAt: {
			bsonType: 'date',
			description: 'The latest date the parking complex object was updated.'
		}
	}
};
