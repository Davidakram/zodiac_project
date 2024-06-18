from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta,date
from flask_restful import Resource, Api
import jwt
from flask_cors import CORS
from sqlalchemy import func

app = Flask(__name__)
api = Api(app) 


app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:password@localhost:5432/zodiac'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = "db2b508cf953d8914dd0b66a3d5147d8"
db = SQLAlchemy(app)

cors = CORS(app, resources={r"/*": {"origins": "*"}})


class Users(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_name=db.Column(db.String(30), nullable=False)
    user_password = db.Column(db.String(40), nullable=False)
    user_email=db.Column(db.String(40),nullable=False)

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
    dealer=db.Column(db.String(255), nullable=False)

class Sale(db.Model):
    __tablename__ = 'sales'

    sale_id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.product_id'), nullable=False)
    quantity_sold = db.Column(db.Integer, nullable=False)
    sale_date = db.Column(db.Date, default=datetime.utcnow)
    total_sale_amount = db.Column(db.Numeric(10, 2), nullable=False)
    product_profit=db.Column(db.Numeric(10, 2), nullable=False)
    product = db.relationship('Product', backref=db.backref('sales', lazy=True))


class Login(Resource):
    def post(self):
        data = request.get_json()
        user = Users.query.filter_by(user_name=data['user_name']).first()
        if not user or not user.user_password == data['user_password']:
            return {'error': 'Invalid username or password'}, 401
    
        token = jwt.encode({
            'id': user.id,
            'user_name':user.user_name,
        }, app.config['SECRET_KEY'], algorithm='HS256')

        return {'token': token}, 200
    


class GroupedProducts(Resource):
    def get(self):
        # Perform grouping and counting directly in the database
        grouped_data = (
            db.session.query(
                Product.product_type,
                Product.product_name,
                Product.product_size,
                Product.mtl_or_dl,
                Product.nicotine_percentage,
                func.sum(Product.product_count).label('total_count')
            )
            .filter(Product.product_count != 0)
            .group_by(
                Product.product_type,
                Product.product_name,
                Product.product_size,
                Product.mtl_or_dl,
                Product.nicotine_percentage
            )
            .all()
        )

        # Convert the query result to a list of dictionaries
        grouped_products_list = [
            {
                "product_type": product.product_type,
                "product_name": product.product_name,
                "product_size": product.product_size,
                "mtl_or_dl": product.mtl_or_dl,
                "nicotine_percentage": product.nicotine_percentage,
                "total_count": product.total_count
            }
            for product in grouped_data
        ]

        return {"grouped_products": grouped_products_list}, 200



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
        dealer=data.get('dealer')
        nicotine_percentage = data.get('nicotine_percentage')
        date_added = data.get('date_added')

        
        try:

        
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
                dealer=dealer
            )
            db.session.add(new_product)
            db.session.commit()
            return {"message": "Product Added Successfully"}, 200
        except Exception as e:
            db.session.rollback()
            return{"message":f"Error Occured {str(e)}"},500
    
    def get(self):
        all_products = Product.query.all()

        products_list = []
        for product in all_products:
            if(product.product_count ==0):
                continue
            products_list.append({
                "id":product.product_id,
                'product_name': product.product_name,
                'product_type': product.product_type,
                'product_size': product.product_size,
                'mtl_or_dl':product.mtl_or_dl,
                'nicotine_percentage': product.nicotine_percentage,
                'original_price': float(product.original_price),  
                'selling_price': float(product.selling_price),    
                'total_count': product.product_count,
                'dealer':product.dealer
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
        if product.original_price == "-":
            product.original_price=0
        product.selling_price = data.get('selling_price', product.selling_price)
        product.product_name = data.get('product_name', product.product_name)
        product.product_count = data.get('total_count', product.product_count)
        product.product_size = data.get('product_size', product.product_size)
        product.nicotine_percentage = data.get('nicotine_percentage', product.nicotine_percentage)
        product.mtl_or_dl = data.get('mtl_or_dl', product.mtl_or_dl)
        product.dealer=data.get('dealer',product.dealer)

        try: 
            db.session.commit()
            return {"message": "Product updated successfully"}, 200
        except Exception as err:
            print(err)
            return {"message":"Error while Updating Product"}
        

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
                if product.product_count ==0:
                    continue
                products_list.append({
                "id":product.product_id,
                'product_name': product.product_name,
                'product_type': product.product_type,
                'product_size': product.product_size,
                'mtl_or_dl':product.mtl_or_dl,
                'nicotine_percentage': product.nicotine_percentage,
                'selling_price': float(product.selling_price),    
                'total_count': product.product_count,
                'dealer':product.dealer
            })
        # Convert the products to a JSON response
        return {'products': products_list}, 200
    
class SellingProducts(Resource):

        
    def post(self,id):
        data=request.get_json()
        try:
            product = Product.query.filter_by(product_id=id).first()
            if product is None:
                return {"message": "Product not found"},400
            if product.product_count>0:
                product.product_count-=1
            else:
                return {"message":"Product out of stock"},400
            selling_price=int(data.get("selling_price"))
            
            product_profit=(selling_price-product.original_price)
            sale=Sale(product_id=id,quantity_sold=1,sale_date=datetime.utcnow(), total_sale_amount=selling_price,product_profit=product_profit)
            db.session.add(sale)
            db.session.commit()
            return{"message":"Product was sold Successfully "},200
        except Exception as e:
            db.session.rollback()
            return {"message":str(e)},500



class DeleteSale(Resource):
    def delete(self,id):
        sale=Sale.query.get(id)
        if sale:
            product_id=sale.product_id
            product=Product.query.get(product_id)
            if product:
                product.product_count+=1
                db.session.commit()
                db.session.delete(sale)
                db.session.commit()
                return {"message": "Sale record deleted and product count updated successfully."}, 200

            else:
                return{"message":"No Product Avaliable"}
        else:
            return{"message":"No sale found"}
class TodaySales(Resource):
    
    def get(self):
        current_date = date.today()
        sales = Sale.query.filter(Sale.sale_date == current_date).all()
        formatted_sales = []
        for sale in sales:
            product=Product.query.get(sale.product_id)
            formatted_sale={
                "sale_id":sale.sale_id,
                "product_name":product.product_name,
                "product_type":product.product_type,
                "product_size":product.product_size,
                "nicotine_percentage":product.nicotine_percentage,
                "mtl_or_dl":product.mtl_or_dl,
                "quantity_sold":sale.quantity_sold,
                "total_price":float(sale.total_sale_amount),
                "product_profit":float(sale.product_profit),

            }
            formatted_sales.append(formatted_sale)
        return{"sales":formatted_sales},200

class GetSalesByDate(Resource):
    def post(self):
        data=request.get_json()
        start_date=data.get('startDate')
        end_date=data.get('endDate')
 
        sales=Sale.query.filter(Sale.sale_date>=start_date,Sale.sale_date<=end_date).all()
        formatted_sales=[]
        for sale in sales:
            product=Product.query.get(sale.product_id)
            formatted_sale={
                "sale_id":sale.sale_id,
                "product_name":product.product_name,
                "product_type":product.product_type,
                "product_size":product.product_size,
                "product_original_price":float(product.original_price),
                "nicotine_percentage":product.nicotine_percentage,
                "mtl_or_dl":product.mtl_or_dl,
                "quantity_sold":sale.quantity_sold,
                "total_price":float(sale.total_sale_amount),
                "sale_date": sale.sale_date.strftime('%Y-%m-%d'),
                "product_profit":float(sale.product_profit),
                                        
                                        }
            formatted_sales.append(formatted_sale)
        return {"sales":formatted_sales},200    
class ProductsNames(Resource):
    def get(self):
        # Query distinct product names
        distinct_product_names = db.session.query(
            Product.product_id, Product.product_name
        ).distinct(Product.product_name).all()

        # Query distinct dealer names
        distinct_dealer_names = db.session.query(
            Product.product_id, Product.dealer
        ).distinct(Product.dealer).all()

        products_names_list = []
        dealers_names_list = []

        for product in distinct_product_names:
            formatted_product = {
                "id": product.product_id,
                "product_name": product.product_name
            }
            products_names_list.append(formatted_product)

        for dealer in distinct_dealer_names:
            formatted_dealer = {
                "id": dealer.product_id,
                "dealer": dealer.dealer
            }
            dealers_names_list.append(formatted_dealer)

        return {
            "products_names_list": products_names_list,
            "dealers_names_list": dealers_names_list
        }, 200

api.add_resource(Login,"/api/login")    
api.add_resource(GroupedProducts,"/api/inventory")
api.add_resource(ProductsProccess,"/api/productsproccess")
api.add_resource(ProductsModifications,"/api/productmodify/<int:product_id>")
api.add_resource(ProductSearchResource,"/api/productsearch")
api.add_resource(SellingProducts,"/api/selling/<int:id>")
api.add_resource(TodaySales,"/api/sales")
api.add_resource(ProductsNames,"/api/productsnames")
api.add_resource(DeleteSale,"/api/deletesale/<int:id>")
api.add_resource(GetSalesByDate,"/api/getsalesbydate")
