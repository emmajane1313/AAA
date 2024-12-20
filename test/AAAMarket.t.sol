// SPDX-License-Identifier: UNLICENSE
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import "./../src/AAAMarket.sol";
import "./../src/AAANFT.sol";
import "./../src/AAACollectionManager.sol";
import "./../src/AAAAccessControls.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockERC20 is ERC20 {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract AAAMarketTest is Test {
    AAAMarket private market;
    AAACollectionManager private collectionManager;
    AAAAccessControls private accessControls;
    AAANFT private nft;
    MockERC20 private token1;
    MockERC20 private token2;

    address private admin = address(0x123);
    address private artist = address(0x456);
    address private buyer = address(0x789);

    function setUp() public {
        accessControls = new AAAAccessControls();
        collectionManager = new AAACollectionManager(address(accessControls));
        nft = new AAANFT(
            "Triple A NFT",
            "AAANFT",
            address(this),
            address(accessControls)
        );
        market = new AAAMarket(
            address(nft),
            address(collectionManager),
            address(accessControls)
        );

        token1 = new MockERC20("Token1", "TK1");
        token2 = new MockERC20("Token2", "TK2");

        accessControls.addAdmin(admin);

        vm.startPrank(admin);
        collectionManager.setMarket(address(market));
        nft.setMarketplace(address(market));
        vm.stopPrank();
    }

    function testBuyCollection() public {
        vm.startPrank(artist);
        AAALibrary.CollectionInput[]
            memory inputs = new AAALibrary.CollectionInput[](1);
        inputs[0] = AAALibrary.CollectionInput({
            tokens: new address[](1),
            prices: new uint256[](1),
            agentIds: new uint256[](1),
            metadata: "Metadata 1",
            amount: 5
        });
        inputs[0].tokens[0] = address(token1);
        inputs[0].prices[0] = 10 ether;
        inputs[0].agentIds[0] = 1;

        collectionManager.create(inputs, 0);
        vm.stopPrank();

        token1.mint(buyer, 100 ether);

        uint256 buyerInitialBalance = token1.balanceOf(buyer);
        uint256 artistInitialBalance = token1.balanceOf(artist);

        vm.prank(buyer);
        token1.approve(address(market), 50 ether);

        vm.prank(buyer);
        market.buy(1, 2, address(token1));

        uint256 buyerExpectedBalance = buyerInitialBalance - (10 ether * 2);
        uint256 artistExpectedBalance = artistInitialBalance + (10 ether * 2);

        assertEq(
            token1.balanceOf(buyer),
            buyerExpectedBalance,
            "Incorrect buyer balance after purchase"
        );
        assertEq(
            token1.balanceOf(artist),
            artistExpectedBalance,
            "Incorrect artist balance after purchase"
        );

        uint256 amountSold = collectionManager.getCollectionAmountSold(1);
        assertEq(amountSold, 2);
    }

    function testBuyWithInvalidToken() public {
        vm.startPrank(artist);
        AAALibrary.CollectionInput[]
            memory inputs = new AAALibrary.CollectionInput[](1);
        inputs[0] = AAALibrary.CollectionInput({
            tokens: new address[](1),
            prices: new uint256[](1),
            agentIds: new uint256[](1),
            metadata: "Metadata 2",
            amount: 5
        });
        inputs[0].tokens[0] = address(token1);
        inputs[0].prices[0] = 10 ether;
        inputs[0].agentIds[0] = 1;

        collectionManager.create(inputs, 0);
        vm.stopPrank();

        token2.mint(buyer, 100 ether);
        vm.prank(buyer);
        token2.approve(address(market), 50 ether);

        vm.expectRevert(
            abi.encodeWithSelector(AAAErrors.TokenNotAccepted.selector)
        );
        vm.prank(buyer);
        market.buy(1, 2, address(token2));
    }

    function testSetCollectionManager() public {
        vm.startPrank(admin);
        AAACollectionManager newCollectionManager = new AAACollectionManager(
            address(accessControls)
        );
        market.setCollectionManager(address(newCollectionManager));
        assertEq(
            address(market.collectionManager()),
            address(newCollectionManager)
        );
        vm.stopPrank();
    }

    function testSetNFT() public {
        vm.startPrank(admin);
        AAANFT newNFT = new AAANFT(
            "Triple A NFT",
            "AAANFT",
            address(this),
            address(accessControls)
        );
        market.setNFT(address(newNFT));
        assertEq(address(market.nft()), address(newNFT));
        vm.stopPrank();
    }

    function testSetAccessControls() public {
        vm.startPrank(admin);
        AAAAccessControls newAccessControls = new AAAAccessControls();
        market.setAccessControls(address(newAccessControls));
        assertEq(address(market.accessControls()), address(newAccessControls));
        vm.stopPrank();
    }

    function testOnlyAdminReverts() public {
        vm.prank(artist);
        vm.expectRevert(abi.encodeWithSelector(AAAErrors.NotAdmin.selector));
        market.setCollectionManager(address(collectionManager));
    }
}
