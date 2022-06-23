# RUR coin (WRUR)
RUB-collateralized ERC20 stablecoin public smart contract repository.

https://rucoinfoundation.ru

## ABI, Address, and Verification
The contract abi is in WRUR.abi. It is the abi of the implementation contract. Interaction with WRUR is done at the address of the proxy at 0xB25B9841c0a664aAA7455af20320BF8863E93283. See https://etherscan.io/token/0xB25B9841c0a664aAA7455af20320BF8863E93283 for live on-chain details, and the section on bytecode verification below.

The WRUR contract is based upon the PAX Standard smart contract which was audited by three third-party specialists (Nomic Labs, ChainSecurity, and Trail of Bits) in September-October 2018. In January 2019, Trail of Bits performed an additional audit for a potential upgrade to the PAX smart contract.

## Contract Specification
Wrapped RUR (WRUR) is an ERC20 token that is Centrally Minted and Burned by oficial russian company "Russian Coin Foundation", representing the trusted party backing the token with russian rubles (RUB).

## ERC20 Token
The public interface of WRUR is the ERC20 interface specified by EIP-20.
<ul>
 <li>name()</li>
 <li>symbol()</li>
 <li>decimals()</li>
 <li>totalSupply()</li>
 <li>balanceOf(address who)</li>
 <li>transfer(address to, uint256 value)</li>
 <li>approve(address spender, uint256 value)</li>
 <li>allowance(address owner, address spender)</li>
 <li>transferFrom(address from, address to, uint256 value)</li>
</ul>

And the usual events.
<ul>
 <li>event Transfer(address indexed from, address indexed to, uint256 value)</li>
 <li>event Approval(address indexed owner, address indexed spender, uint256 value)</li>
</ul>

Typical interaction with the contract will use transfer to move the token as payment. Additionally, a pattern involving approve and transferFrom can be used to allow another address to move tokens from your address to a third party without the need for the middleperson to custody the tokens, such as in the 0x protocol.

## Warning about ERC20 approve front-running
There is a well known gotcha involving the ERC20 approve method. The problem occurs when the owner decides to change the allowance of a spender that already has an allowance. If the spender sends a transferFrom transaction at a similar time that the owner sends the new approve transaction and the transferFrom by the spender goes through first, then the spender gets to use the original allowance, and also get approved for the intended new allowance.

The recommended mitigation in cases where the owner does not trust the spender is to first set the allowance to zero before setting it to a new amount, checking that the allowance was not spent before sending the new approval transaction. Note, however, that any allowance change is subject to front-running, which is as simple as watching the mempool for certain transactions and then offering a higher gas price to get another transaction mined onto the blockchain more quickly.

## Controlling the token supply
The total supply of WRUR is backed by fiat held in reserve at Russian Coin Foundation. There is a single supplyController address that can mint and burn the token based on the actual movement of cash in and out of the reserve based on requests for the purchase and redemption of WRUR.

The supply control interface includes methods to get the current address of the supply controller, and events to monitor the change in supply of WRUR.
<ul>
 <li>supplyController()</li>
</ul>

## Supply Control Events
<ul>
 <li>SupplyIncreased(address indexed to, uint256 value)</li>
 <li>SupplyDecreased(address indexed from, uint256 value)</li>
 <li>SupplyControllerSet(address indexed oldSupplyController, address indexed newSupplyController)</li>
</ul>

## Pausing the contract
In the event of a critical security threat, Russian Coin Foundation has the ability to pause transfers and approvals of the WRUR token. The ability to pause is controlled by a single owner role, following OpenZeppelin's Ownable. The simple model for pausing transfers following OpenZeppelin's Pausable.

## Asset Protection Role
As required by our regulators, we have introduced a role for asset protection to freeze or seize the assets of a criminal party when required to do so by law, including by court order or other legal process.

The assetProtectionRole can freeze and unfreeze the WRUR balance of any address on chain. It can also wipe the balance of an address after it is frozen to allow the appropriate authorities to seize the backing assets.

Freezing is something that Russian Coin Foundation will not do on its own accord, and as such we expect to happen extremely rarely. The list of frozen addresses is available in isFrozen(address who).

## BetaDelegateTransfer
In order to allow for gas-less transactions we have implemented a variation of EIP-865. The public function betaDelegatedTransfer and betaDelegatedTransferBatch allow an approved party to transfer WRUR on the end user's behalf given a signed message from said user. Because EIP-865 is not finalized, all methods related to delegated transfers are prefixed by Beta. Only approved parties are allowed to transfer WRUR on a user's behalf because of potential attacks associated with signing messages. To mitigate some attacks, EIP-712 is implemented which provides a structured message to be displayed for verification when signing.
```javascript
function betaDelegatedTransfer(
   bytes sig, address to, uint256 value, uint256 fee, uint256 seq, uint256 deadline
) public returns (bool) {
```
## Upgradeability
To facilitate upgradeability on the immutable blockchain we follow a standard two-contract delegation pattern: a proxy contract represents the token, while all calls not involving upgrading the contract are delegated to an implementation contract.

The delegation uses delegatecall, which runs the code of the implementation contract in the context of the proxy storage. This way the implementation pointer can be changed to a different implementation contract while still keeping the same data and WRUR contract address, which are really for the proxy contract.

The proxy used here is AdminUpgradeabilityProxy from ZeppelinOS.

## Upgrade Process
The implementation contract is only used for the logic of the non-admin methods. A new implementation contract can be set by calling upgradeTo() or upgradeToAndCall() on the proxy, where the latter is used for upgrades requiring a new initialization or data migration so that it can all be done in one transaction. You must first deploy a copy of the new implementation contract, which is automatically paused by its constructor to help avoid accidental calls directly to the proxy contract.

## Bytecode verification
The proxy contract and implementation contracts are verified on etherscan at the following links: https://etherscan.io/token/0xB25B9841c0a664aAA7455af20320BF8863E93283 https://etherscan.io/address/0x37774cc9779576BD120acedb5000F61646884c7f

Because the implementation address in the proxy is a private variable, verifying that this is the proxy being used requires reading contract storage directly. This can be done using a mainnet node, such as infura, by pasting the network address in ```truffle-config.js``` and running
```javascript
truffle exec ./getImplementationAddress.js --network mainnet
```