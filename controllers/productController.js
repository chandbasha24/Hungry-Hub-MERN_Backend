import slugify from "slugify";
import productModel from "../models/productModel.js"
import CategoryModel from "../models/CategoryModel.js";
import fs from 'fs'
// import { populate } from "dotenv";
import braintree from "braintree";
import orderModel from "../models/orderModel.js";
import dotenv from "dotenv";
dotenv.config();


//payment gateway

var gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.BRAINTREE_MERCHANT_ID,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY,
});

// export const createProductController = async (req, res) => {
//   try {
//     const { name, description, price, category, quantity, shipping } =
//       req.fields;

//     const { photo } = req.files;

//     // Validation
//     if (
//       !name ||
//       !description ||
//       !price ||
//       !category ||
//       !quantity ||
//       (photo && photo.size > 100000)
//     ) {
//       return res.status(400).send({ error: "Invalid product data" });
//     }

//     const newProduct = new productModel({
//       name,
//       description,
//       price,
//       category,
//       quantity,
//       shipping,
//       slug: slugify(name),
//     });

//     if (photo) {
//       newProduct.photo.data = fs.readFileSync(photo.path);
//       newProduct.photo.contentType = photo.type;
//     }

//     await newProduct.save();

//     res.status(201).send({
//       success: true,
//       message: "Product created successfully",
//       product: newProduct,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send({
//       success: false,
//       message: "Error in creating product",
//       error: error.message,
//     });
//   }
// };


export const createProductController = async (req, res) => {
  try {
    const { name, description, price, category, quantity, shipping } =
      req.fields;
    const { photo } = req.files;

    // Validation
    if (!name || !description || !price || !category || !quantity) {
      return res.status(400).send({ error: "Invalid product data" });
    }

    // Check photo size and type
    if (photo && (photo.size > 1000000 || !photo.type.includes("image"))) {
      return res
        .status(400)
        .send({
          error: "Invalid photo. Please upload an image less than 1MB.",
        });
    }

    const newProduct = new productModel({
      name,
      description,
      price,
      category,
      quantity,
      shipping,
      slug: slugify(name),
    });

    if (photo) {
      // Read image file and set data & content type
      newProduct.photo.data = fs.readFileSync(photo.path);
      newProduct.photo.contentType = photo.type;
    }

    await newProduct.save();

    res.status(201).send({
      success: true,
      message: "Product created successfully",
      product: newProduct,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error in creating product",
      error: error.message,
    });
  }
};



















// get all products

export const getProductController =async(req,res)=>{
    try {
        const products = await productModel.find({}).populate('category') .select("-photo").limit(12).sort({createdAt:-1})
        res.status(200).send({
          success: true,
          counTotal: products.length,
          message: "ALL Products ",
          products,
        });
        
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success:false,
            message:"Error in getting Products",
            error:error.message,
        })
        
    }
}

//get Single Product

export const getSingleProductController= async(req,res)=>{
    try {
        const product = await productModel.findOne({slug:req.params.slug}).select("-photo").populate("category")
         res.status(200).send({
           success: true,
           
           message: "Single Product fetched ",
           product,
         });
    } catch (error) {
        console.log(error)
       res.status(500).send({
         success: false,
         message: "While  getting  single Products",
         error
       });
        
    }
}

//get photo

export const productPhotoController =async (req,res)=>{
    try {
        const product = await productModel.findById(req.params.pid).select("photo")
        if(product.photo.data){
            res.set('Content-type',product.photo.contentType)
            return res.status(200).send(product.photo.data);
        }
        
    } catch (error) {
         res.status(500).send({
         success: false,
         message: "error While  getting photo",
         error
        
    })
}}



//deleteProductController

export  const deleteProductController=async(req,res)=>{
    try {
      await productModel.findByIdAndDelete(req.params.pid).select("-photo")
      res.status(200).send({
        success:true,
        message:"Product deleted successfully",
      })
        
    } catch (error) {
        res.status(500).send({
         success: false,
         message: "error While deleting product",
         error
        
    })

}}

//update Product

