// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.8.16;

import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

contract TokenWrapper {
    IERC20Metadata public immutable token;

    constructor(IERC20Metadata _token) {
        token = _token;
    }

    function decimals() external view returns (uint8) {
        return token.decimals();
    }

}
