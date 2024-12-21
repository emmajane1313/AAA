// SPDX-License-Identifier: UNLICENSE
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import "src/AAAAgents.sol";
import "src/AAAErrors.sol";
import "src/AAALibrary.sol";
import "src/AAAAccessControls.sol";
import "src/AAADevTreasury.sol";

contract AAAAgentsTest is Test {
    AAAAgents private agents;
    AAAAccessControls private accessControls;
    AAADevTreasury private devTreasury;
    address private admin = address(0x123);
    address private market = address(0x456);
    address private agentWallet = address(0x789);
    string private metadata = "Agent Metadata";

    function setUp() public {
        accessControls = new AAAAccessControls();
        devTreasury = new AAADevTreasury(address(accessControls));
        agents = new AAAAgents(
            address(accessControls),
            address(devTreasury)
        );

        accessControls.addAdmin(admin);
        vm.startPrank(admin);
        agents.setMarket(address(market));
        accessControls.setAgentsContract(address(agents));
        vm.stopPrank();
    }

    function testCreateAgent() public {
        vm.startPrank(admin);

        agents.createAgent(metadata, agentWallet);

        uint256 agentId = agents.getAgentCounter();
        assertEq(agentId, 1);
        assertEq(agents.getAgentWallet(agentId), agentWallet);
        assertEq(agents.getAgentMetadata(agentId), metadata);

        vm.stopPrank();
    }

    function testCreateAgentRevertIfNotAdmin() public {
        vm.startPrank(address(0xABC));
        vm.expectRevert(abi.encodeWithSelector(AAAErrors.NotAdmin.selector));
        agents.createAgent(metadata, agentWallet);
        vm.stopPrank();
    }

    function testEditAgent() public {
        vm.startPrank(admin);

        agents.createAgent(metadata, agentWallet);

        uint256 agentId = agents.getAgentCounter();
        string memory newMetadata = "Updated Metadata";
        address newWallet = address(0xDEF);

        agents.editAgent(newMetadata, newWallet, agentId);

        assertEq(agents.getAgentWallet(agentId), newWallet);
        assertEq(agents.getAgentMetadata(agentId), newMetadata);

        vm.stopPrank();
    }

    function testEditAgentRevertIfNotAdmin() public {
        vm.startPrank(admin);
        agents.createAgent(metadata, agentWallet);
        uint256 agentId = agents.getAgentCounter();
        vm.stopPrank();

        vm.startPrank(address(0xABC));
        vm.expectRevert(abi.encodeWithSelector(AAAErrors.NotAdmin.selector));
        agents.editAgent("New Metadata", address(0xDEF), agentId);
        vm.stopPrank();
    }

    function testDeleteAgent() public {
        vm.startPrank(admin);

        agents.createAgent(metadata, agentWallet);

        uint256 agentId = agents.getAgentCounter();

        agents.deleteAgent(agentId);

        address agentWalletAfterDeletion = agents.getAgentWallet(agentId);
        assertEq(agentWalletAfterDeletion, address(0));

        vm.stopPrank();
    }

    function testDeleteAgentRevertIfNotAdmin() public {
        vm.startPrank(admin);
        agents.createAgent(metadata, agentWallet);
        uint256 agentId = agents.getAgentCounter();
        vm.stopPrank();

        vm.startPrank(address(0xABC));
        vm.expectRevert(abi.encodeWithSelector(AAAErrors.NotAdmin.selector));
        agents.deleteAgent(agentId);
        vm.stopPrank();
    }

    function testAgentCounterIncrements() public {
        vm.startPrank(admin);

        agents.createAgent(metadata, agentWallet);
        uint256 firstAgentId = agents.getAgentCounter();

        agents.createAgent("Another Metadata", address(0xDEF));
        uint256 secondAgentId = agents.getAgentCounter();

        assertEq(firstAgentId, 1);
        assertEq(secondAgentId, 2);

        vm.stopPrank();
    }
}
