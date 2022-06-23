const AdminUpgradeabilityProxy = artifacts.require("AdminUpgradeabilityProxy");

module.exports = function (deployer) {
  deployer.deploy(AdminUpgradeabilityProxy, '0x37774cc9779576BD120acedb5000F61646884c7f');
};
