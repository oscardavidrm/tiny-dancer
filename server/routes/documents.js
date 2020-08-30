import {Router} from 'express';
import jwt from 'jsonwebtoken';
import {User, Document} from '../mongo-db/models';
import {
  getTokenFromRequest,
  uploadFile,
  validateSignature,
} from '../utils/functions';
import {JWT_SECRET} from '../config';

const documents = Router();

documents.post('/new-document', async (req, res) => {
  try {
    const token = getTokenFromRequest(req);
    const {id} = jwt.verify(token, JWT_SECRET);
    const {name, file: base64, signatures} = req.body;

    const {cid} = await uploadFile(base64);

    const hash = cid.toString();
    const url = `https://gateway.ipfs.io/ipfs/${hash}`;

    const document = new Document({
      name,
      hash,
      url,
      owner: id,
      signatures: signatures.map((id) => ({user: id})),
    });

    await document.save();

    res.status(200).json(document);
  } catch (e) {
    res.status(400).send(e.toString());
  }
});

documents.get('/mine', async (req, res) => {
  try {
    const token = getTokenFromRequest(req);
    const {id} = jwt.verify(token, JWT_SECRET);

    const documents = await Document.find({owner: id}).populate(
      'owner signatures.user',
    );

    res.status(200).json(documents);
  } catch (e) {
    res.status(400).send(e.toString());
  }
});

documents.post('/sign', async (req, res) => {
  try {
    const token = getTokenFromRequest(req);
    const {id} = jwt.verify(token, JWT_SECRET);
    const {document: documentId, signature} = req.body;

    const user = await User.findById(id);
    const document = await Document.findById(documentId);

    if (!user) throw new Error('User does not exist!');
    if (!document) throw new Error('Document does not exist!');

    const recoveredAddress = validateSignature(signature, document.hash);

    if (recoveredAddress.toLowerCase() === user.ethAddress.toLowerCase()) {
      for (let i = 0; i < document.signatures.length; ++i) {
        if (document.signatures[i].user === user.id) {
          document.signatures[i].signature = user.signature;
          break;
        }
      }

      res.status(200).send(`Successfully signed contract ${document.name}!`);
    } else {
      throw new Error('Signature does not match the records!');
    }
  } catch (e) {
    res.status(400).send(e.toString());
  }
});

documents.get('/', async (req, res) => {
  try {
    const token = getTokenFromRequest(req);
    const {id} = jwt.verify(token, JWT_SECRET);
    // const { signed } = req.query;

    // if(typeof signed === 'boolean'){
    //   $elemMatch: {
    //     'signatures.signature.'
    //   }
    // }

    const documents = await Document.find({'signatures.user': id}).populate(
      'owner signatures.user',
    );

    res.status(200).json(documents);
  } catch (e) {
    res.status(400).send(e.toString());
  }
});

export default documents;
