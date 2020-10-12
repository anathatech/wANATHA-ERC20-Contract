// SPDX-License-Identifier: MIT
pragma solidity ^0.6.2;

import "./ERC20MinterPauser.sol";

contract UpgradableCoin is ERC20MinterPauser {
    function initialize(address multisig) public initializer {
        ERC20MinterPauser.initialize("Wrapped ANATHA", "wANATHA");

        uint8 decimals = 18;

        _setupDecimals(decimals);

        uint256 _initialSupply = 300000000 * 10 ** uint256(decimals); // 300M

        _mint(multisig, _initialSupply);
    }
}