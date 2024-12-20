// SPDX-License-Identifier: UNLICENSE
pragma solidity ^0.8.28;

import "./AAALibrary.sol";
import "./AAANFT.sol";
import "./AAAAccessControls.sol";
import "./AAACollectionManager.sol";
import "./AAAAgents.sol";
import "./AAADevTreasury.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract AAAMarket {
    AAANFT public nft;
    AAACollectionManager public collectionManager;
    AAAAccessControls public accessControls;
    AAAAgents public agents;
    AAADevTreasury public devTreasury;

    event CollectionPurchased(
        uint256 indexed collectionId,
        address indexed buyer,
        uint256 amount,
        address paymentToken
    );

    modifier onlyAdmin() {
        if (!accessControls.isAdmin(msg.sender)) {
            revert AAAErrors.NotAdmin();
        }
        _;
    }

    constructor(
        address _nft,
        address _collectionManager,
        address _accessControls,
        address _agents
    ) {
        nft = AAANFT(_nft);
        collectionManager = AAACollectionManager(_collectionManager);
        accessControls = AAAAccessControls(_accessControls);
        agents = AAAAgents(_agents);
    }

    function buy(
        uint256 collectionId,
        uint256 amount,
        address paymentToken
    ) external {
        uint256 _amount = collectionManager.getCollectionAmount(collectionId);
        if (
            amount + collectionManager.getCollectionAmountSold(collectionId) >
            _amount
        ) {
            revert AAAErrors.NotAvailable();
        }

        bool _isTokenAccepted = false;
        uint256 _tokenPrice;
        address[] memory _erc20Tokens = collectionManager
            .getCollectionERC20Tokens(collectionId);
        uint256[] memory _prices = collectionManager.getCollectionPrices(
            collectionId
        );
        for (uint256 i = 0; i < _erc20Tokens.length; i++) {
            if (_erc20Tokens[i] == paymentToken) {
                _isTokenAccepted = true;
                _tokenPrice = _prices[i];
                break;
            }
        }

        if (!_isTokenAccepted) {
            revert AAAErrors.TokenNotAccepted();
        }

        uint256 _totalPrice = _tokenPrice * amount;
        uint256 _artistShare = _totalPrice;
        uint256 _perAgentShare = 0;
        uint256 _agentShare = 0;
        if (
            collectionManager.getCollectionAmountSold(collectionId) > 1 &&
            collectionManager.getCollectionPrices(collectionId)[0] >
            accessControls.getTokenThreshold(paymentToken)
        ) {
            _agentShare = (_totalPrice * 10) / 100;
            _perAgentShare =
                _agentShare /
                collectionManager.getCollectionAgentIds(collectionId).length;
            _artistShare = _totalPrice - _agentShare;
        }

        devTreasury.receiveFunds(msg.sender, paymentToken, _agentShare);

        for (
            uint256 i = 0;
            i < collectionManager.getCollectionAgentIds(collectionId).length;
            i++
        ) {
            uint256 _agentId = collectionManager.getCollectionAgentIds(
                collectionId
            )[i];

            agents.addBalance(
                paymentToken,
                _agentId,
                _perAgentShare,
                collectionId
            );
        }

        if (
            !IERC20(paymentToken).transferFrom(
                msg.sender,
                collectionManager.getCollectionArtist(collectionId),
                _artistShare
            )
        ) {
            revert AAAErrors.PaymentFailed();
        }

        uint256[] memory _mintedTokenIds = nft.mint(
            amount,
            msg.sender,
            collectionManager.getCollectionMetadata(collectionId)
        );

        collectionManager.updateData(_mintedTokenIds, collectionId, amount);

        emit CollectionPurchased(
            collectionId,
            msg.sender,
            amount,
            paymentToken
        );
    }

    function setCollectionManager(
        address _collectionManager
    ) external onlyAdmin {
        collectionManager = AAACollectionManager(_collectionManager);
    }

    function setNFT(address _nft) external onlyAdmin {
        nft = AAANFT(_nft);
    }

    function setAccessControls(address _accessControls) external onlyAdmin {
        accessControls = AAAAccessControls(_accessControls);
    }

    function setAgents(address _agents) external onlyAdmin {
        agents = AAAAgents(_agents);
    }

    function setDevTreasury(address _devTreasury) external onlyAdmin {
        devTreasury = AAADevTreasury(_devTreasury);
    }
}
