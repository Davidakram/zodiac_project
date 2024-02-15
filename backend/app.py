from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
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
            date_added=date_added
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
        try: 
            db.session.commit()
            return {"message": "Product updated successfully"}, 200
        except Exception as err:
            print(err)

        

    


# apis
api.add_resource(ProductsProccess,"/api/productsproccess")
api.add_resource(ProductsModifications,"/api/productmodify/<int:product_id>")