const Web3 = require('web3')
var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"))
const solc = require('solc')

var contract = `pragma solidity ^0.4.15;

contract NotarizeTx {

  //State variables
  mapping (bytes32 => bytes32) private proofs;
  address public BSG_NODE;
  struct Tx {
    address buyer;
    address seller;
    bytes32 id;
    string date;
    uint value;
    bytes32 hash;
    string status;
    string shipping;
  }

  Tx _tx;
  event NotaryEvt(bytes32 _hash, bytes32 _id);

  /*
    Contract constructor takes _user as client Ethereum address
   */
 constructor(address _buyer, address _seller, bytes32 _id, string _date, uint _value, bytes32 _hash, string _status, string _shipping) public {
    _tx.buyer = _buyer;
    _tx.seller = _seller;
    _tx.id = _id;
    _tx.date = _date;
    _tx.value = _value;
    _tx.hash = _hash;
    _tx.status = _status;
    _tx.shipping = _shipping;
    proofs[_hash] = _id;
    BSG_NODE = msg.sender;
  }
  /**
  *
  *
   */
  function updateStatus(string _status, bytes32 _hash, bytes32 _id) public {
    if (_id != _tx.id)
      revert();

    if (msg.sender == _tx.buyer || msg.sender == BSG_NODE) {
      _tx.status = _status;
      _tx.hash = _hash;
      proofs[_hash] = _id;
    emit  NotaryEvt(_hash, _tx.id);
    } else {
      revert();
    }
  }
  /**
  *
   */
  function updateShipping(string _shipping, bytes32 _hash, bytes32 _id) public {
    if (_id != _tx.id)
      revert();

    if (msg.sender == _tx.buyer || msg.sender == BSG_NODE) {
      _tx.status = _shipping;
      _tx.hash = _hash;
      proofs[_hash] = _tx.id;
      emit NotaryEvt(_hash, _tx.id);
    } else {
      revert();
    }
  }
}`
const _id = web3.utils.asciiToHex("00000000000000000")
const _hash = web3.utils.asciiToHex("00000000000000000")

var compile = (contract) => solc.compile(contract)

function getData (contract) {
  return {
    abi: JSON.parse(compile(contract).contracts[":NotarizeTx"].interface),
    bytecode: compile(contract).contracts[":NotarizeTx"].bytecode
  }
}

var NotaryInstance = new web3.eth.Contract(getData(contract).abi , "0x66c150726119f0bac6d162dd0fe096a90c848a1a")
// call a BSG_NODE:
NotaryInstance.methods.BSG_NODE().call().then(console.log)
//uso de la fcn updateStatus
NotaryInstance.methods.updateStatus("entregado", _id, _hash)
  .send({
    from:'0x44751576b07eee07de3d8d5bfb9c8dd77add1744',
    gasLimit: 4700000,
  }).then(console.log)
