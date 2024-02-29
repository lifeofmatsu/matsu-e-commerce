const { Category, Product, Tag, ProductTag } = require('./models');

const generateSeedData = async () => {
	try {
		// Fetch all categories with associated products
		const categories = await Category.findAll({
			include: { model: Product }
		});

		// Fetch all tags with associated products
		const tags = await Tag.findAll({
			include: { model: Product, as: 'products' }
		});

		// Fetch all products with associated categories and tags
		const products = await Product.findAll({
			include: [{ model: Category }, { model: Tag, as: 'tags' }]
		});

		// Fetch all product tags
		const productTags = await ProductTag.findAll();

		// Organize data into JSON format
		const seedData = {
			categories,
			products,
			tags,
			productTags
		};

		return seedData;
	} catch (error) {
		console.error('Error generating seed data:', error);
		throw error;
	}
};

// Call the function to generate seed data
generateSeedData()
	.then((seedData) => {
		// Print the generated data to console
		console.log(JSON.stringify(seedData, null, 2));
	})
	.catch((error) => {
		console.error('Error generating seed data:', error);
		process.exit(1);
	});
