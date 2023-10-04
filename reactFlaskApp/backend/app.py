from flask import Flask, request
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from flask_cors import CORS

import json

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:password@localhost/lets-fork'
db = SQLAlchemy(app)
CORS(app)


# User Model
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'User: {self.first_name} {self.last_name} {self.email}'
    
    def __init__(self, first_name, last_name, email):
        self.first_name = first_name
        self.last_name = last_name
        self.email = email

# Format user data into json      
def format_user(user):
    return {
        "id": user.id,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
        "created_at": user.created_at
    }

# Create a user
@app.route('/user', methods = ['POST'])
def create_user():
    first_name = request.json.get('first_name')
    last_name = request.json.get('last_name')
    email = request.json.get('email')
    user = User(first_name, last_name, email)
    db.session.add(user)
    db.session.commit()
    return format_user(user)

# Get all users and return as a json dictionary
@app.route('/users', methods = ['GET'])
def get_users():
    users = User.query.order_by(User.id.asc()).all()
    user_list = []
    for user in users:
        user_list.append(format_user(user))
    return {'users': user_list}

# Get single user
@app.route('/users/<id>', methods = ['GET'])
def get_user():
    user = User.query.filter_by(id=id).first()
    formatted_user = format_user(user)
    return {'user': formatted_user}

# Deleting a single user
@app.route('/users/<id>', methods=['DELETE'])
def delete_event(id):
    user = User.query.filter_by(id=id).first()
    db.session.delete(user)
    db.session.commit()
    return f'User (id: {id}) deleted!'

# Update a user
@app.route('/users/<id>', methods=['PUT'])
def update_user(id):
    user = User.query.filter_by(id=id)
    first_name = request.json.get('first_name')
    last_name = request.json.get('last_name')
    email = request.json.get('email')
    user.update(dict(first_name = first_name, last_name = last_name, email = email, created_at = datetime.utcnow()))
    db.session.commit()
    return {'user': format_user(user.first())}

if __name__ == '__main__':
    app.run()