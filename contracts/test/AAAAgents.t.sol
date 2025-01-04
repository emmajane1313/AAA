// SPDX-License-Identifier: UNLICENSE
pragma solidity 0.8.24;

import "forge-std/Test.sol";
import "src/AAAAgents.sol";
import "src/AAAErrors.sol";
import "src/AAALibrary.sol";
import "src/AAAAccessControls.sol";
import "src/AAADevTreasury.sol";
import "src/AAACollectionManager.sol";

contract AAAAgentsTest is Test {
    AAAAgents private agents;
    AAAAccessControls private accessControls;
    AAACollectionManager private collectionManager;
    AAADevTreasury private devTreasury;
    address private admin = address(0x123);
    address private market = address(0x456);
    address private agentWallet = address(0x789);
    string private metadata = "Agent Metadata";

    function setUp() public {
        accessControls = new AAAAccessControls();
        devTreasury = new AAADevTreasury(payable(address(accessControls)));
        agents = new AAAAgents(
            payable(address(accessControls)),
            address(devTreasury),
            address(collectionManager)
        );

        accessControls.addAdmin(admin);
        vm.startPrank(admin);
        agents.setMarket(address(market));
        accessControls.setAgentsContract(address(agents));
        vm.stopPrank();
    }

    function testCreateAgent() public {
        vm.startPrank(admin);

        address[] memory wallets = new address[](1);
        wallets[0] = agentWallet;
        agents.createAgent(wallets, metadata);
        uint256 agentId = agents.getAgentCounter();
        assertEq(agentId, 1);
        assertEq(agents.getAgentWallets(agentId)[0], agentWallet);
        assertEq(agents.getAgentMetadata(agentId), metadata);

        vm.stopPrank();
    }

    function testCreateAgentRevertIfNotAdmin() public {
        vm.startPrank(address(0xABC));
        vm.expectRevert(abi.encodeWithSelector(AAAErrors.NotAdmin.selector));
        address[] memory wallets = new address[](1);
        wallets[0] = agentWallet;
        agents.createAgent(wallets, metadata);
        vm.stopPrank();
    }

    function testEditAgent() public {
        vm.startPrank(admin);

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

    function testEditAgentRevertIfNotAdmin() public {
        vm.startPrank(admin);
        address[] memory wallets = new address[](1);
        wallets[0] = agentWallet;
        agents.createAgent(wallets, metadata);
        uint256 agentId = agents.getAgentCounter();
        vm.stopPrank();

        vm.startPrank(address(0xABC));
        vm.expectRevert(abi.encodeWithSelector(AAAErrors.NotAdmin.selector));

        address[] memory newWallet = new address[](1);
        newWallet[0] = address(0xDEF);

        agents.editAgent(newWallet, "New Metadata", agentId);
        vm.stopPrank();
    }

    function testDeleteAgent() public {
        vm.startPrank(admin);
        address[] memory wallets = new address[](1);
        wallets[0] = agentWallet;
        agents.createAgent(wallets, metadata);

        uint256 agentId = agents.getAgentCounter();

        agents.deleteAgent(agentId);

        address agentWalletAfterDeletion = agents.getAgentWallets(agentId)[0];
        assertEq(agentWalletAfterDeletion, address(0));

        vm.stopPrank();
    }

    function testDeleteAgentRevertIfNotAdmin() public {
        vm.startPrank(admin);
        address[] memory wallets = new address[](1);
        wallets[0] = agentWallet;
        agents.createAgent(wallets, metadata);
        uint256 agentId = agents.getAgentCounter();
        vm.stopPrank();

        vm.startPrank(address(0xABC));
        vm.expectRevert(abi.encodeWithSelector(AAAErrors.NotAdmin.selector));
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
}
