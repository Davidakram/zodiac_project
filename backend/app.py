from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta,date
from flask_restful import Resource, Api
import os
import json
from flask_restful import reqparse
from flask_cors import CORS
from werkzeug.utils import secure_filename
import base64
from sqlalchemy.exc import IntegrityError
import decimal
from sqlalchemy import text, bindparam,Table,MetaData,select
app = Flask(__name__)
api = Api(app) 


app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:david@localhost:5432/zodiac'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

cors = CORS(app, resources={r"/*": {"origins": "*"}})


class Product(db.Model):
    __tablename__ = 'products'

    product_id = db.Column(db.Integer, primary_key=True)
    product_type = db.Column(db.String(255), nullable=False)
    original_price = db.Column(db.Numeric(10, 2), nullable=False)
    selling_price = db.Column(db.Numeric(10, 2), nullable=False)
    product_name = db.Column(db.String(255), nullable=False)
    product_count = db.Column(db.Integer, nullable=False)
    product_size = db.Column(db.String(255), nullable=True)
    nicotine_percentage = db.Column(db.String, nullable=True)
    mtl_or_dl=db.Column(db.String(3), nullable=True)
    date_added = db.Column(db.Date, default=datetime.utcnow)

class Sale(db.Model):
    __tablename__ = 'sales'

    sale_id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.product_id'), nullable=False)
    quantity_sold = db.Column(db.Integer, nullable=False)
    sale_date = db.Column(db.Date, default=datetime.utcnow)
    total_sale_amount = db.Column(db.Numeric(10, 2), nullable=False)

    product = db.relationship('Product', backref=db.backref('sales', lazy=True))




class ProductsProccess(Resource):
    def post(self):
        data = request.get_json()

        product_type = data.get('product_type')
        mtl_or_dl=data.get('mtl_or_dl')
        original_price = data.get('original_price')
        selling_price = data.get('selling_price')
        product_name = data.get('product_name')
        product_count = data.get('product_count')
        product_size = data.get('product_size')
        nicotine_percentage = data.get('nicotine_percentage')
        date_added = data.get('date_added')
        
        new_product = Product(
            product_type=product_type,
            original_price=original_price,
            selling_price=selling_price,
            product_name=product_name,
            product_count=product_count,
            product_size=product_size,
            nicotine_percentage=nicotine_percentage,
            date_added=date_added,
            mtl_or_dl=mtl_or_dl,
        )

        # Add the new Product to the database session
        db.session.add(new_product)
        db.session.commit()

        return {"message": "Product Added Successfully"}, 200
    
    def get(self):
        all_products = Product.query.all()

        products_list = []
        for product in all_products:
            products_list.append({
                "id":product.product_id,
                'product_name': product.product_name,
                'product_type': product.product_type,
                'product_size': product.product_size,
                'mtl_or_dl':product.mtl_or_dl,
                'nicotine_percentage': product.nicotine_percentage,
                'original_price': float(product.original_price),  
                'selling_price': float(product.selling_price),    
                'total_count': product.product_count
            })

        return {'products': products_list}, 200
    
class ProductsModifications(Resource):
    def put(self, product_id):
        data = request.get_json()
        product = Product.query.filter_by(product_id=product_id).first()
        
        if not product:
            return {"message": "Product not found"}, 404
        
        product.product_type = data.get('product_type', product.product_type)
        product.original_price = data.get('original_price', product.original_price)
        product.selling_price = data.get('selling_price', product.selling_price)
        product.product_name = data.get('product_name', product.product_name)
        product.product_count = data.get('total_count', product.product_count)
        product.product_size = data.get('product_size', product.product_size)
        product.nicotine_percentage = data.get('nicotine_percentage', product.nicotine_percentage)
        product.mtl_or_dl = data.get('mtl_or_dl', product.mtl_or_dl)

        try: 
            db.session.commit()
            return {"message": "Product updated successfully"}, 200
        except Exception as err:
            print(err)

        

class ProductSearchResource(Resource):
    def post(self):
        search_criteria = request.get_json()

        if all(value is None for value in search_criteria.values()):
            products = Product.query.all()
        else:
            query = Product.query
            for field, value in search_criteria.items():
                if value:
                    query = query.filter(getattr(Product, field).ilike(f"%{value}%"))

            products = query.all()
        products_list = []
        for product in products:
                products_list.append({
                "id":product.product_id,
                'product_name': product.product_name,
                'product_type': product.product_type,
                'product_size': product.product_size,
                'mtl_or_dl':product.mtl_or_dl,
                'nicotine_percentage': product.nicotine_percentage,
                'selling_price': float(product.selling_price),    
                'total_count': product.product_count
            })
        # Convert the products to a JSON response
        return {'products': products_list}, 200
    
class SellingProducts(Resource):
    def post(self,id):
        try:
            product = Product.query.filter_by(product_id=id).first()
            if product is None:
                return {"message": "Product not found"},400
            if product.product_count>0:
                product.product_count-=1
            else:
                return {"message":"Product out of stock"},400

            sale=Sale(product_id=id,quantity_sold=1,sale_date=datetime.utcnow(), total_sale_amount=product.selling_price)
            db.session.add(sale)
            db.session.commit()
            return{"message":"Product was sold Successfully "},200
        except Exception as e:
            db.session.rollback()
            return {"message":str(e)},500


class TodaySales(Resource):
    def get(self):
        current_date = date.today()
        sales = Sale.query.filter(Sale.sale_date == current_date).all()
        formatted_sales = []
        for sale in sales:
            product_name=Product.query.get(sale.product_id).product_name
            formatted_sale={
                "sale_id":sale.sale_id,
                "product_name":product_name,
                "quantity_sold":sale.quantity_sold,
                "total_price":float(sale.total_sale_amount),
            }
            formatted_sales.append(formatted_sale)
        return{"sales":formatted_sales},200
    
class ProductsNames(Resource):
    def get(self):
        products=Product.query.all()
        products_names_list=[]
        for product in products:
            formmatted_product={
                "id":product.product_id,
                "product_name":product.product_name
            }
            products_names_list.append(formmatted_product)
        return {"products_names_list":products_names_list},200
# apis
    
api.add_resource(ProductsProccess,"/api/productsproccess")
api.add_resource(ProductsModifications,"/api/productmodify/<int:product_id>")
api.add_resource(ProductSearchResource,"/api/productsearch")
api.add_resource(SellingProducts,"/api/selling/<int:id>")
api.add_resource(TodaySales,"/api/sales")
api.add_resource(ProductsNames,"/api/productsnames")