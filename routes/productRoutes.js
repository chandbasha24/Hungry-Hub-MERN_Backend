import express from 'express'
import { isAdmin, requireSignIn } from '../middlewares/authMiddleware.js';
import { brainTreePaymentController, brainTreeTokenController,
       createProductController, deleteProductController,
        getProductController,
     getSingleProductController, productCategoryController,
      productCountController, productFiltersController, 
     productListController,
      productPhotoController, relatedProductController,
       searchProductController, updateProductController } from '../controllers/productController.js';
import  formidable  from 'express-formidable';


const router =express.Router()

//routes create
router.post('/create-product',requireSignIn,isAdmin,formidable(),createProductController)

//get Prodcuts

router.get("/get-product",getProductController);

//single Product
router.get("/get-product/:slug",getSingleProductController)


//get photo
router.get("/product-photo/:pid", productPhotoController)


//delete Product
router.delete('/delete-product/:pid',deleteProductController)

// update product
router.put('/update-product/:pid',requireSignIn,isAdmin,formidable(),updateProductController)
//filter
router.post("/product-filters", productFiltersController);
//porduct count

router.get("/product-count", productCountController);

//product per page

router.get('/product-list/:page',productListController)

//Search Product 
router.get("/search/:keyword", searchProductController)

// //similar product

router.get('/related-product/:pid/:cid', relatedProductController)





//category wise 
router.get('/product-category/:slug',productCategoryController)


//payments routes
//token

router.get('/braintree/token',brainTreeTokenController)

//payments
router.post('/braintree/payment', requireSignIn, brainTreePaymentController)



export default router;