export const updateProductController= async(req,res)=>{
    try {
        const {
          name,
          slug,
          description,
          price,
          category,
          quantity,
          shipping,
        } = req.fields;

        const {photo} = req.files;

//validation

switch (true) {
  case !name:
    return res.status(500).send({ error: "Name is required" });
  case !description:
    return res.status(500).send({ error: "Description is required" });
  case !price:
    return res.status(500).send({ error: "Price is required" });
  case !category:
    return res.status(500).send({ error: "Category is required" });
  case !quantity:
    return res.status(500).send({ error: "Quantity is required" });
  case photo && photo.size >100000:
    return res.status(500).send({ error: "Photo is required and shuld be less than 1mb" });
}

const products = await productModel.findByIdAndUpdate(req.params.pid,{...req.fields,
    slug:slugify(name)},{new:true})
   if(photo){
    products.photo.data = fs.readFileSync(photo.path)
    products.photo.contentType = photo.type
   }
     await products.save();
     res.status(201).send({
        success:true,
        message:" product Updated Successfully",
        products,
     })
    } 
    catch (error) {
        console.log(error)
        res.status(500).send({
            success:false,
            error,
            message:"Error in Updating the  Product"
        })
        
    }


}

export const productFiltersController = async (req, res) => {
  try {
    const { checked, radio } = req.body;
    let args = {};
    if (checked.length > 0) args.category = checked;
    if (radio.length) args.price = { $gte: radio[0], $lte: radio[1] }; // Correct the typo

    const products = await productModel.find(args);
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while filtering products",
      error,
    });
  }
};


//product count 
 export const productCountController=async(req,res)=>{
  try {
      const total = await productModel.find({}).estimatedDocumentCount()
      res.status(200).send({
        success:true,
        total
      })
  } catch (error) {
    console.log(error)
    res.status(400).send({
      message: "Error while product count",
      error,
      success: false,
    });
  }
 }


 //product List based on page
export const productListController = async (req, res) => {
  try {
    const perPage = 8;
    const page = req.params.page ? req.params.page : 1;
    const products = await productModel
      .find({})
      .select("-photo")
      .skip((page - 1) * perPage) // Corrected syntax here
      .limit(perPage)
      .sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    res.status(400).send({
      message: "Error in page ctrl",
      error,
      success: false,
    });
  }
};

//searchProductController

export const searchProductController=async(req,res)=>{
  try {
    const {keyword} =req.params
    const results = await productModel.find({
      $or:[
        {name:{$regex: keyword, $options:"i"}},
        {description:{$regex: keyword, $options:"i"}}
      ]
    }).select("-photo");
    res.json(results);

  } catch (error) {
    res.status(400).send({
      message: "Error in search Product API",
      error,
      success: false,
    });
    
  }
 
}
 

//similar ProductController
//    export const relatedProductController=async(req,res)=>{
//   try {
//     const {pid,cid}=req.params
//     const products=await productModel.find({
//       category:cid,
//       _id:{$ne:pid}

//     }).select('-photo').limit(3).populate("category");
//      res.status(400).send({
//        success: true,
//       products,

//       })

    
//   } catch (error) {

//     console.log(error)
//      res.status(400).send({
//        message: "Error while getting related product",
//        error,
//        success: false,
//      });
    
    
//   }

// }




export const relatedProductController = async (req, res) => {
  try {
    const { pid, cid } = req.params;
    const products = await productModel
      .find({ category: cid, _id: { $ne: pid } })
      .select("-photo")
      .limit(3)
      .populate("category");

    res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("Error while getting related products:", error);
    res.status(500).json({
      success: false,
      message: "Error while getting related products",
      error: error.message,
    });
  }
};





// get product by category

export const productCategoryController=async(req,res)=>{
  try {
    const category = await CategoryModel.findOne({ slug: req.params.slug });
    const products =await productModel.find({category}).populate('category')
     res.status(200).send({
       success: true,
       category,
       products,
     });

    
  } catch (error) {
    console.log(error)
    res.status(400).send({
      message: "Error while getting product",
      error,
      success: false,
    });
    
  }

}

//payment gateway api
//TOKEN

export const  brainTreeTokenController=async(req,res)=>{
  try {
    gateway.clientToken.generate({},function(err,response){
      if(err){
        res.status(500).send(err)
      }
      else{
        res.send(response);
      }
    })
    
  } catch (error) {
    console.log(error)
    
  }
}


//payment
export const brainTreePaymentController=async(req,res)=>{
  try {
    const {cart,nonce} = req.body
    let total =0
    cart.map((i) => {
      total +=i.price});
      let newTransaction = gateway.transaction.sale({
        amount:total,
        paymentMethodNonce:nonce,
        options:{
          submitForSettlement:true
        },
      },
         function(error,result){
      if(result){
        const order = new orderModel({
          products:cart,
          payment: result,
          buyer:req.user._id

        }).save()
        res.json({ok:true})


      }
      else{
        res.status(500).send(error)
      }
    })


  } catch (error) {
    console.log(error);
    
  }
}