// SPDX-License-Identifier: UNLICENSE
pragma solidity ^0.8.28;

import "./AAALibrary.sol";
import "./AAAErrors.sol";
import "./AAAAccessControls.sol";

contract AAACollectionManager {
    mapping(uint256 => uint256[]) private _collectionIdsByDropId;
    mapping(address => uint256[]) private _dropIdsByArtist;
    mapping(uint256 => AAALibrary.Collection) private _collections;
    mapping(uint256 => AAALibrary.Drop) private _drops;

    uint256 private _collectionCounter;
    uint256 private _dropCounter;
    address public market;
    AAAAccessControls public accessControls;

    event CollectionsCreated(
        uint256[] collectionIds,
        address artist,
        uint256 indexed dropId
    );
    event DropCreated(address artist, uint256 indexed dropId);

    modifier onlyMarket() {
        if (market != msg.sender) {
            revert AAAErrors.OnlyMarketplaceContract();
        }
        _;
    }

    modifier onlyAdmin() {
        if (!accessControls.isAdmin(msg.sender)) {
            revert AAAErrors.NotAdmin();
        }
        _;
    }

    constructor(address _accessControls) {
        accessControls = AAAAccessControls(_accessControls);
    }

    function create(
        AAALibrary.CollectionInput[] memory collectionInputs,
        uint256 dropId
    ) external {
        uint256[] memory _collectionIds = new uint256[](
            collectionInputs.length
        );
        uint256 _dropValue = dropId;

        if (_dropValue == 0) {
            _dropCounter++;
            _dropValue = _dropCounter;

            _drops[_dropValue] = AAALibrary.Drop({
                id: _dropValue,
                artist: msg.sender,
                collectionIds: new uint256[](0)
            });

            _dropIdsByArtist[msg.sender].push(_dropValue);
            emit DropCreated(msg.sender, _dropValue);
        } else {
            if (_drops[_dropValue].id != _dropValue) {
                revert AAAErrors.DropInvalid();
            }
        }

        for (uint256 i = 0; i < collectionInputs.length; i++) {
            _collectionCounter++;

            _collections[_collectionCounter] = AAALibrary.Collection({
                id: _collectionCounter,
                dropId: _dropValue,
                erc20Tokens: collectionInputs[i].tokens,
                prices: collectionInputs[i].prices,
                agentIds: collectionInputs[i].agentIds,
                metadata: collectionInputs[i].metadata,
                artist: msg.sender,
                amount: collectionInputs[i].amount,
                tokenIds: new uint256[](0),
                amountSold: 0
            });

            _collectionIds[i] = _collectionCounter;
            _collectionIdsByDropId[_dropValue].push(_collectionCounter);
            _drops[_dropValue].collectionIds.push(_collectionCounter);
        }

        emit CollectionsCreated(_collectionIds, msg.sender, _dropValue);
    }

    function updateData(
        uint256[] memory mintedTokenIds,
        uint256 collectionId,
        uint256 amount
    ) external onlyMarket {
        _collections[collectionId].amountSold += amount;
        for (uint256 i = 0; i < mintedTokenIds.length; i++) {
            _collections[collectionId].tokenIds.push(mintedTokenIds[i]);
        }
    }

    function getCollectionCount() public view returns (uint256) {
        return _collectionCounter;
    }

    function getDropCount() public view returns (uint256) {
        return _dropCounter;
    }

    function getCollectionIdsByDropId(
        uint256 dropId
    ) public view returns (uint256[] memory) {
        return _collectionIdsByDropId[dropId];
    }

    function getDropIdsByArtist(
        address artist
    ) public view returns (uint256[] memory) {
        return _dropIdsByArtist[artist];
    }

    function getCollectionERC20Tokens(
        uint256 _collectionId
    ) public view returns (address[] memory) {
        return _collections[_collectionId].erc20Tokens;
    }

    function getCollectionPrices(
        uint256 _collectionId
    ) public view returns (uint256[] memory) {
        return _collections[_collectionId].prices;
    }

    function getCollectionTokenIds(
        uint256 _collectionId
    ) public view returns (uint256[] memory) {
        return _collections[_collectionId].tokenIds;
    }

    function getCollectionAgentIds(
        uint256 _collectionId
    ) public view returns (uint256[] memory) {
        return _collections[_collectionId].agentIds;
    }

    function getCollectionMetadata(
        uint256 _collectionId
    ) public view returns (string memory) {
        return _collections[_collectionId].metadata;
    }

    function getCollectionArtist(
        uint256 _collectionId
    ) public view returns (address) {
        return _collections[_collectionId].artist;
    }

    function getCollectionDropId(
        uint256 _collectionId
    ) public view returns (uint256) {
        return _collections[_collectionId].dropId;
    }

    function getCollectionAmount(
        uint256 _collectionId
    ) public view returns (uint256) {
        return _collections[_collectionId].amount;
    }

    function getCollectionAmountSold(
        uint256 _collectionId
    ) public view returns (uint256) {
        return _collections[_collectionId].amount;
    }

    function setMarket(address _market) external onlyAdmin {
        market = _market;
    }

    function setAccessControls(address _accessControls) external onlyAdmin {
        accessControls = AAAAccessControls(_accessControls);
    }
}

