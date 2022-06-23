// truffle exec ./getImplementationAddress.js --network mainnet

module.exports = function() {
    web3.eth.getStorageAt(
      // contract address
      "0xB25B9841c0a664aAA7455af20320BF8863E93283",
      // implementation slot
      "0x7050c9e0f4ca769c69bd3a8ef740bc37934f8e2c036e5a723fd8ee048ed3f8c3",
      function (err, resp) {
        console.log(err, resp)
      }
    );
  };