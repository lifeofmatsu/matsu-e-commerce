const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');


router.get('/', async (req, res) => {
	try {
		const productData = await Product.findAll({
			include: [{ model: Category }, { model: Tag, as: 'tags' }]
		});

		res.status(200).json(productData);
	} catch (err) {
		res.status(500).json(err);
	}
});

router.get('/:id', async (req, res) => {
	try {
		const productData = await Product.findByPk(req.params.id, {
			include: [{ model: Category }, { model: Tag, as: 'tags' }]
		});

		if (!productData) {
			res.status(404).json({ message: 'No product found with that id!' });
			return;
		}

		res.status(200).json(productData);
	} catch (err) {
		res.status(500).json(err);
	}
});

/**
 * req.body should look like this...
 *   {
 *       product_name: "Basketball",
 *       price: 65.95,
 *       stock: 12,
 *       tag_ids: [1, 2, 3, 4]
 *   }
 */
router.post('/', async (req, res) => {
    try {
        // Create the product
        const product = await Product.create(req.body);

        // Check if product creation was successful
        if (!product) {
            return res.status(400).json({ message: 'Failed to create product' });
        }

        // If there are product tags, create pairings in the ProductTag model
        if (req.body.tag_ids && req.body.tag_ids.length) {
            const productTagIdArr = req.body.tag_ids.map((tag_id) => ({
                product_id: product.id,
                tag_id
            }));
            await ProductTag.bulkCreate(productTagIdArr);
        }

        // Respond with the created product
        res.status(201).json(product);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.put('/:id', async (req, res) => {
    try {
        // Update product data
        const updatedProduct = await Product.update(req.body, {
            where: {
                id: req.params.id
            }
        });

        // If there are tag_ids in the request body and they have length
        if (req.body.tag_ids && req.body.tag_ids.length) {
            // Find all existing product tags
            const productTags = await ProductTag.findAll({
                where: { product_id: req.params.id }
            });

            // Create filtered list of new tag_ids
            const productTagIds = productTags.map(({ tag_id }) => tag_id);
            const newProductTags = req.body.tag_ids
                .filter((tag_id) => !productTagIds.includes(tag_id))
                .map((tag_id) => ({
                    product_id: req.params.id,
                    tag_id
                }));

            // Figure out which ones to remove
            const productTagsToRemove = productTags
                .filter(({ tag_id }) => !req.body.tag_ids.includes(tag_id))
                .map(({ id }) => id);

            // Run both actions
            await Promise.all([
                ProductTag.destroy({
                    where: { id: productTagsToRemove }
                }),
                ProductTag.bulkCreate(newProductTags)
            ]);
        }

        // Respond with the updated product
        res.json(updatedProduct);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});


router.delete('/:id', async (req, res) => {
	try {
		const productData = await Product.destroy({
			where: {
				id: req.params.id
			}
		});

		if (!productData) {
			res.status(404).json({ message: 'No product found with that id!' });
			return;
		}

		res.status(200).json(productData);
	} catch (err) {
		res.status(500).json(err);
	}
});

module.exports = router;
