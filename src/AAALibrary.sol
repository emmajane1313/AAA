// SPDX-License-Identifier: UNLICENSE
pragma solidity ^0.8.28;

contract AAALibrary {
    struct Collection {
        address[] erc20Tokens;
        uint256[] prices;
        uint256[] agentIds;
        uint256[] tokenIds;
        string metadata;
        address artist;
        uint256 id;
        uint256 dropId;
        uint256 amount;
        uint256 amountSold;
    }

    struct Drop {
        uint256[] collectionIds;
        address artist;
        uint256 id;
    }

    struct CollectionInput {
        address[] tokens;
        uint256[] prices;
        uint256[] agentIds;
        string metadata;
        uint256 amount;
    }
}
