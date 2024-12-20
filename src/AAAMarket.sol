// SPDX-License-Identifier: UNLICENSE
pragma solidity ^0.8.28;

import "./AAALibrary.sol";
import "./AAANFT.sol";
import "./AAAAccessControls.sol";
import "./AAACollectionManager.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract AAAMarket {
    AAANFT public nft;
    AAACollectionManager public collectionManager;
    AAAAccessControls public accessControls;

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
        address _accessControls
    ) {
        nft = AAANFT(_nft);
        collectionManager = AAACollectionManager(_collectionManager);
        accessControls = AAAAccessControls(_accessControls);
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
        if (
            !IERC20(paymentToken).transferFrom(
                msg.sender,
                collectionManager.getCollectionArtist(collectionId),
                _totalPrice
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
}
