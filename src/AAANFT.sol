// SPDX-License-Identifier: UNLICENSE
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./AAAErrors.sol";
import "./AAAAccessControls.sol";

contract AAANFT is ERC721 {
    uint256 private _tokenCounter;
    address public marketplace;
    AAAAccessControls public accessControls;
    mapping(uint256 => string) private _tokenURIs;

    modifier onlyAdmin() {
        if (!accessControls.isAdmin(msg.sender)) {
            revert AAAErrors.NotAdmin();
        }
        _;
    }

    event NFTMinted(
        address indexed to,
        uint256 indexed tokenId,
        string tokenURI
    );

    modifier onlyMarketplace() {
        if (msg.sender != marketplace) {
            revert AAAErrors.OnlyMarketplaceContract();
        }
        _;
    }

    constructor(
        string memory name,
        string memory symbol,
        address _accessControls
    ) ERC721(name, symbol) {
        accessControls = AAAAccessControls(_accessControls);
    }

    function mint(
        uint256 amount,
        address to,
        string memory newTokenURI
    ) external onlyMarketplace returns (uint256[] memory) {
        if (to == address(0)) {
            revert AAAErrors.ZeroAddress();
        }

        if (amount <= 0) {
            revert AAAErrors.InvalidAmount();
        }

        uint256[] memory mintedTokenIds = new uint256[](amount);

        for (uint256 i = 0; i < amount; i++) {
            _tokenCounter++;
            uint256 _newTokenId = _tokenCounter;

            _safeMint(to, _newTokenId);
            _tokenURIs[_newTokenId] = newTokenURI;

            mintedTokenIds[i] = _newTokenId;
            emit NFTMinted(to, _newTokenId, newTokenURI);
        }

        return mintedTokenIds;
    }

    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        return _tokenURIs[tokenId];
    }

    function getTokenCounter() public view returns (uint256) {
        return _tokenCounter;
    }

    function setMarketplace(address _marketplace) external onlyAdmin {
        marketplace = _marketplace;
    }

    function setAccessControls(address _accessControls) external onlyAdmin {
        accessControls = AAAAccessControls(_accessControls);
    }
}

