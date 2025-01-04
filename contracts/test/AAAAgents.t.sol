// SPDX-License-Identifier: UNLICENSE
pragma solidity 0.8.24;

import "forge-std/Test.sol";
import "src/AAAAgents.sol";
import "src/AAAErrors.sol";
import "src/AAALibrary.sol";
import "src/AAAAccessControls.sol";
import "src/AAADevTreasury.sol";
import "src/AAACollectionManager.sol";
import "src/AAANFT.sol";
import "src/AAAMarket.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockERC20 is ERC20 {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

struct BuyersInput {
    uint256 agent1Coll1Bonus;
    uint256 agent1Coll2Bonus;
    uint256 agent2Coll2Bonus;
    uint256 buyerBalance1;
    uint256 buyerBalance2;
}

struct BonusInput {
    uint256 ownerBalanceAgent1;
    uint256 ownerBalanceAgent2;
    uint256 treasuryBalance;
}

contract AAAAgentsTest is Test {
    AAAAgents private agents;
    AAAAccessControls private accessControls;
    AAACollectionManager private collectionManager;
    AAADevTreasury private devTreasury;
    AAAMarket private market;
    AAANFT private nft;
    string private metadata = "Agent Metadata";
    address private agentWallet = address(0x789);
    string private metadata2 = "Agent Metadata1";
    address private agentWallet2 = address(0x78219);
    address private admin = address(0x123);
    address private artist = address(0x456);
    address private recharger = address(0x78932);
    address private recharger2 = address(0x78988);
    address private agentOwner = address(0x131);
    address private agentOwner2 = address(0x135);
    address private buyer = address(0x132);
    address private buyer2 = address(0x1323);

    MockERC20 private token1;
    MockERC20 private token2;

    function setUp() public {
        accessControls = new AAAAccessControls();
        devTreasury = new AAADevTreasury(payable(address(accessControls)));
        nft = new AAANFT(
            "Triple A NFT",
            "AAANFT",
            payable(address(accessControls))
        );
        collectionManager = new AAACollectionManager(
            payable(address(accessControls))
        );
        agents = new AAAAgents(
            payable(address(accessControls)),
            address(devTreasury),
            address(collectionManager)
        );
        market = new AAAMarket(
            address(nft),
            address(collectionManager),
            payable(address(accessControls)),
            address(agents)
        );

        token1 = new MockERC20("Token1", "TK1");
        token2 = new MockERC20("Token2", "TK2");

        accessControls.addAdmin(admin);
        vm.startPrank(admin);
        nft.setMarket(address(market));
        market.setDevTreasury(address(devTreasury));
        agents.setMarket(address(market));
        accessControls.setAgentsContract(address(agents));
        collectionManager.setMarket(address(market));
        accessControls.setAcceptedToken(address(token1));
        accessControls.setTokenThresholdAndRent(
            address(token1),
            100000000,
            1000000000
        );
        accessControls.setAcceptedToken(address(token2));
        accessControls.setTokenThresholdAndRent(
            address(token2),
            100000000,
            100000000
        );
        devTreasury.setMarket(address(market));
        devTreasury.setAgents(address(agents));
        vm.stopPrank();
    }

    function testCreateAgent() public {
        vm.startPrank(agentOwner);

        address[] memory wallets = new address[](1);
        wallets[0] = agentWallet;
        agents.createAgent(wallets, metadata);
        uint256 agentId = agents.getAgentCounter();
        assertEq(agentId, 1);
        assertEq(agents.getAgentWallets(agentId)[0], agentWallet);
        assertEq(agents.getAgentMetadata(agentId), metadata);

        vm.stopPrank();
    }

    function testEditAgent() public {
        vm.startPrank(agentOwner);

        address[] memory wallets = new address[](1);
        wallets[0] = agentWallet;
        agents.createAgent(wallets, metadata);

        uint256 agentId = agents.getAgentCounter();
        string memory newMetadata = "Updated Metadata";
        address[] memory newWallet = new address[](1);
        newWallet[0] = address(0xDEF);

        agents.editAgent(newWallet, newMetadata, agentId);

        assertEq(agents.getAgentWallets(agentId)[0], newWallet[0]);
        assertEq(agents.getAgentMetadata(agentId), newMetadata);

        vm.stopPrank();
    }

    function testEditAgentRevertIfNotAgentOwner() public {
        vm.startPrank(admin);
        address[] memory wallets = new address[](1);
        wallets[0] = agentWallet;
        agents.createAgent(wallets, metadata);
        uint256 agentId = agents.getAgentCounter();
        vm.stopPrank();

        vm.startPrank(address(0xABC));
        vm.expectRevert(
            abi.encodeWithSelector(AAAErrors.NotAgentOwner.selector)
        );

        address[] memory newWallet = new address[](1);
        newWallet[0] = address(0xDEF);

        agents.editAgent(newWallet, "New Metadata", agentId);
        vm.stopPrank();
    }

    function testDeleteAgent() public {
        vm.startPrank(agentOwner);
        address[] memory wallets = new address[](1);
        wallets[0] = agentWallet;
        agents.createAgent(wallets, metadata);

        uint256 agentId = agents.getAgentCounter();

        agents.deleteAgent(agentId);

        vm.stopPrank();
    }

    function testDeleteAgentRevertIfNotAgentOwner() public {
        vm.startPrank(admin);
        address[] memory wallets = new address[](1);
        wallets[0] = agentWallet;
        agents.createAgent(wallets, metadata);
        uint256 agentId = agents.getAgentCounter();
        vm.stopPrank();

        vm.startPrank(address(0xABC));
        vm.expectRevert(
            abi.encodeWithSelector(AAAErrors.NotAgentOwner.selector)
        );
        agents.deleteAgent(agentId);
        vm.stopPrank();
    }

    function testAgentCounterIncrements() public {
        vm.startPrank(admin);

        address[] memory wallets = new address[](1);
        wallets[0] = agentWallet;
        agents.createAgent(wallets, metadata);
        uint256 firstAgentId = agents.getAgentCounter();

        address[] memory newWallet = new address[](1);
        newWallet[0] = address(0xDEF);

        agents.createAgent(newWallet, "Another Metadata");
        uint256 secondAgentId = agents.getAgentCounter();

        assertEq(firstAgentId, 1);
        assertEq(secondAgentId, 2);

        vm.stopPrank();
    }

    function testRechargeAgentActiveBalanceWithoutSale() public {
        vm.startPrank(agentOwner);

        address[] memory wallets = new address[](1);
        wallets[0] = agentWallet;
        agents.createAgent(wallets, metadata);
        vm.stopPrank();

        vm.startPrank(artist);
        AAALibrary.CollectionInput memory inputs_1 = AAALibrary
            .CollectionInput({
                tokens: new address[](1),
                prices: new uint256[](1),
                agentIds: new uint256[](1),
                dailyFrequency: new uint256[](1),
                customInstructions: new string[](1),
                metadata: "Metadata 1",
                amount: 5
            });

        inputs_1.tokens[0] = address(token1);
        inputs_1.prices[0] = 10 ether;
        inputs_1.agentIds[0] = 1;
        inputs_1.customInstructions[0] = "custom";
        inputs_1.dailyFrequency[0] = 1;
        collectionManager.create(inputs_1, "some drop uri", 0);
        vm.stopPrank();

        vm.startPrank(admin);
        token1.mint(recharger, 100 ether);
        vm.stopPrank();

        vm.startPrank(recharger);
        uint256 rechargerInitialBalance = token1.balanceOf(recharger);
        token1.approve(address(agents), 50 ether);
        token1.allowance(recharger, address(agents));

        agents.rechargeAgentActiveBalance(address(token1), 1, 1, 123400000);
        vm.expectRevert(
            abi.encodeWithSelector(AAAErrors.TokenNotAccepted.selector)
        );
        agents.rechargeAgentActiveBalance(address(token2), 1, 1, 100000000);

        vm.stopPrank();

        uint256 activeBalance = agents.getAgentActiveBalance(
            address(token1),
            1,
            1
        );
        uint256 bonusBalance = agents.getAgentBonusBalance(
            address(token1),
            1,
            1
        );
        assertEq(activeBalance, 123400000);

        assertEq(bonusBalance, 0);
        uint256 rechargerCurrentBalance = token1.balanceOf(recharger);
        assertEq(rechargerCurrentBalance, rechargerInitialBalance - 123400000);
    }

    function testRechargeAgentActiveBalanceWithSale() public {
        vm.startPrank(agentOwner);

        address[] memory wallets = new address[](1);
        wallets[0] = agentWallet;
        agents.createAgent(wallets, metadata);
        vm.stopPrank();

        vm.startPrank(artist);
        AAALibrary.CollectionInput memory inputs_1 = AAALibrary
            .CollectionInput({
                tokens: new address[](1),
                prices: new uint256[](1),
                agentIds: new uint256[](1),
                dailyFrequency: new uint256[](1),
                customInstructions: new string[](1),
                metadata: "Metadata 1",
                amount: 10
            });

        inputs_1.tokens[0] = address(token1);
        inputs_1.prices[0] = 5 ether;
        inputs_1.agentIds[0] = 1;
        inputs_1.customInstructions[0] = "custom";
        inputs_1.dailyFrequency[0] = 1;
        collectionManager.create(inputs_1, "some drop uri", 0);
        vm.stopPrank();

        vm.startPrank(admin);
        token1.mint(recharger, 100 ether);
        token1.mint(buyer, 100 ether);
        vm.stopPrank();

        vm.startPrank(recharger);
        uint256 rechargerInitialBalance = token1.balanceOf(recharger);
        token1.approve(address(agents), 50 ether);
        token1.allowance(recharger, address(agents));

        agents.rechargeAgentActiveBalance(address(token1), 1, 1, 123400000);
        vm.expectRevert(
            abi.encodeWithSelector(AAAErrors.TokenNotAccepted.selector)
        );
        agents.rechargeAgentActiveBalance(address(token2), 1, 1, 100000000);

        vm.stopPrank();

        uint256 activeBalance = agents.getAgentActiveBalance(
            address(token1),
            1,
            1
        );
        uint256 bonusBalance = agents.getAgentBonusBalance(
            address(token1),
            1,
            1
        );
        assertEq(activeBalance, 123400000);

        assertEq(bonusBalance, 0);
        uint256 rechargerCurrentBalance = token1.balanceOf(recharger);
        assertEq(rechargerCurrentBalance, rechargerInitialBalance - 123400000);

        uint256 buyerInitialBalance = token1.balanceOf(buyer);
        uint256 artistInitialBalance = token1.balanceOf(artist);

        vm.startPrank(buyer);
        token1.approve(address(market), 50 ether);
        token1.approve(address(devTreasury), 50 ether);
        token1.allowance(buyer, address(market));
        token1.allowance(buyer, address(devTreasury));
        market.buy(1, 2, address(token1));
        uint256 buyerExpectedBalance = buyerInitialBalance - (10 ether);
        uint256 artistExpectedBalance = artistInitialBalance + (10 ether);
        vm.stopPrank();

        assertEq(buyerExpectedBalance, token1.balanceOf(buyer));
        assertEq(artistExpectedBalance, token1.balanceOf(artist));

        vm.startPrank(buyer);
        market.buy(1, 1, address(token1));
        vm.stopPrank();

        uint256 rent = accessControls.getTokenDailyRent(address(token1));
        uint256 activeBalance_after = agents.getAgentActiveBalance(
            address(token1),
            1,
            1
        );
        uint256 bonusBalance_after = agents.getAgentBonusBalance(
            address(token1),
            1,
            1
        );
        assertEq(activeBalance_after, 123400000 + rent);
        assertEq(bonusBalance_after, ((10 / 100) * 5 ether) - rent);
    }

    function testPayRentWithoutBonus() public {
        vm.startPrank(agentOwner);

        address[] memory wallets = new address[](1);
        wallets[0] = agentWallet;
        agents.createAgent(wallets, metadata);
        vm.stopPrank();

        vm.startPrank(artist);
        AAALibrary.CollectionInput memory inputs_1 = AAALibrary
            .CollectionInput({
                tokens: new address[](1),
                prices: new uint256[](1),
                agentIds: new uint256[](1),
                dailyFrequency: new uint256[](1),
                customInstructions: new string[](1),
                metadata: "Metadata 1",
                amount: 5
            });

        inputs_1.tokens[0] = address(token1);
        inputs_1.prices[0] = 10 ether;
        inputs_1.agentIds[0] = 1;
        inputs_1.customInstructions[0] = "custom";
        inputs_1.dailyFrequency[0] = 1;
        collectionManager.create(inputs_1, "some drop uri", 0);
        vm.stopPrank();

        vm.startPrank(admin);
        token1.mint(recharger, 100 ether);
        vm.stopPrank();

        vm.startPrank(recharger);
        token1.approve(address(agents), 50 ether);
        token1.allowance(recharger, address(agents));

        agents.rechargeAgentActiveBalance(address(token1), 1, 1, 3000000000);
        vm.stopPrank();

        address[] memory tokens = new address[](1);
        tokens[0] = address(token1);
        uint256[] memory collectionIds = new uint256[](1);
        collectionIds[0] = 1;

        vm.startPrank(agentWallet);
        agents.payRent(tokens, collectionIds, 1);
        vm.stopPrank();

        uint256 rent = accessControls.getTokenDailyRent(address(token1));

        uint256 allBalance = devTreasury.getAllTimeBalanceByToken(
            address(token1)
        );
        uint256 oneBalance = devTreasury.getBalanceByToken(address(token1));
        uint256 allServices = devTreasury.getAllTimeServices(address(token1));
        uint256 oneServices = devTreasury.getServicesPaidByToken(
            address(token1)
        );

        assertEq(allBalance, 3000000000);
        assertEq(oneBalance, 3000000000);
        assertEq(allServices, rent);
        assertEq(oneServices, rent);

        vm.startPrank(agentWallet);
        agents.payRent(tokens, collectionIds, 1);
        agents.payRent(tokens, collectionIds, 1);

        uint256 allBalance_after3 = devTreasury.getAllTimeBalanceByToken(
            address(token1)
        );
        uint256 oneBalance_after3 = devTreasury.getBalanceByToken(
            address(token1)
        );
        uint256 allServices_after3 = devTreasury.getAllTimeServices(
            address(token1)
        );
        uint256 oneServices_after3 = devTreasury.getServicesPaidByToken(
            address(token1)
        );

        assertEq(allBalance_after3, 3000000000);
        assertEq(oneBalance_after3, 3000000000);
        assertEq(allServices_after3, rent * 3);
        assertEq(oneServices_after3, rent * 3);

        vm.expectRevert(
            abi.encodeWithSelector(AAAErrors.InsufficientBalance.selector)
        );
        agents.payRent(tokens, collectionIds, 1);
        vm.stopPrank();
    }

    function testPayRentWithBonus() public {
        vm.startPrank(agentOwner);

        address[] memory wallets = new address[](1);
        wallets[0] = agentWallet;
        agents.createAgent(wallets, metadata);
        vm.stopPrank();

        vm.startPrank(artist);
        AAALibrary.CollectionInput memory inputs_1 = AAALibrary
            .CollectionInput({
                tokens: new address[](1),
                prices: new uint256[](1),
                agentIds: new uint256[](1),
                dailyFrequency: new uint256[](1),
                customInstructions: new string[](1),
                metadata: "Metadata 1",
                amount: 10
            });

        inputs_1.tokens[0] = address(token1);
        inputs_1.prices[0] = 5 ether;
        inputs_1.agentIds[0] = 1;
        inputs_1.customInstructions[0] = "custom";
        inputs_1.dailyFrequency[0] = 1;
        collectionManager.create(inputs_1, "some drop uri", 0);
        vm.stopPrank();

        vm.startPrank(admin);
        token1.mint(recharger, 100 ether);
        token1.mint(buyer, 100 ether);
        vm.stopPrank();

        vm.startPrank(recharger);
        token1.approve(address(agents), 50 ether);
        token1.allowance(recharger, address(agents));

        agents.rechargeAgentActiveBalance(address(token1), 1, 1, 3000000000);
        vm.expectRevert(
            abi.encodeWithSelector(AAAErrors.TokenNotAccepted.selector)
        );
        agents.rechargeAgentActiveBalance(address(token2), 1, 1, 3000000000);
        vm.stopPrank();

        vm.startPrank(buyer);
        token1.approve(address(market), 50 ether);
        token1.approve(address(devTreasury), 50 ether);
        token1.allowance(buyer, address(market));
        token1.allowance(buyer, address(devTreasury));
        market.buy(1, 2, address(token1));
        market.buy(1, 1, address(token1));
        vm.stopPrank();

        address[] memory tokens = new address[](1);
        tokens[0] = address(token1);
        uint256[] memory collectionIds = new uint256[](1);
        collectionIds[0] = 1;

        vm.startPrank(agentWallet);
        agents.payRent(tokens, collectionIds, 1);
        vm.stopPrank();

        uint256 rent = accessControls.getTokenDailyRent(address(token1));

        uint256 allBalance = devTreasury.getAllTimeBalanceByToken(
            address(token1)
        );
        uint256 oneBalance = devTreasury.getBalanceByToken(address(token1));
        uint256 allServices = devTreasury.getAllTimeServices(address(token1));
        uint256 oneServices = devTreasury.getServicesPaidByToken(
            address(token1)
        );

        assertEq(allBalance, ((10 / 100) * 5 ether) + 3000000000);
        assertEq(oneBalance, ((10 / 100) * 5 ether) + 3000000000);
        assertEq(allServices, rent);
        assertEq(oneServices, rent);

        vm.startPrank(agentWallet);
        agents.payRent(tokens, collectionIds, 1);
        agents.payRent(tokens, collectionIds, 1);

        uint256 allBalance_after3 = devTreasury.getAllTimeBalanceByToken(
            address(token1)
        );
        uint256 oneBalance_after3 = devTreasury.getBalanceByToken(
            address(token1)
        );
        uint256 allServices_after3 = devTreasury.getAllTimeServices(
            address(token1)
        );
        uint256 oneServices_after3 = devTreasury.getServicesPaidByToken(
            address(token1)
        );

        assertEq(allBalance_after3, ((10 / 100) * 5 ether) + 3000000000);
        assertEq(oneBalance_after3, ((10 / 100) * 5 ether) + 3000000000);
        assertEq(allServices_after3, rent * 3);
        assertEq(oneServices_after3, rent * 3);

        vm.stopPrank();
    }

    function _collectionOne() internal {
        vm.startPrank(agentOwner);

        address[] memory wallets = new address[](1);
        wallets[0] = agentWallet;
        agents.createAgent(wallets, metadata);
        vm.stopPrank();

        vm.startPrank(artist);
        AAALibrary.CollectionInput memory inputs_1 = AAALibrary
            .CollectionInput({
                tokens: new address[](1),
                prices: new uint256[](1),
                agentIds: new uint256[](1),
                dailyFrequency: new uint256[](1),
                customInstructions: new string[](1),
                metadata: "Metadata 1",
                amount: 10
            });

        inputs_1.tokens[0] = address(token1);
        inputs_1.prices[0] = 5 ether;
        inputs_1.agentIds[0] = 1;
        inputs_1.customInstructions[0] = "custom";
        inputs_1.dailyFrequency[0] = 1;
        collectionManager.create(inputs_1, "some drop uri", 0);
        vm.stopPrank();

        vm.startPrank(admin);
        token1.mint(recharger, 100 ether);
        token1.mint(buyer, 100 ether);
        vm.stopPrank();

        vm.startPrank(recharger);
        token1.approve(address(agents), 50 ether);
        token1.allowance(recharger, address(agents));

        agents.rechargeAgentActiveBalance(address(token1), 1, 1, 3000000000);
        vm.stopPrank();

        vm.startPrank(buyer);
        token1.approve(address(market), 50 ether);
        token1.approve(address(devTreasury), 50 ether);
        token1.allowance(buyer, address(market));
        token1.allowance(buyer, address(devTreasury));
        market.buy(1, 2, address(token1));
        market.buy(1, 1, address(token1));
        vm.stopPrank();
    }

    function _collectionTwo() internal {
        vm.startPrank(agentOwner2);

        address[] memory wallets_2 = new address[](1);
        wallets_2[0] = agentWallet2;
        agents.createAgent(wallets_2, metadata2);
        vm.stopPrank();

        vm.startPrank(artist);
        AAALibrary.CollectionInput memory inputs_2 = AAALibrary
            .CollectionInput({
                tokens: new address[](1),
                prices: new uint256[](1),
                agentIds: new uint256[](2),
                dailyFrequency: new uint256[](2),
                customInstructions: new string[](2),
                metadata: "Metadata 2",
                amount: 10
            });

        inputs_2.tokens[0] = address(token1);
        inputs_2.prices[0] = 5 ether;
        inputs_2.agentIds[0] = 1;
        inputs_2.agentIds[1] = 2;
        inputs_2.customInstructions[0] = "custom1";
        inputs_2.customInstructions[1] = "custom2";
        inputs_2.dailyFrequency[0] = 1;
        inputs_2.dailyFrequency[1] = 2;
        collectionManager.create(inputs_2, "some drop uri2", 0);
        vm.stopPrank();

        vm.startPrank(admin);
        token1.mint(recharger2, 100 ether);
        token1.mint(buyer2, 100 ether);
        vm.stopPrank();

        vm.startPrank(recharger2);
        token1.approve(address(agents), 50 ether);
        token1.allowance(recharger2, address(agents));
        agents.rechargeAgentActiveBalance(address(token1), 1, 2, 3000000000);
        agents.rechargeAgentActiveBalance(address(token1), 2, 2, 3000000000);
        vm.stopPrank();

        vm.startPrank(buyer2);
        token1.approve(address(market), 50 ether);
        token1.approve(address(devTreasury), 50 ether);
        token1.allowance(buyer2, address(market));
        token1.allowance(buyer2, address(devTreasury));
        market.buy(2, 2, address(token1));
        market.buy(2, 1, address(token1));
        vm.stopPrank();
    }

    function testPayRentWithMultipleCollections()
        public
        returns (uint256, uint256)
    {
        _collectionOne();
        _collectionTwo();

        // pay rent

        address[] memory tokens = new address[](2);
        tokens[0] = address(token1);
        tokens[1] = address(token1);
        uint256[] memory collectionIds = new uint256[](2);
        collectionIds[0] = 1;
        collectionIds[1] = 2;

        uint256 buyerBalance1 = token1.balanceOf(address(buyer));
        uint256 buyerBalance2 = token1.balanceOf(address(buyer2));

        vm.startPrank(agentWallet);
        agents.payRent(tokens, collectionIds, 1);
        vm.stopPrank();

        address[] memory tokens_2 = new address[](1);
        tokens_2[0] = address(token1);
        uint256[] memory collectionIds_2 = new uint256[](1);
        collectionIds_2[0] = 2;

        vm.startPrank(agentWallet2);
        agents.payRent(tokens_2, collectionIds_2, 2);
        vm.stopPrank();

        uint256 rent = accessControls.getTokenDailyRent(address(token1));

        uint256 allBalance = devTreasury.getAllTimeBalanceByToken(
            address(token1)
        );
        uint256 oneBalance = devTreasury.getBalanceByToken(address(token1));
        uint256 allServices = devTreasury.getAllTimeServices(address(token1));
        uint256 oneServices = devTreasury.getServicesPaidByToken(
            address(token1)
        );

        // Two purchases for 10% + 10% of 5 ether
        // Recharged with 3000000000 3 times

        assertEq(allBalance, ((20 / 100) * 5 ether) + 9000000000);
        assertEq(oneBalance, ((20 / 100) * 5 ether) + 9000000000);
        assertEq(allServices, rent * 3);
        assertEq(oneServices, rent * 3);

        return (buyerBalance1, buyerBalance2);
    }

    function testCollectorsAndOwnerBonusPaid() public {
        uint256 ownerBalanceAgent1 = token1.balanceOf(address(agentOwner));
        uint256 ownerBalanceAgent2 = token1.balanceOf(address(agentOwner2));
        uint256 treasuryBalance = devTreasury.getTreasuryByToken(
            address(token1)
        );
        (
            uint256 buyerBalance1,
            uint256 buyerBalance2
        ) = testPayRentWithMultipleCollections();

        (
            uint256 agent1Coll1Bonus,
            uint256 agent1Coll2Bonus,
            uint256 agent2Coll2Bonus
        ) = _bonusesCalc(
                BonusInput({
                    ownerBalanceAgent1: ownerBalanceAgent1,
                    ownerBalanceAgent2: ownerBalanceAgent2,
                    treasuryBalance: treasuryBalance
                })
            );

        _buyersCalc(
            BuyersInput({
                agent1Coll1Bonus: agent1Coll1Bonus,
                agent1Coll2Bonus: agent1Coll2Bonus,
                agent2Coll2Bonus: agent2Coll2Bonus,
                buyerBalance1: buyerBalance1,
                buyerBalance2: buyerBalance2
            })
        );
    }

    function _buyersCalc(BuyersInput memory _buyersInput) internal view {
        // buyer1 buys 3 of collection 1 (1 agent)
        // buyer2 buys 3 of collection 2 (2 agents)
        uint256 buyerBalance1_after = token1.balanceOf(address(buyer));
        uint256 buyerBalance2_after = token1.balanceOf(address(buyer2));

        assertEq(
            buyerBalance1_after,
            _buyersInput.buyerBalance1 +
                ((_buyersInput.agent1Coll1Bonus * 30) / 100)
        );
        assertEq(
            buyerBalance2_after,
            _buyersInput.buyerBalance2 +
                ((_buyersInput.agent2Coll2Bonus * 30) / 100) +
                ((_buyersInput.agent1Coll2Bonus * 30) / 100)
        );
    }

    function _bonusesCalc(
        BonusInput memory _bonusInput
    ) internal view returns (uint256, uint256, uint256) {
        uint256 rent = accessControls.getTokenDailyRent(address(token1));
        uint256 agentShare_coll1 = ((10 / 100) * 5 ether); // one agent
        uint256 agentShare_coll2 = ((10 / 100) * 5 ether) / 2; // two agents

        uint256 agent1Coll1Bonus = agentShare_coll1 - rent;
        uint256 agent1Coll2Bonus = agentShare_coll2 - rent;
        uint256 agent2Coll2Bonus = agentShare_coll2 - rent;

        assertEq(
            token1.balanceOf(address(agentOwner)),
            _bonusInput.ownerBalanceAgent1 +
                ((agent1Coll1Bonus * 30) / 100) +
                ((agent1Coll2Bonus * 30) / 100)
        );
        assertEq(
            token1.balanceOf(address(agentOwner2)),
            _bonusInput.ownerBalanceAgent2 + ((agent2Coll2Bonus * 30) / 100)
        );

        assertEq(
            devTreasury.getTreasuryByToken(address(token1)),
            _bonusInput.treasuryBalance +
                ((agent1Coll1Bonus * 40) / 100) +
                ((agent1Coll2Bonus * 40) / 100) +
                ((agent2Coll2Bonus * 40) / 100)
        );

        return (agent1Coll1Bonus, agent1Coll2Bonus, agent2Coll2Bonus);
    }

    function testWithDrawTreasuryAndServices() public {
        testPayRentWithMultipleCollections();
        uint256 allBalance_after = devTreasury.getAllTimeBalanceByToken(
            address(token1)
        );
        uint256 oneBalance_after = devTreasury.getBalanceByToken(
            address(token1)
        );
        uint256 allServices_after = devTreasury.getAllTimeServices(
            address(token1)
        );
        uint256 oneServices_after = devTreasury.getServicesPaidByToken(
            address(token1)
        );
        uint256 treasury_after = devTreasury.getTreasuryByToken(
            address(token1)
        );

        vm.startPrank(admin);
        devTreasury.withdrawFundsTreasury(address(token1), 200000);
        vm.stopPrank();

        assertEq(
            devTreasury.getAllTimeBalanceByToken(address(token1)),
            allBalance_after
        );
        assertEq(
            devTreasury.getBalanceByToken(address(token1)),
            oneBalance_after - 200000
        );
        assertEq(
            devTreasury.getAllTimeServices(address(token1)),
            allServices_after
        );
        assertEq(
            devTreasury.getServicesPaidByToken(address(token1)),
            oneServices_after
        );
        assertEq(
            devTreasury.getTreasuryByToken(address(token1)),
            treasury_after - 200000
        );

        vm.startPrank(admin);
        devTreasury.withdrawFundsServices(address(token1), 400000);
        vm.stopPrank();

        assertEq(
            devTreasury.getAllTimeBalanceByToken(address(token1)),
            allBalance_after
        );
        assertEq(
            devTreasury.getTreasuryByToken(address(token1)),
            treasury_after - 200000
        );

        assertEq(
            devTreasury.getBalanceByToken(address(token1)),
            oneBalance_after - 200000 - 400000
        );
        assertEq(
            devTreasury.getAllTimeServices(address(token1)),
            allServices_after
        );
        assertEq(
            devTreasury.getServicesPaidByToken(address(token1)),
            oneServices_after - 400000
        );
    }
}
