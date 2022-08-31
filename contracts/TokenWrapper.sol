// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.8.16;

import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

contract TokenWrapper {
    address public immutable token;

    constructor(address _token) {
        token = _token;
    }

    function decimals() external view returns (uint8) {
        return IERC20Metadata(token).decimals();
    }

}
