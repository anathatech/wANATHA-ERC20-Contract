const { deployProxy, admin } = require('@openzeppelin/truffle-upgrades');

const UpgradableCoin = artifacts.require('UpgradableCoin');

const ADMIN_ROLE = '0x0000000000000000000000000000000000000000000000000000000000000000'
const PAUSER_ROLE = '0x65d7a28e3265b37a6474929f336521b332c1681b933f6cb9f3376673440d862a' // keccak256(PAUSER_ROLE)
const MINTER_ROLE = '0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6' // keccak256(MINTER_ROLE)


module.exports = async function (deployer, network, accounts) {

  const MULTISIG_ADDRESS = '' // TODO MODIFY
  //const MULTISIG_ADDRESS = accounts[1]

  const options = {
    deployer: deployer,
    unsafeAllowCustomTypes: true,
    initializer: 'initialize',
  }
  
  const instance = await deployProxy(UpgradableCoin, [MULTISIG_ADDRESS], options)

  // Renounce default roles
  await instance.renounceRole(PAUSER_ROLE, accounts[0])
  await instance.renounceRole(MINTER_ROLE, accounts[0])

  // Grant admin role to multisig
  await instance.grantRole(ADMIN_ROLE, MULTISIG_ADDRESS)

  console.log('Token address:', instance.address)

  // Transfer ownership over the admin proxy to multisig
  await admin.transferProxyAdminOwnership(MULTISIG_ADDRESS, { deployer })

  // Renounce the admin role 
  await instance.renounceRole(ADMIN_ROLE, accounts[0])
}