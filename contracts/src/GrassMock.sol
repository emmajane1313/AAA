// SPDX-License-Identifier: UNLICENSE

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract GrassMock is ERC20 {
    constructor() ERC20("Grass Mock", "GM") {
        _mint(msg.sender, 10000 ether);
    }
}
