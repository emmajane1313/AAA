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
    uint256 private _orderCounter;
    AAANFT public nft;
    AAACollectionManager public collectionManager;
    AAAAccessControls public accessControls;
    AAAAgents public agents;
    AAADevTreasury public devTreasury;

    mapping(address => uint256[]) private _buyerToOrderIds;
    mapping(uint256 => AAALibrary.Order) private _orders;

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

        uint256 _tokenPrice = _checkTokens(paymentToken, collectionId);

        uint256 _totalPrice = _tokenPrice * amount;
        uint256 _artistShare = _totalPrice;
        uint256 _perAgentShare = 0;
        uint256 _agentShare = 0;

        if (
            collectionManager.getCollectionAmountSold(collectionId) >= 1 &&
            collectionManager.getCollectionPrices(collectionId)[0] >
            accessControls.getTokenThreshold(paymentToken) &&
            collectionManager.getCollectionAgentIds(collectionId).length > 0
        ) {
            _agentShare = (_totalPrice * 10) / 100;

            _perAgentShare =
                _agentShare /
                collectionManager.getCollectionAgentIds(collectionId).length;
            _artistShare = _totalPrice - _agentShare;
        }

        if (IERC20(paymentToken).balanceOf(msg.sender) < amount) {
            revert AAAErrors.InsufficientBalance();
        }

        if (
            !IERC20(paymentToken).transferFrom(
                msg.sender,
                address(devTreasury),
                amount
            )
        ) {
            revert AAAErrors.PaymentFailed();
        }

        devTreasury.receiveFunds(msg.sender, paymentToken, _agentShare);
        if (_agentShare > 0) {
            for (
                uint256 i = 0;
                i <
                collectionManager.getCollectionAgentIds(collectionId).length;
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

        _createOrder(
            _mintedTokenIds,
            paymentToken,
            collectionId,
            amount,
            _totalPrice
        );
        emit CollectionPurchased(
            collectionId,
            msg.sender,
            amount,
            paymentToken
        );
    }

    function _createOrder(
        uint256[] memory mintedTokens,
        address token,
        uint256 collectionId,
        uint256 amount,
        uint256 totalPrice
    ) internal {
        _orderCounter++;
        _buyerToOrderIds[msg.sender].push(_orderCounter);
        _orders[_orderCounter] = AAALibrary.Order({
            id: _orderCounter,
            amount: amount,
            token: token,
            totalPrice: totalPrice,
            collectionId: collectionId,
            mintedTokens: mintedTokens
        });
    }

    function _checkTokens(
        address token,
        uint256 collectionId
    ) internal view returns (uint256) {
        bool _isTokenAccepted = false;
        uint256 _tokenPrice;
        address[] memory _erc20Tokens = collectionManager
            .getCollectionERC20Tokens(collectionId);
        uint256[] memory _prices = collectionManager.getCollectionPrices(
            collectionId
        );
        for (uint256 i = 0; i < _erc20Tokens.length; i++) {
            if (_erc20Tokens[i] == token) {
                _isTokenAccepted = true;
                _tokenPrice = _prices[i];
                break;
            }
        }

        if (!_isTokenAccepted) {
            revert AAAErrors.TokenNotAccepted();
        }

        return _tokenPrice;
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

    function getBuyerToOrderIds(
        address buyer
    ) public view returns (uint256[] memory) {
        return _buyerToOrderIds[buyer];
    }

    function getOrderAmount(uint256 orderId) public view returns (uint256) {
        return _orders[orderId].amount;
    }

    function getOrderToken(uint256 orderId) public view returns (address) {
        return _orders[orderId].token;
    }

    function getOrderCollectionId(
        uint256 orderId
    ) public view returns (uint256) {
        return _orders[orderId].collectionId;
    }

    function getOrderMintedTokens(
        uint256 orderId
    ) public view returns (uint256[] memory) {
        return _orders[orderId].mintedTokens;
    }

    function getOrderCounter() public view returns (uint256) {
        return _orderCounter;
    }
}
