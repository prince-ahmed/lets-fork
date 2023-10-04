from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from datetime import datetime

import json

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = 'your_secret_key'
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:password@localhost/lets-fork'
jwt = JWTManager(app)
CORS(app)
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)


# User Model
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(60), nullable=False)
    wishlist = db.Column(db.String(500))    # Store wishlist items as a comma-separated string
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f'User(id={self.id}, email={self.email}, wishlist={self.wishlist})'
    
    @classmethod
    def from_json(cls, json_data):
        data = json.loads(json_data)
        return cls(**data)


# API Routes
@app.route('/register', methods=['POST'])
def register():
    json_data = request.get_json()

    try:
        new_user = User.from_json(json.dumps(json_data))
        hashed_password = bcrypt.generate_password_hash(new_user.password).decode('utf-8')
        new_user.password = hashed_password
        db.session.add(new_user)
        db.session.commit()
        return jsonify(message='User created successfully'), 201
    except Exception as e:
        db.session.rollback()
        return jsonify(message=f'Error: {str(e)}'), 500
    
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data['email']).first()
    if user and bcrypt.check_password_hash(user.password, data['password']):
        access_token = create_access_token(identity=user.id)
        return jsonify(access_token=access_token), 200
    return jsonify(message='Invalid email or password'), 401

@app.route('/profile', methods=['GET', 'PUT'])
@jwt_required()
def profile():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if request.method == 'GET':
       return jsonify(user={
            'id': user.id,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
            'wishlist': user.wishlist.split(',') if user.wishlist else []
       }), 200
    elif request.method == 'PUT':
        data = request.get_json()
        user.first_name = data.get('first_name', user.first_name)
        user.last_name = data.get('last_name', user.last_name)
        user.wishlist = ','.join(data.get('wishlist', user.wishlist))
        db.session.commit()
        return jsonify(message='User profile updated successfully'), 200

if __name__ == '__main__':
    db.create_all   # Create the database tables before running the app
    app.run(debug=True)