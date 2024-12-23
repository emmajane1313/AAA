// SPDX-License-Identifier: UNLICENSE
pragma solidity 0.8.24;

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
        string metadata;
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

    struct Agent {
        uint256[] collectionIdsHistory;
        uint256[] activeCollectionIds;
        string metadata;
        address wallet;
        uint256 id;
    }

    struct Order {
        uint256[] mintedTokens;
        uint256 collectionId;
        address token;
        uint256 amount;
        uint256 totalPrice;
        uint256 id;
    }
}
