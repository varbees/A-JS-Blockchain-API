const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const { urlencoded } = require('body-parser');
const blockchain = require('../blockchain');

const contract = new blockchain();
const nodeAddress = uuidv4().split('-').join('');

const PORT = 5000;

app.use(bodyParser.json());
app.use(urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.send('hello world');
});

app.get('/blockchain', (req, res) => {
  res.send(contract);
});

app.post('/transaction', (req, res) => {
  const blockIndex = contract.createNewTransaction(
    req.body.amount,
    req.body.sender,
    req.body.recipient
  );
  res.json({ note: `Transaction will be added in block ${blockIndex}` });
});

app.get('/mine', (req, res) => {
  const lastBlock = contract.getLastBlock();
  const previousBlockHash = lastBlock['hash'];
  const currentBlockData = {
    transactions: contract.pendingTransactions,
    index: lastBlock['index'] + 1,
  };
  const nonce = contract.proofOfWork(previousBlockHash, currentBlockData);
  const hash = contract.hashBlock(previousBlockHash, currentBlockData, nonce);

  const miningRewardTransaction = contract.createNewTransaction(
    3,
    '00',
    nodeAddress
  );

  const newBlock = contract.createNewBlock(nonce, previousBlockHash, hash);

  res.json({
    note: 'New block mined successfully',
    block: newBlock,
  });
});

app.listen(PORT, (req, res) => {
  console.log(`Listening on ${PORT}`);
});
