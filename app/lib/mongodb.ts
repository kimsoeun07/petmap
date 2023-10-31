import { MongoClient } from 'mongodb'

const uri = 'mongodb+srv://ksoeun6204:hG5CM4TzUpDrAbXU@cluster0.1jfdc5b.mongodb.net/petmap';
export const client = new MongoClient(uri);

const database = client.db('petmap');
export const collection = database.collection('H-info');
export const petcollection = database.collection('petdata')
export const walkcollection = database.collection('walkData')