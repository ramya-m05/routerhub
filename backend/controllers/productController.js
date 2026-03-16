const Product = require("../models/Product");

// Add product (admin)
exports.addProduct = async (req,res)=>{

  try{

    const product = new Product({
      name:req.body.name,
      category:req.body.category,
      description:req.body.description,
      price:req.body.price,
      stock:req.body.stock,
      image:req.file.path
    });

    await product.save();

    res.json(product);

  }catch(err){

    res.status(500).json({message:err.message});

  }

};

// Get all products
exports.getProducts = async (req, res) => {

    try {

        const products = await Product.find();

        res.json(products);

    } catch (error) {

        res.status(500).json({ message: error.message });

    }

};

router.get("/:id", getProductById);

// Delete product (admin)
exports.deleteProduct = async (req,res)=>{

  try{

    await Product.findByIdAndDelete(req.params.id);

    res.json({message:"Product deleted"});

  }catch(err){

    res.status(500).json({message:err.message});

  }

};

// Update product (admin)
exports.updateProduct = async (req,res)=>{

  try{

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new:true }
    );

    res.json(product);

  }catch(err){

    res.status(500).json({message:err.message});

  }

};