// SPDX-License-Identifier: UNLICENSE
pragma solidity ^0.8.28;

import "./AAALibrary.sol";
import "./AAAErrors.sol";
import "./AAAAccessControls.sol";

contract AAACollectionManager {
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
    event DropDeleted(address artist, uint256 indexed dropId);
    event CollectionDeleted(address artist, uint256 indexed collectionId);

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
            _drops[_dropValue].collectionIds.push(_collectionCounter);
        }

        emit CollectionsCreated(_collectionIds, msg.sender, _dropValue);
    }

    function deleteCollection(uint256 collectionId) external {
        if (_collections[collectionId].artist != msg.sender) {
            revert AAAErrors.NotArtist();
        }

        if (_collections[collectionId].amountSold > 0) {
            revert AAAErrors.CantDeleteSoldCollection();
        }

        uint256 _dropId = _collections[collectionId].dropId;

        uint256[] storage collectionIds = _drops[_dropId].collectionIds;
        for (uint256 i = 0; i < collectionIds.length; i++) {
            if (collectionIds[i] == collectionId) {
                collectionIds[i] = collectionIds[collectionIds.length - 1];
                collectionIds.pop();
                break;
            }
        }

        if (collectionIds.length == 0) {
            address artist = _drops[_dropId].artist;
            uint256[] storage dropIds = _dropIdsByArtist[artist];
            for (uint256 i = 0; i < dropIds.length; i++) {
                if (dropIds[i] == _dropId) {
                    dropIds[i] = dropIds[dropIds.length - 1];
                    dropIds.pop();
                    break;
                }
            }

            delete _drops[_dropId];
        }

        delete _collections[collectionId];

        emit CollectionDeleted(msg.sender, collectionId);
    }

    function deleteDrop(uint256 dropId) external {
        if (_drops[dropId].artist != msg.sender) {
            revert AAAErrors.NotArtist();
        }

        uint256[] storage collectionIds = _drops[dropId].collectionIds;
        for (uint256 i = 0; i < collectionIds.length; i++) {
            uint256 collectionId = collectionIds[i];
            if (_collections[collectionId].amountSold > 0) {
                revert AAAErrors.CantDeleteSoldCollection();
            }
            delete _collections[collectionId];
        }

        delete _drops[dropId];

        uint256[] storage dropIds = _dropIdsByArtist[msg.sender];
        for (uint256 i = 0; i < dropIds.length; i++) {
            if (dropIds[i] == dropId) {
                if (i != dropIds.length - 1) {
                    dropIds[i] = dropIds[dropIds.length - 1];
                }
                dropIds.pop();
                break;
            }
        }
        emit DropDeleted(msg.sender, dropId);
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

    function getDropCollectionIds(
        uint256 dropId
    ) public view returns (uint256[] memory) {
        return _drops[dropId].collectionIds;
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
        return _collections[_collectionId].amountSold;
    }

    function setMarket(address _market) external onlyAdmin {
        market = _market;
    }

    function setAccessControls(address _accessControls) external onlyAdmin {
        accessControls = AAAAccessControls(_accessControls);
    }
}
