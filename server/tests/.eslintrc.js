module.exports = {
	extends: '../.eslintrc.js',
	globals: {
		config: 'readonly',
		appServer: 'readonly',
		mongodbClient: 'readonly',
		getControllers: 'readonly',
		getModels: 'readonly',
		app: 'readonly'
	}
};
